/**
 * Game state management using Zustand
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { GameState, GameConfig, Message, Player, SavedGame, Clue } from '@/types/game';
import {
  createGame,
  checkWinCondition,
  processNightPhase,
  processVoting,
  addMessage,
  getPlayerByName,
  handleDeathTriggers,
  initSecretMeetingPhase,
  setSecretMeetingParticipants as engineSetSecretMeetingParticipants,
  skipSecretMeeting as engineSkipSecretMeeting,
  completeSecretMeeting,
  generateGameEvent,
  advancePhase,
} from '@/lib/game-engine';
import { getAIResponse, buildPrompt, DEFAULT_API_URL, type AIReply } from '@/lib/deepseek';
import { formatSuspicion } from '@/lib/ai/view';
import { getActingPlayers } from '@/lib/actors';
import { buildPrologueMessages } from '@/lib/story-text';
import { getInitialClues } from '@/lib/clues-data';

/**
 * Game store state
 */
interface GameStore {
  gameState: GameState | null;
  isProcessing: boolean;
  apiKey: string;
  apiUrl: string;
  lastError: string | null;
  retryCount: number;  // Current retry attempt count
  clues: Clue[];  // Collected clues/documents

  // Phase transition animation
  showTransition: boolean;
  transitionPhase: GameState['phase'] | null;
  transitionRound: number;

  // Secret meeting UI control
  showSecretMeetingSelector: boolean;

  // Auto execution control
  isAutoExecuting: boolean;

  // Actions
  setApiKey: (key: string) => void;
  setApiUrl: (url: string) => void;
  startGame: (config: GameConfig) => void;
  resetGame: () => void;
  executeNextStep: () => Promise<void>;
  executePhaseAuto: () => Promise<void>;
  stopAutoExecution: () => void;
  retryCurrentStep: () => Promise<void>;
  retryLastAIResponse: () => Promise<void>;
  clearError: () => void;
  updatePlayerPersonality: (playerId: string, personality: string) => void;

  // Clue actions
  addClue: (clue: Clue) => void;
  markClueAsRead: (clueId: string) => void;

  // Save/Load actions
  saveGame: (name: string) => SavedGame;
  loadGame: (id: string) => boolean;
  deleteGame: (id: string) => void;
  getSavedGames: () => SavedGame[];

  // Transition actions
  triggerTransition: (phase: GameState['phase'], round: number) => void;
  completeTransition: () => void;

  // Emotional state changes
  clearPendingStateChanges: () => void;

  // Secret meeting actions
  openSecretMeetingSelector: () => void;
  closeSecretMeetingSelector: () => void;
  setSecretMeetingParticipants: (participants: [string, string]) => void;
  skipSecretMeeting: () => void;
  executeSecretMeeting: () => Promise<void>;

  // Event actions
  generateEvent: () => void;

  // Internal actions
  advanceToNextPhase: () => void;
  advanceNightPhase: () => void;
  executeCurrentPlayerAction: () => Promise<void>;
}

// 本地 .env.local 里的 DeepSeek key（不进 git，线上构建没有这个值）
const ENV_API_KEY = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY ?? '';

/**
 * Create game store with persistence
 */
export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
  gameState: null,
  isProcessing: false,
  apiKey: ENV_API_KEY,
  apiUrl: DEFAULT_API_URL,
  lastError: null,
  retryCount: 0,
  clues: [],

  // Phase transition
  showTransition: false,
  transitionPhase: null,
  transitionRound: 0,

  // Secret meeting UI control
  showSecretMeetingSelector: false,

  // Auto execution control
  isAutoExecuting: false,

  /**
   * Set DeepSeek API key
   */
  setApiKey: (key: string) => {
    set({ apiKey: key });
  },

  /**
   * Set DeepSeek API URL
   */
  setApiUrl: (url: string) => {
    set({ apiUrl: url });
  },

  /**
   * Start new game
   */
  startGame: (config: GameConfig) => {
    const gameState = createGame(config);
    const initialClues = getInitialClues();
    set({
      gameState,
      isProcessing: false,
      clues: initialClues,
      lastError: null,
      retryCount: 0,
    });
  },

  /**
   * Reset game
   */
  resetGame: () => {
    set({ gameState: null, isProcessing: false, lastError: null });
  },

  /**
   * Clear error message
   */
  clearError: () => {
    set({ lastError: null });
  },

  /**
   * Update player personality
   */
  updatePlayerPersonality: (playerId: string, personality: string) => {
    const { gameState } = get();
    if (!gameState) return;

    const player = gameState.players.find((p) => p.id === playerId);
    if (player) {
      player.personality = personality;
      set({ gameState: { ...gameState } });
    }
  },

  /**
   * Add a new clue to the collection
   */
  addClue: (clue: Clue) => {
    const { clues } = get();
    set({ clues: [...clues, clue] });
  },

  /**
   * Mark a clue as read
   */
  markClueAsRead: (clueId: string) => {
    const { clues } = get();
    const updatedClues = clues.map((clue) =>
      clue.id === clueId ? { ...clue, isRead: true } : clue
    );
    set({ clues: updatedClues });
  },

  /**
   * Trigger phase transition animation
   */
  triggerTransition: (phase: GameState['phase'], round: number) => {
    set({
      showTransition: true,
      transitionPhase: phase,
      transitionRound: round,
    });
  },

  /**
   * Complete phase transition (called after animation finishes)
   */
  completeTransition: () => {
    set({
      showTransition: false,
      transitionPhase: null,
      transitionRound: 0,
    });
  },

  /**
   * Clear pending state changes after they've been shown to user
   */
  clearPendingStateChanges: () => {
    const { gameState } = get();
    if (!gameState) return;
    // Ensure pendingStateChanges exists and clear it
    gameState.pendingStateChanges = [];
    set({ gameState: { ...gameState } });
  },

  /**
   * Open secret meeting selector UI
   */
  openSecretMeetingSelector: () => {
    set({ showSecretMeetingSelector: true });
  },

  /**
   * Close secret meeting selector UI
   */
  closeSecretMeetingSelector: () => {
    set({ showSecretMeetingSelector: false });
  },

  /**
   * Set secret meeting participants (user selected)
   */
  setSecretMeetingParticipants: (participants: [string, string]) => {
    const { gameState } = get();
    if (!gameState) return;
    engineSetSecretMeetingParticipants(gameState, participants);
    set({ gameState: { ...gameState } });
  },

  /**
   * Skip secret meeting phase
   */
  skipSecretMeeting: () => {
    const { gameState } = get();
    if (!gameState || !gameState.pendingSecretMeeting) return;

    // Save timing before skipping (which clears pendingSecretMeeting)
    const meetingTiming = gameState.pendingSecretMeeting.timing;

    engineSkipSecretMeeting(gameState);

    // Determine next phase based on timing
    if (meetingTiming === 'before_discussion') {
      gameState.phase = 'day';
      gameState.currentPlayerIndex = 0;
      gameState.messages.push(
        addMessage(gameState, '叙述者', '跳过密会。白天讨论开始。', 'system', 'all')
      );
      set({ gameState: { ...gameState }, isProcessing: false, showSecretMeetingSelector: false });
      get().triggerTransition('day', gameState.round);
    } else if (meetingTiming === 'after_sacrifice') {
      gameState.phase = 'event';
      set({ gameState: { ...gameState }, isProcessing: false, showSecretMeetingSelector: false });
      get().triggerTransition('event', gameState.round);
    }
  },

  /**
   * Execute secret meeting between two players
   */
  executeSecretMeeting: async () => {
    const { gameState, apiKey, apiUrl } = get();
    if (!gameState || !gameState.pendingSecretMeeting?.selectedParticipants) return;

    const [player1Name, player2Name] = gameState.pendingSecretMeeting.selectedParticipants;
    const player1 = getPlayerByName(gameState, player1Name);
    const player2 = getPlayerByName(gameState, player2Name);

    if (!player1 || !player2) return;

    set({ isProcessing: true });

    const messageIds: string[] = [];

    try {
      // Add system message announcing the secret meeting
      const meetingStartMsg = addMessage(
        gameState,
        '叙述者',
        `${player1.name} 和 ${player2.name} 在暗处进行了一次私密的交谈...\n\n（此对话仅存在于两人的记忆中）`,
        'system',
        { secretMeeting: [player1.name, player2.name] },
      );
      gameState.messages.push(meetingStartMsg);
      messageIds.push(meetingStartMsg.id);

      // Build and record Player 1's prompt for transparency
      const fullPrompt1 = buildPrompt(player1, gameState);
      const promptMsg1 = addMessage(
        gameState,
        `${player1.name} (神谕)`,
        fullPrompt1,
        'prompt',
        { secretMeeting: [player1.name, player2.name] },
      );
      gameState.messages.push(promptMsg1);
      messageIds.push(promptMsg1.id);

      // Player 1 speaks
      const response1 = await getAIResponse(player1, gameState, {
        apiKey,
        apiUrl,
        onRetry: (info) => {
          set({
            lastError: `${player1.name} 请求失败，正在重试 (${info.attempt}/${info.maxRetries})...\n原因: ${info.reason}\n等待 ${(info.delay / 1000).toFixed(1)}秒 后重试`,
          });
        },
      });
      const { thinking: thinking1, speech: speech1 } = response1;
      appendTrace(promptMsg1, response1.trace);

      if (thinking1) {
        const thinkingMsg1 = addMessage(
          gameState,
          player1.name,
          noteThinking(gameState, player1, response1),
          'thinking',
          { player: player1.name },  // Thinking is private, only visible to the player themselves
        );
        gameState.messages.push(thinkingMsg1);
        messageIds.push(thinkingMsg1.id);
      }

      const speechMsg1 = addMessage(
        gameState,
        player1.name,
        speech1,
        'secret',
        { secretMeeting: [player1.name, player2.name] },
      );
      gameState.messages.push(speechMsg1);
      messageIds.push(speechMsg1.id);

      // Build and record Player 2's prompt for transparency
      const fullPrompt2 = buildPrompt(player2, gameState);
      const promptMsg2 = addMessage(
        gameState,
        `${player2.name} (神谕)`,
        fullPrompt2,
        'prompt',
        { secretMeeting: [player1.name, player2.name] },
      );
      gameState.messages.push(promptMsg2);
      messageIds.push(promptMsg2.id);

      // Player 2 responds
      const response2 = await getAIResponse(player2, gameState, {
        apiKey,
        apiUrl,
        onRetry: (info) => {
          set({
            lastError: `${player2.name} 请求失败，正在重试 (${info.attempt}/${info.maxRetries})...\n原因: ${info.reason}\n等待 ${(info.delay / 1000).toFixed(1)}秒 后重试`,
          });
        },
      });
      const { thinking: thinking2, speech: speech2 } = response2;
      appendTrace(promptMsg2, response2.trace);

      if (thinking2) {
        const thinkingMsg2 = addMessage(
          gameState,
          player2.name,
          noteThinking(gameState, player2, response2),
          'thinking',
          { player: player2.name },  // Thinking is private, only visible to the player themselves
        );
        gameState.messages.push(thinkingMsg2);
        messageIds.push(thinkingMsg2.id);
      }

      const speechMsg2 = addMessage(
        gameState,
        player2.name,
        speech2,
        'secret',
        { secretMeeting: [player1.name, player2.name] },
      );
      gameState.messages.push(speechMsg2);
      messageIds.push(speechMsg2.id);

      // Save timing before completing (which clears pendingSecretMeeting)
      const meetingTiming = gameState.pendingSecretMeeting.timing;

      // Complete the meeting
      completeSecretMeeting(gameState, messageIds);

      // Determine next phase based on timing
      if (meetingTiming === 'before_discussion') {
        gameState.phase = 'day';
        gameState.currentPlayerIndex = 0;
        gameState.messages.push(
          addMessage(gameState, '叙述者', '密会结束。白天讨论开始。', 'system', 'all')
        );

        set({
          gameState: { ...gameState },
          isProcessing: false,
          lastError: null,
          showSecretMeetingSelector: false,
        });

        get().triggerTransition('day', gameState.round);
      } else if (meetingTiming === 'after_sacrifice') {
        gameState.phase = 'event';

        set({
          gameState: { ...gameState },
          isProcessing: false,
          lastError: null,
          showSecretMeetingSelector: false,
        });

        get().triggerTransition('event', gameState.round);
      }
    } catch (error) {
      console.error('Secret meeting error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Clean up failed messages
      if (messageIds.length > 0) {
        gameState.messages = gameState.messages.filter(
          (m) => !messageIds.includes(m.id)
        );
      }

      set({
        gameState: { ...gameState },
        isProcessing: false,
        lastError: `密会执行失败: ${errorMessage}`,
        // Keep selector open on error to allow retry
      });
    }
  },

  /**
   * Generate and apply a random game event
   */
  generateEvent: () => {
    const { gameState } = get();
    if (!gameState) return;

    // Generate event
    const event = generateGameEvent(gameState);

    if (event) {
      // Event was generated successfully, message already added to game log
      set({ gameState: { ...gameState } });
    }

    // Change phase before advancing (prevent infinite loop)
    const nextPhase = advancePhase(gameState);
    gameState.phase = nextPhase;
    if (nextPhase === 'night') enterNightPhase(gameState);

    // Trigger phase transition
    if (nextPhase === 'night') {
      get().triggerTransition('night', gameState.round);
    } else if (nextPhase === 'end') {
      get().triggerTransition('end', gameState.round);
    }

    set({ isProcessing: false, gameState: { ...gameState } });
  },

  /**
   * Save current game state
   */
  saveGame: (name: string): SavedGame => {
    const { gameState } = get();
    if (!gameState) {
      throw new Error('No active game to save');
    }

    const savedGame: SavedGame = {
      id: `save-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name,
      state: JSON.parse(JSON.stringify(compactForStorage(gameState))) as GameState, // Deep clone
      savedAt: Date.now(),
    };

    // Get existing saves
    const saves = getSavedGamesFromStorage();
    saves.push(savedGame);

    // Store in localStorage
    localStorage.setItem('werewolf-saved-games', JSON.stringify(saves));

    return savedGame;
  },

  /**
   * Load a saved game
   */
  loadGame: (id: string): boolean => {
    const saves = getSavedGamesFromStorage();
    const savedGame = saves.find((s) => s.id === id);

    if (!savedGame) {
      return false;
    }

    set({
      gameState: JSON.parse(JSON.stringify(savedGame.state)) as GameState, // Deep clone
      isProcessing: false,
      lastError: null,
    });

    return true;
  },

  /**
   * Delete a saved game
   */
  deleteGame: (id: string): void => {
    const saves = getSavedGamesFromStorage();
    const filtered = saves.filter((s) => s.id !== id);
    localStorage.setItem('werewolf-saved-games', JSON.stringify(filtered));
  },

  /**
   * Get all saved games
   */
  getSavedGames: (): SavedGame[] => {
    return getSavedGamesFromStorage();
  },

  /**
   * Retry current step after error (called manually by user or automatically)
   */
  retryCurrentStep: async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { gameState, retryCount } = get();
    if (!gameState) return;

    // Check if we're in secret meeting phase
    if (gameState.phase === 'secret_meeting' && gameState.pendingSecretMeeting?.selectedParticipants) {
      // Retry secret meeting
      set({ gameState: { ...gameState }, lastError: null, retryCount: 0 });
      await get().executeSecretMeeting();
      return;
    }

    // Clean up failed attempt for normal phases
    cleanupFailedAttempt(gameState);

    // Reset retry count when manually retrying
    set({ gameState: { ...gameState }, lastError: null, retryCount: 0 });
    await get().executeCurrentPlayerAction();
  },

  /**
   * Retry last AI response (manually triggered by user)
   * Removes the last AI's messages and re-executes the action
   */
  // eslint-disable-next-line complexity
  retryLastAIResponse: async () => {
    const { gameState, isProcessing } = get();
    if (!gameState || isProcessing) return;

    // Can't retry if no current player or already at the start
    if (gameState.currentPlayerIndex === 0) return;

    // Get the previous player (the one we want to retry)
    const previousPlayerIndex = gameState.currentPlayerIndex - 1;
    const previousPlayer = getActingPlayers(gameState)[previousPlayerIndex];
    if (!previousPlayer) return;

    set({ isProcessing: true, lastError: null });

    // Remove last AI messages (thinking, speech/vote, prompt)
    const initialMessageCount = gameState.messages.length;
    const messagesToKeep = gameState.messages.filter(msg =>
      // 只删这个人在本回合本阶段的消息，之前说过的话保留
      !((msg.from === previousPlayer.name || msg.from === `${previousPlayer.name} (神谕)`) &&
        msg.round === gameState.round && msg.phase === gameState.phase));

    // If no messages were removed, something is wrong
    if (messagesToKeep.length === initialMessageCount) {
      set({ isProcessing: false, lastError: '没有找到可以重试的AI消息' });
      return;
    }

    gameState.messages = messagesToKeep;

    // Remove last vote if in voting phase
    if (gameState.phase === 'voting') {
      const lastVoteIndex = gameState.votes.findIndex(v => v.from === previousPlayer.name);
      if (lastVoteIndex >= 0) {
        gameState.votes.splice(lastVoteIndex, 1);
      }
    }

    // Remove last night action if in night phase
    if (gameState.phase === 'night') {
      // Remove night vote
      const lastNightVoteIndex = gameState.nightVotes.findIndex(v => v.from === previousPlayer.name);
      if (lastNightVoteIndex >= 0) {
        gameState.nightVotes.splice(lastNightVoteIndex, 1);
      }

      // Remove listener check
      if (gameState.nightPhase === 'listener') {
        const lastCheckIndex = gameState.listenerChecks.length - 1;
        if (lastCheckIndex >= 0) {
          gameState.listenerChecks.splice(lastCheckIndex, 1);
        }
      }

      // Remove guard record
      if (gameState.nightPhase === 'guard') {
        const lastGuardIndex = gameState.guardRecords.length - 1;
        if (lastGuardIndex >= 0) {
          gameState.guardRecords.splice(lastGuardIndex, 1);
        }
      }
    }

    // Go back to previous player
    gameState.currentPlayerIndex = previousPlayerIndex;

    // Update state
    set({ gameState: { ...gameState }, retryCount: 0 });

    // Re-execute the action
    await get().executeCurrentPlayerAction();
  },

  /**
   * Execute next step in the game
   */
  executeNextStep: async () => {
    const { gameState, isProcessing } = get();

    if (!gameState || isProcessing || gameState.phase === 'end') return;

    set({ isProcessing: true });

    try {
      // Handle prologue phase - display all story messages and transition to day
      if (gameState.phase === 'prologue') {
        get().advanceToNextPhase();
        set({ gameState: { ...gameState }, isProcessing: false });
        return;
      }

      // Check win condition
      const winner = checkWinCondition(gameState);
      if (winner) {
        gameState.winner = winner;
        gameState.phase = 'end';

        // Add atmospheric ending message based on winner
        const endingMessage = winner === 'marked'
          ? `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n山灵的收割已然完成。\n\n黎明不再降临白烬山口，永夜吞噬了最后的希望。\n血肉献祭，灵魂皈依，收割者的呼唤得到了回应。\n\n这座村庄的故事，就此终结。\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
          : `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n黎明的光芒刺破了永夜。\n\n最后的收割者倒在了祭坛之前，山灵的诅咒终于被打破。\n幸存的羔羊们围聚在一起，泪水与血迹交织。\n\n白烬山口迎来了久违的宁静。\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

        gameState.messages.push(
          addMessage(
            gameState,
            '叙述者',
            endingMessage,
            'system',
          ),
        );
        set({ gameState: { ...gameState }, isProcessing: false });
        return;
      }

      await get().executeCurrentPlayerAction();
    } catch (error) {
      console.error('Execute step error:', error);
      set({ isProcessing: false });
    }
  },

  /**
   * Auto-execute entire phase without manual intervention
   */
  executePhaseAuto: async () => {
    const { gameState, isProcessing, isAutoExecuting } = get();

    if (!gameState || isProcessing || gameState.phase === 'end' || isAutoExecuting) return;

    set({ isAutoExecuting: true });

    try {
      const startingPhase = gameState.phase;
      const startingRound = gameState.round;

      // Helper function to check if should continue
      const shouldContinue = () => {
        const state = get();
        const currentPhase = state.gameState?.phase;
        const currentRound = state.gameState?.round;
        return (
          currentPhase === startingPhase &&
          currentRound === startingRound &&
          state.isAutoExecuting
        );
      };

      // Keep executing until phase changes or game ends
      while (shouldContinue()) {
        await get().executeNextStep();
        await new Promise(resolve => setTimeout(resolve, 100));

        // Check if there was an error
        if (get().lastError) {
          break;
        }
      }
    } catch (error) {
      console.error('Auto execution error:', error);
    } finally {
      set({ isAutoExecuting: false });
    }
  },

  /**
   * Stop auto execution
   */
  stopAutoExecution: () => {
    set({ isAutoExecuting: false });
  },

  /**
   * Advance to next night sub-phase
   */
  // eslint-disable-next-line complexity
  advanceNightPhase: () => {
    const { gameState } = get();
    if (!gameState || gameState.phase !== 'night') return;

    if (gameState.nightPhase === 'listener') {
      // Listener phase ended, go to marked discuss
      gameState.nightPhase = 'marked-discuss';
      gameState.currentPlayerIndex = 0;
      gameState.messages.push(
        addMessage(gameState, '叙述者', '饥饿的呼唤开始了...', 'system', 'marked'),
      );
    } else if (gameState.nightPhase === 'marked-discuss') {
      // Marked discuss ended, go to marked vote
      gameState.nightPhase = 'marked-vote';
      gameState.currentPlayerIndex = 0;
      gameState.messages.push(
        addMessage(gameState, '叙述者', '烙印者请投票选择今晚的猎物', 'system', 'marked'),
      );
    } else if (gameState.nightPhase === 'marked-vote') {
      // Check werewolf votes for ties
      const { isTied, tiedPlayers } = processNightPhase(gameState);

      if (isTied && gameState.revoteRound >= 2) {
        // 分歧太久：饥饿替他们做了决定
        const chosen = tiedPlayers[Math.floor(Math.random() * tiedPlayers.length)];
        gameState.nightVotes = gameState.nightVotes.filter((v) => v.target === chosen);
        gameState.messages.push(
          addMessage(gameState, '叙述者', `争执不下的烙印者被饥饿驱使，扑向了 ${chosen}。`, 'system', 'marked'),
        );
      }

      if (isTied && gameState.revoteRound < 2) {
        // Save night votes to history before clearing for revote
        if (gameState.nightVotes.length > 0) {
          const nightVotesWithRound = gameState.nightVotes.map((vote) => ({
            ...vote,
            round: gameState.round
          }));
          gameState.nightVoteHistory.push(...nightVotesWithRound);
        }

        // Tie - go back to discussion
        gameState.revoteRound += 1;
        gameState.nightPhase = 'marked-discuss';
        gameState.currentPlayerIndex = 0;
        gameState.nightVotes = [];  // Clear votes for new round
        gameState.messages.push(
          addMessage(
            gameState,
            '叙述者',
            `第 ${gameState.revoteRound} 次平票（${tiedPlayers.join('、')}）！烙印者必须重新讨论并达成一致。`,
            'system',
            'marked',
          ),
        );
      } else {
        // Save successful night votes to history
        if (gameState.nightVotes.length > 0) {
          const nightVotesWithRound = gameState.nightVotes.map((vote) => ({
            ...vote,
            round: gameState.round
          }));
          gameState.nightVoteHistory.push(...nightVotesWithRound);
        }

        // Don't clear nightVotes here - they're needed for processNightPhase later
        // They will be cleared when entering the next night phase

        // No tie - proceed to guard phase
        gameState.revoteRound = 0;
        const guard = gameState.players.find((p) => p.role === 'guard' && p.isAlive);
        if (guard) {
          gameState.nightPhase = 'guard';
          gameState.currentPlayerIndex = 0;
          gameState.messages.push(
            addMessage(gameState, '叙述者', '设闩者，选择今晚要守护的人...', 'system', 'guard'),
          );
        } else {
          // No guard - coroner is passive, resolve it and move to day
          resolveCoroner(gameState);
          get().advanceToNextPhase();
          return;
        }
      }
    } else if (gameState.nightPhase === 'guard') {
      resolveCoroner(gameState);
      get().advanceToNextPhase();
      return;
    }

    set({ gameState: { ...gameState } });
  },

  /**
   * Advance to next phase
   */
  // eslint-disable-next-line complexity
  advanceToNextPhase: () => {
    const { gameState } = get();
    if (!gameState) return;

    if (gameState.phase === 'prologue') {
      // Prologue: Display all story messages at once and transition to day
      // Count roles for the final message
      const roleCounts = gameState.players.reduce(
        (acc, player) => {
          acc[player.role] = (acc[player.role] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      const storyMessages = buildPrologueMessages(roleCounts);

      // Add all messages
      storyMessages.forEach((msg) => {
        gameState.messages.push(
          addMessage(gameState, msg.from, msg.content, 'system', 'all')
        );
      });

      // Transition to secret meeting phase with animation (before first day discussion)
      gameState.phase = 'secret_meeting';
      gameState.round = 1;
      gameState.currentPlayerIndex = 0;

      // Initialize secret meeting phase
      initSecretMeetingPhase(gameState, 'before_discussion');

      // Trigger transition animation
      get().triggerTransition('secret_meeting', 1);
    } else if (gameState.phase === 'secret_meeting') {
      // Secret meeting phase transition is handled in executeSecretMeeting
      // This shouldn't be called during secret_meeting phase normally
      return;
    } else if (gameState.phase === 'day') {
      // Day phase ended, go to voting
      gameState.phase = 'voting';
      gameState.currentPlayerIndex = 0;
      gameState.votes = [];
      gameState.messages.push(
        addMessage(gameState, '叙述者', '讨论结束。现在开始投票！', 'system', 'all'),
      );

      // Trigger transition animation
      get().triggerTransition('voting', gameState.round);
    } else if (gameState.phase === 'voting') {
      // Voting phase ended, process votes and check for ties
      const { eliminated, message, isTied, tiedPlayers } = processVoting(gameState);
      gameState.messages.push(message);

      // Save votes to history before processing
      if (gameState.votes.length > 0) {
        const votesWithRound = gameState.votes.map((vote) => ({
          ...vote,
          round: gameState.round
        }));
        gameState.voteHistory.push(...votesWithRound);
      }

      const phaseBefore = gameState.phase;
      handleDayVotingResult(gameState, eliminated, isTied, tiedPlayers);

      // 献祭之后：已分胜负就交给下一步结算，否则进入献祭后的密会 → 事件 → 夜晚
      if (phaseBefore === 'voting' && gameState.phase === 'voting' && checkWinCondition(gameState)) {
        gameState.phase = 'event';
      } else if (phaseBefore === 'voting' && gameState.phase === 'voting') {
        gameState.phase = 'secret_meeting';
        initSecretMeetingPhase(gameState, 'after_sacrifice');
        get().triggerTransition('secret_meeting', gameState.round);
      }
    } else if (gameState.phase === 'event') {
      // Event phase - auto-generate and complete
      get().generateEvent();
      // generateEvent will call advanceToNextPhase, so return here
      return;
    } else if (gameState.phase === 'night') {
      // Night phase ended, process night actions and go to day
      const { killedPlayer, message, isTied } = processNightPhase(gameState);

      // Only process kill if not tied (tie is handled in advanceNightPhase)
      if (!isTied) {
        const phaseBefore = gameState.phase;
        handleNightKillResult(gameState, killedPlayer, message);

        // Trigger transition to secret meeting (before next day discussion)
        if (phaseBefore === 'night' && (gameState.phase as string) === 'day') {
          // Instead of going directly to day, go to secret meeting first
          gameState.phase = 'secret_meeting';
          initSecretMeetingPhase(gameState, 'before_discussion');
          get().triggerTransition('secret_meeting', gameState.round);
        }
      }
    }

    set({ gameState: { ...gameState } });
  },

  /**
   * Execute current player's action
   */
  // eslint-disable-next-line complexity
  executeCurrentPlayerAction: async () => {
    const { gameState, apiKey, apiUrl } = get();
    if (!gameState) return;

    const alivePlayers = getActingPlayers(gameState);

    // If all players in current phase have acted, advance to next phase
    if (gameState.currentPlayerIndex >= alivePlayers.length) {
      if (gameState.phase === 'night') {
        get().advanceNightPhase();
      } else {
        get().advanceToNextPhase();
      }
      set({ isProcessing: false });
      return;
    }

    const currentPlayer = alivePlayers[gameState.currentPlayerIndex];

    try {
      // Determine message visibility based on phase and role
      let visibility: Message['visibility'] = 'all';
      if (gameState.phase === 'night') {
        if (gameState.nightPhase === 'listener' && currentPlayer.role === 'listener') {
          visibility = 'listener';  // Only listener can see their check
        } else if (gameState.nightPhase === 'guard' && currentPlayer.role === 'guard') {
          visibility = 'guard';  // Only guard can see their guard action
        } else if (currentPlayer.role === 'marked') {
          visibility = 'marked'; // Only marked can see night discussion
        }
      }

      set({ gameState: { ...gameState } });

      // Build and record full prompt for transparency
      const promptMsg = addMessage(
        gameState,
        `${currentPlayer.name} (神谕)`,
        buildPrompt(currentPlayer, gameState),
        'prompt',
        { player: currentPlayer.name },
      );
      gameState.messages.push(promptMsg);

      // Get AI response
      const response = await getAIResponse(currentPlayer, gameState, {
        apiKey,
        apiUrl,
        onRetry: (info) => {
          set({
            lastError: `${currentPlayer.name} 请求失败，正在重试 (${info.attempt}/${info.maxRetries})...\n原因: ${info.reason}\n等待 ${(info.delay / 1000).toFixed(1)}秒 后重试`,
          });
        },
      });

      const { thinking, speech, target } = response;
      appendTrace(promptMsg, response.trace);

      // Add thinking message (only visible to the player itself and user)
      if (thinking) {
        gameState.messages.push(
          addMessage(
            gameState,
            currentPlayer.name,
            noteThinking(gameState, currentPlayer, response),
            'thinking',
            { player: currentPlayer.name },
          ),
        );
      }

      // Add speech/vote message
      if (target) {
        // 选人的一步：消息内容就是目标名字，投票记在 votes / voteHistory 里
        gameState.messages.push(
          addMessage(gameState, currentPlayer.name, target, gameState.phase === 'voting' ? 'vote' : 'speech', visibility),
        );
        recordAction(gameState, currentPlayer, target);
      } else {
        // Add speech message for other phases
        gameState.messages.push(
          addMessage(gameState, currentPlayer.name, speech, 'speech', visibility),
        );
      }

      // Move to next player only on success
      gameState.currentPlayerIndex += 1;

      set({ gameState: { ...gameState }, isProcessing: false, lastError: null, retryCount: 0 });
    } catch (error) {
      console.error(`Error executing action for ${currentPlayer.name}:`, error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      const { retryCount } = get();
      const maxRetries = 3;

      // Auto retry with exponential backoff (max 10 times)
      if (retryCount < maxRetries) {
        const nextRetryCount = retryCount + 1;
        // Exponential backoff: 1s, 2s, 4s, 8s, 16s, 32s...
        const delayMs = Math.min(1000 * Math.pow(2, retryCount), 32000);

        console.log(`Auto-retrying (${nextRetryCount}/${maxRetries}) after ${delayMs}ms...`);

        // Clean up failed attempt
        cleanupFailedAttempt(gameState);

        set({
          gameState: { ...gameState },
          isProcessing: true,
          lastError: `${currentPlayer.name} 请求失败，${(delayMs / 1000).toFixed(0)}秒后自动重试 (${nextRetryCount}/${maxRetries})...`,
          retryCount: nextRetryCount,
        });

        // Retry after delay
        setTimeout(() => {
          void get().executeCurrentPlayerAction();
        }, delayMs);
      } else {
        // Max retries reached, show error to user
        set({
          isProcessing: false,
          lastError: `${currentPlayer.name} 的 AI 请求失败 (已重试${maxRetries}次): ${errorMessage}`,
          retryCount: 0,
        });
      }
    }
  },
}),
    {
      name: 'werewolf-game-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        gameState: state.gameState && compactForStorage(state.gameState),
        apiKey: state.apiKey,
        clues: state.clues,
      }),
      onRehydrateStorage: () => (state) => {
        // 换掉以前存下的 Gemini key（AIza 开头），用本地配置的 DeepSeek key
        if (state && (!state.apiKey || state.apiKey.startsWith('AIza'))) state.apiKey = ENV_API_KEY;
        // Ensure pendingStateChanges exists in rehydrated state
        if (state?.gameState && !state.gameState.pendingStateChanges) {
          state.gameState.pendingStateChanges = [];
        }
      },
    },
  ),
);

/**
 * 记下这次的怀疑名单（下次决策会看到），并把它接在心里话后面一起显示
 */
function noteThinking(gameState: GameState, player: Player, reply: AIReply): string {
  if (!reply.suspicion.length) return reply.thinking;
  gameState.suspicions = { ...gameState.suspicions, [player.name]: reply.suspicion };
  return `${reply.thinking}\n\n【怀疑名单】\n${formatSuspicion(reply.suspicion)}`;
}

/**
 * 把 AI 这次查阅档案的过程接在它的神谕后面
 */
function appendTrace(promptMsg: Message, trace: string): void {
  if (trace) promptMsg.content += `

━━━━━━━━ 查阅档案 ━━━━━━━━
${trace}`;
}

/**
 * 记录选人动作（目标已由 deepseek.ts 校验为合法）
 */
function recordAction(gameState: GameState, currentPlayer: Player, targetName: string): void {
  const targetPlayer = getPlayerByName(gameState, targetName);
  if (gameState.phase === 'voting') {
    recordDayVote(gameState, currentPlayer, targetName, targetPlayer);
  } else if (gameState.phase === 'night') {
    recordNightAction(gameState, currentPlayer, targetName, targetPlayer);
  }
}

/**
 * Record day vote
 */
function recordDayVote(
  gameState: GameState,
  currentPlayer: Player,
  targetName: string,
  targetPlayer: Player | undefined,
): void {
  if (targetPlayer?.isAlive) {
    gameState.votes.push({ from: currentPlayer.name, target: targetName });
  }
}

/**
 * Record night action
 */
function recordNightAction(
  gameState: GameState,
  currentPlayer: Player,
  targetName: string,
  targetPlayer: Player | undefined,
): void {
  if (gameState.nightPhase === 'listener' && currentPlayer.role === 'listener') {
    recordListenerCheck(gameState, targetName, targetPlayer);
  } else if (gameState.nightPhase === 'marked-vote' && currentPlayer.role === 'marked') {
    recordMarkedVote(gameState, currentPlayer, targetName, targetPlayer);
  } else if (gameState.nightPhase === 'guard' && currentPlayer.role === 'guard') {
    recordGuardAction(gameState, targetName, targetPlayer);
  }
}

/**
 * Record listener check
 */
function recordListenerCheck(
  gameState: GameState,
  targetName: string,
  targetPlayer: Player | undefined,
): void {
  if (!targetPlayer?.isAlive) return;

  const isClean = !isTainted(targetPlayer, gameState.round);

  gameState.listenerChecks.push({
    round: gameState.round,
    target: targetName,
    isClean,
  });

  const factionName = isClean ? '清白' : '污秽';

  gameState.messages.push(
    addMessage(
      gameState,
      '叙述者',
      `倾听结果：${targetName} 的灵魂是 ${factionName} 的`,
      'system',
      'listener',
    ),
  );
}

/**
 * Record marked vote
 */
function recordMarkedVote(
  gameState: GameState,
  currentPlayer: Player,
  targetName: string,
  targetPlayer: Player | undefined,
): void {
  if (targetPlayer?.isAlive && targetPlayer.role !== 'marked') {
    gameState.nightVotes.push({ from: currentPlayer.name, target: targetName });
  }
}

/**
 * Record guard action
 */
function recordGuardAction(
  gameState: GameState,
  targetName: string,
  targetPlayer: Player | undefined,
): void {
  if (!targetPlayer?.isAlive) return;

  // Check if guard can protect this player (not the same as last night)
  if (gameState.lastGuardedPlayer === targetName) {
    gameState.messages.push(
      addMessage(
        gameState,
        '叙述者',
        `你不能连续两晚守护同一个人！守护失败。`,
        'system',
        'guard',
      ),
    );
    return;
  }

  // Record guard action
  gameState.guardRecords.push({
    round: gameState.round,
    target: targetName,
  });

  // Update last guarded player
  gameState.lastGuardedPlayer = targetName;

  gameState.messages.push(
    addMessage(
      gameState,
      '叙述者',
      `你守护了 ${targetName}。门闩已经从外面锁好。`,
      'system',
      'guard',
    ),
  );
}

/**
 * Helper function to handle day voting result
 */
function handleDayVotingResult(
  gameState: GameState,
  eliminated: Player | null,
  isTied: boolean,
  tiedPlayers: string[],
): void {
  if (isTied) {
    if (gameState.isRevote) {
      // Second tie - nobody gets eliminated
      gameState.messages.push(
        addMessage(gameState, '叙述者', '再次平票！本回合不淘汰任何人。', 'system', 'all'),
      );
      // Clear last sacrificed player since no one was eliminated
      gameState.lastSacrificedPlayer = undefined;
      gameState.isRevote = false;
      gameState.tiedPlayers = [];
    } else {
      // First tie - enter revote discussion phase
      gameState.isRevote = true;
      gameState.tiedPlayers = tiedPlayers;
      gameState.phase = 'day';
      gameState.currentPlayerIndex = 0;
      gameState.votes = [];
      gameState.messages.push(
        addMessage(
          gameState,
          '叙述者',
          `平票玩家 ${tiedPlayers.join('、')} 不能发言。其他玩家请进行讨论并投票。`,
          'system',
          'all',
        ),
      );
    }
  } else {
    // No tie - normal elimination
    if (eliminated) {
      const player = gameState.players.find((p) => p.id === eliminated.id);
      if (player) {
        player.isAlive = false;
        recordDeath(gameState, player.name, 'sacrifice');
        // Record sacrificed player for coroner
        gameState.lastSacrificedPlayer = player.name;
        // Trigger emotional state changes for related characters
        handleDeathTriggers(gameState, player.name);
      }
    } else {
      // No one eliminated - clear last sacrificed
      gameState.lastSacrificedPlayer = undefined;
    }
    gameState.isRevote = false;
    gameState.tiedPlayers = [];
  }
}

/**
 * Helper function to handle night kill result
 */
function handleNightKillResult(
  gameState: GameState,
  killedPlayer: Player | null,
  message: Message,
): void {
  if (killedPlayer) {
    const player = gameState.players.find((p) => p.id === killedPlayer.id);
    if (player) {
      player.isAlive = false;
      recordDeath(gameState, player.name, 'night');
      // Trigger emotional state changes for related characters
      handleDeathTriggers(gameState, player.name);
    }
  }
  gameState.messages.push(message);
  gameState.round += 1;
  gameState.phase = 'day';
  gameState.currentPlayerIndex = 0;
  gameState.isRevote = false;
  gameState.tiedPlayers = [];
  gameState.messages.push(
    addMessage(gameState, '叙述者', `第 ${gameState.round} 回合。天亮了！`, 'system', 'all'),
  );

  // On Day 2, reveal heretic existence to marked players and awaken the heretic
  if (gameState.round === 2) {
    const hereticPlayer = gameState.players.find((p) => p.role === 'heretic' && p.isAlive);
    if (hereticPlayer) {
      // Send awakening message to heretic only
      gameState.messages.push(
        addMessage(
          gameState,
          '山灵',
          `【灵魂的堕落】

昨夜，黑暗侵蚀了你的意识。

你感到某种邪恶的力量在你体内苏醒。
你的思想开始扭曲。你的欲望开始改变。

你不再是"人"。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【你堕落成了背誓者】

你的灵魂现在和那些"收割者"一样污秽。
你渴望羔羊的失败。你渴望收割阵营的胜利。

但你不知道收割者是谁。
他们今天会知道"有背誓者存在"，但他们不知道是你。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【你现在的目标】

- 制造混乱，误导羔羊们
- 保护那些收割者（虽然你不知道他们是谁）
- 用你的投票把羔羊引向错误的方向
- 绝不暴露自己

如果被聆心者查验，你会显示为"污秽"。
如果被发现，你会被献祭。那是真正的死亡。

你是孤独的。你是脆弱的。
活下去。帮助收割阵营获胜。`,
          'system',
          { player: hereticPlayer.name },
        ),
      );

      // Send existence notification to marked players
      gameState.messages.push(
        addMessage(
          gameState,
          '山灵',
          `【暗语】

昨夜，你们感受到了某种异样的气息。

有人背叛了"人"。有人的灵魂已经污秽。

但那个人不是你们选中的。那个人是自愿堕落的。

【背誓者】已经出现。TA 的灵魂和你们一样污秽，但 TA 不知道你们是谁，你们也不知道 TA 是谁。

TA 无法参与你们的夜晚狩猎，但 TA 会在白天帮助你们。

寻找 TA。或者利用 TA。`,
          'system',
          'marked',
        ),
      );
    }
  }
}

/**
 * Helper function to enter night phase
 */
function recordDeath(gameState: GameState, name: string, cause: 'night' | 'sacrifice'): void {
  gameState.deathLog = [...(gameState.deathLog ?? []), { name, round: gameState.round, cause }];
}

/**
 * 灵魂是否污秽：背誓者第 2 天才堕落，在此之前仍是清白的
 */
function isTainted(player: Player, round: number): boolean {
  return player.role === 'marked' || (player.role === 'heretic' && round >= 2);
}

/**
 * 食灰者是被动能力：夜晚结束时得知上一次被献祭者的阵营
 */
function resolveCoroner(gameState: GameState): void {
  gameState.nightPhase = 'coroner';
  gameState.currentPlayerIndex = 0;

  const coroner = gameState.players.find((p) => p.role === 'coroner' && p.isAlive);
  const sacrificed = gameState.players.find((p) => p.name === gameState.lastSacrificedPlayer);
  if (!coroner || !sacrificed) return;

  gameState.coronerReports.push({
    round: gameState.round,
    target: sacrificed.name,
    isClean: !isTainted(sacrificed, gameState.round),
  });
  gameState.messages.push(
    addMessage(gameState, '叙述者', `食灰者在梦中品尝了 ${sacrificed.name} 的灵魂...`, 'system', 'coroner'),
  );
}

function enterNightPhase(gameState: GameState): void {
  gameState.phase = 'night';
  gameState.nightPhase = 'listener';
  gameState.currentPlayerIndex = 0;
  gameState.nightVotes = [];
  gameState.isRevote = false;
  gameState.tiedPlayers = [];

  const listener = gameState.players.find((p) => p.role === 'listener' && p.isAlive);
  if (listener) {
    gameState.messages.push(
      addMessage(gameState, '叙述者', '夜幕降临... 寂静山庄陷入黑暗。', 'system', 'all'),
    );
  } else {
    gameState.nightPhase = 'marked-discuss';
    gameState.messages.push(
      addMessage(gameState, '叙述者', '夜幕降临... 饥饿者的时刻到了。', 'system', 'all'),
    );
  }
}

/**
 * Clean up messages and actions from a failed AI attempt
 */
// eslint-disable-next-line complexity
function cleanupFailedAttempt(gameState: GameState): void {
  const currentPlayer = getActingPlayers(gameState)[gameState.currentPlayerIndex];
  if (!currentPlayer) return;

  // Remove all messages from this player in current round/phase
  // Use filter to avoid index shifting issues with splice
  gameState.messages = gameState.messages.filter(msg => {
    // Keep messages that are NOT from current player in current round/phase
    if ((msg.from === currentPlayer.name || msg.from === `${currentPlayer.name} (神谕)`) &&
        msg.round === gameState.round &&
        msg.phase === gameState.phase &&
        (msg.type === 'prompt' || msg.type === 'thinking' || msg.type === 'speech')) {
      // This message should be removed
      return false;
    }
    // Keep all other messages
    return true;
  });

  // Also clean up any votes/actions that might have been recorded
  // Remove day votes from this player
  const dayVoteIndex = gameState.votes.findIndex((v) => v.from === currentPlayer.name);
  if (dayVoteIndex !== -1) {
    gameState.votes.splice(dayVoteIndex, 1);
  }

  // Remove night votes from this player
  const nightVoteIndex = gameState.nightVotes.findIndex((v) => v.from === currentPlayer.name);
  if (nightVoteIndex !== -1) {
    gameState.nightVotes.splice(nightVoteIndex, 1);
  }

  // Remove listener check from this round if this player is listener
  if (currentPlayer.role === 'listener') {
    const listenerCheckIndex = gameState.listenerChecks.findLastIndex(
      (c) => c.round === gameState.round
    );
    if (listenerCheckIndex !== -1) {
      gameState.listenerChecks.splice(listenerCheckIndex, 1);
    }
  }

  // Remove guard record from this round if this player is guard
  if (currentPlayer.role === 'guard') {
    const guardRecordIndex = gameState.guardRecords.findLastIndex(
      (r) => r.round === gameState.round
    );
    if (guardRecordIndex !== -1) {
      gameState.guardRecords.splice(guardRecordIndex, 1);
      // Also reset lastGuardedPlayer if we're removing the record
      gameState.lastGuardedPlayer = gameState.guardRecords[gameState.guardRecords.length - 1]?.target;
    }
  }
}

/**
 * 写进 localStorage 前去掉往回合的完整 prompt（每条几十 KB，提示词查看器会现场重新生成）
 */
function compactForStorage(gameState: GameState): GameState {
  return {
    ...gameState,
    messages: gameState.messages.filter((m) => m.type !== 'prompt' || m.round === gameState.round),
  };
}

/**
 * Helper function to get saved games from localStorage
 */
function getSavedGamesFromStorage(): SavedGame[] {
  try {
    const saved = localStorage.getItem('werewolf-saved-games');
    if (!saved) return [];
    return JSON.parse(saved) as SavedGame[];
  } catch {
    return [];
  }
}
