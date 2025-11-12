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
  getAlivePlayers,
  getPlayerByName,
  handleDeathTriggers,
  initSecretMeetingPhase,
  setSecretMeetingParticipants as engineSetSecretMeetingParticipants,
  skipSecretMeeting as engineSkipSecretMeeting,
  completeSecretMeeting,
  generateGameEvent,
  advancePhase,
} from '@/lib/game-engine';
import { getAIResponse, buildPrompt } from '@/lib/gemini';
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

/**
 * Create game store with persistence
 */
export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
  gameState: null,
  isProcessing: false,
  apiKey: '',
  apiUrl: 'https://generativelanguage.googleapis.com',
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
   * Set Gemini API key
   */
  setApiKey: (key: string) => {
    set({ apiKey: key });
  },

  /**
   * Set Gemini API URL
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
      const { thinking: thinking1, speech: speech1 } = parseAIResponse(response1);

      if (thinking1) {
        const thinkingMsg1 = addMessage(
          gameState,
          player1.name,
          thinking1,
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
      const { thinking: thinking2, speech: speech2 } = parseAIResponse(response2);

      if (thinking2) {
        const thinkingMsg2 = addMessage(
          gameState,
          player2.name,
          thinking2,
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
      state: JSON.parse(JSON.stringify(gameState)) as GameState, // Deep clone
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
    const alivePlayers = getAlivePlayers(gameState);
    const previousPlayer = alivePlayers[previousPlayerIndex];
    if (!previousPlayer) return;

    set({ isProcessing: true, lastError: null });

    // Remove last AI messages (thinking, speech/vote, prompt)
    const initialMessageCount = gameState.messages.length;
    const messagesToKeep = gameState.messages.filter(msg => {
      // Keep all messages except the last AI player's messages
      return msg.from !== previousPlayer.name && msg.from !== `${previousPlayer.name} (神谕)`;
    });

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

      if (isTied) {
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
          // No guard, proceed to coroner phase
          gameState.nightPhase = 'coroner';
          gameState.currentPlayerIndex = 0;
          get().advanceNightPhase(); // Auto-advance coroner phase
          return;
        }
      }
    } else if (gameState.nightPhase === 'guard') {
      // Guard phase ended, go to coroner phase (passive ability)
      gameState.nightPhase = 'coroner';
      gameState.currentPlayerIndex = 0;

      // Coroner is passive - auto-process and move to day
      const coroner = gameState.players.find((p) => p.role === 'coroner' && p.isAlive);
      if (coroner && gameState.lastSacrificedPlayer) {
        // Add coroner report
        const sacrificedPlayer = gameState.players.find((p) => p.name === gameState.lastSacrificedPlayer);
        if (sacrificedPlayer) {
          const isClean = sacrificedPlayer.role !== 'marked' && sacrificedPlayer.role !== 'heretic';
          gameState.coronerReports.push({
            round: gameState.round,
            target: sacrificedPlayer.name,
            isClean,
          });
          gameState.messages.push(
            addMessage(
              gameState,
              '叙述者',
              `食灰者在梦中品尝了 ${sacrificedPlayer.name} 的灵魂...`,
              'system',
              'coroner',
            ),
          );
        }
      }

      // Proceed to day phase
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

      // Add all story messages at once
      const storyMessages = [
        {
          from: '叙述者',
          content: `一份神秘的委托书，将十五个陌生人聚集在一起。

有人为了钱，有人为了逃避，有人为了寻找，有人为了赎罪。他们从伦敦、爱丁堡、曼彻斯特等地出发，在1913年深冬的暴雪前夕，抵达了白烬山口。

委托人承诺：完成任务，每人可得五百英镑——足以改变命运的金额。`,
        },
        {
          from: '叙述者',
          content: `第一天，他们在山口的寂静山庄集合。

第二天，委托人没有出现。取而代之的是，暴风雪如约而至——一场诡异的、不合时节的暴雪，封死了下山的所有道路。

第三天，他们在山庄的地窖里发现了一封遗书。`,
        },
        {
          from: '叙述者',
          content: `遗书是旧主人留下的，字迹潦草，像是在极度恐惧中写成：

"山灵警告：你们之中混入了三个非人者。它们会在夜晚猎杀真正的人类。你们必须在白昼找出这三个非人者并献祭，否则所有人都会死。"

"在收割与羔羊的对抗结束之前，暴风雪永远不会停止。"`,
        },
        {
          from: '叙述者',
          content: `一开始，没有人相信。

有人说这是恶作剧，有人说委托人在戏弄他们。但暴风雪始终没有停止。

第四天、第五天、第六天……食物越来越少，寒冷越来越深。有人开始发烧，有人开始绝望。

这样下去，所有人都会饿死，或冻死。`,
        },
        {
          from: '叙述者',
          content: `今天，是第七天。

在绝望与恐惧的驱使下，他们决定：按照遗书的指示，举行献祭仪式。

无论这是真是假，他们已经没有别的选择。

黎明到来。游戏，正式开始。`,
        },
        {
          from: '叙述者',
          content: `【身份已被烙印】

收割阵营：${roleCounts['marked'] || 0}名烙印者
羔羊阵营：${roleCounts['listener'] || 0}名聆心者、${roleCounts['coroner'] || 0}名食灰者、${roleCounts['twin'] || 0}名共誓者、${roleCounts['guard'] || 0}名设闩者、${roleCounts['innocent'] || 0}名无知者

【角色说明】

▸ 烙印者（收割阵营）
  - 每晚集体投票杀死一名玩家
  - 白天必须伪装成羔羊
  - 目标：消灭所有羔羊

▸ 聆心者（羔羊阵营）
  - 每晚可查验一名玩家是"清白"还是"污秽"
  - 掌握关键信息，但容易成为目标

▸ 食灰者（羔羊阵营）
  - 每次白天献祭后，当晚会得知被献祭者是"清白"还是"污秽"

▸ 共誓者（羔羊阵营）
  - 两名共誓者互相知晓身份
  - 是彼此唯一的绝对信任

▸ 设闩者（羔羊阵营）
  - 每晚可守护一名玩家（不能是自己）
  - 被守护者当晚不会被杀
  - 不能连续两晚守护同一人

▸ 无知者（羔羊阵营）
  - 没有特殊能力
  - 依靠观察和推理找出收割者

天亮了。第一个白天，开始讨论...`,
        },
      ];

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

      // After voting, go to secret meeting (after sacrifice)
      if (phaseBefore === 'voting' && gameState.phase === 'voting') {
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

    // Get active players based on current phase
    let alivePlayers = getAlivePlayers(gameState);

    // Filter players based on night sub-phase
    if (gameState.phase === 'night' && gameState.nightPhase) {
      if (gameState.nightPhase === 'listener') {
        // Only listener acts
        alivePlayers = alivePlayers.filter((p) => p.role === 'listener');
      } else if (gameState.nightPhase === 'marked-discuss' || gameState.nightPhase === 'marked-vote') {
        // Only marked act
        alivePlayers = alivePlayers.filter((p) => p.role === 'marked');
      } else if (gameState.nightPhase === 'guard') {
        // Only guard acts
        alivePlayers = alivePlayers.filter((p) => p.role === 'guard');
      }
    }

    // Filter out tied players during revote discussion
    if (gameState.phase === 'day' && gameState.isRevote && gameState.tiedPlayers.length > 0) {
      alivePlayers = alivePlayers.filter((p) => !gameState.tiedPlayers.includes(p.name));
    }

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
      const fullPrompt = buildPrompt(currentPlayer, gameState);
      gameState.messages.push(
        addMessage(
          gameState,
          `${currentPlayer.name} (神谕)`,
          fullPrompt,
          'prompt',
          { player: currentPlayer.name },
        ),
      );

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

      // Parse thinking and speech
      const { thinking, speech } = parseAIResponse(response);

      // Add thinking message (only visible to the player itself and user)
      if (thinking) {
        gameState.messages.push(
          addMessage(
            gameState,
            currentPlayer.name,
            thinking,
            'thinking',
            { player: currentPlayer.name },
          ),
        );
      }

      // Add speech/vote message
      if (gameState.phase === 'voting') {
        // Add vote message with type 'vote' for voting phase
        gameState.messages.push(
          addMessage(gameState, currentPlayer.name, speech, 'vote', visibility),
        );
        // Record vote using helper function (voting is stored in voteHistory, not messages)
        recordVote(gameState, currentPlayer, speech);
      } else if (gameState.phase === 'night' &&
                 (gameState.nightPhase === 'listener' ||
                  gameState.nightPhase === 'marked-vote' ||
                  gameState.nightPhase === 'guard')) {
        // Night phase actions (listener check, marked vote, guard protect)
        // Add speech message
        gameState.messages.push(
          addMessage(gameState, currentPlayer.name, speech, 'speech', visibility),
        );
        // Record night action
        recordVote(gameState, currentPlayer, speech);
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
      const maxRetries = 10;

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
        gameState: state.gameState,
        apiKey: state.apiKey,
        clues: state.clues,
      }),
      onRehydrateStorage: () => (state) => {
        // Ensure pendingStateChanges exists in rehydrated state
        if (state?.gameState && !state.gameState.pendingStateChanges) {
          state.gameState.pendingStateChanges = [];
        }
      },
    },
  ),
);

/**
 * Parse AI response into thinking and speech parts
 */
function parseAIResponse(response: string): {
  thinking: string;
  speech: string;
} {
  const thinkingMatch = response.match(/【思考】\s*([\s\S]*?)(?=【发言】|$)/);
  const speechMatch = response.match(/【发言】\s*([\s\S]*?)$/);

  const thinking = thinkingMatch?.[1]?.trim() || '';
  const speech = speechMatch?.[1]?.trim() || response.trim();

  return { thinking, speech };
}

/**
 * Extract player name from AI response text
 * Tries to intelligently match player names even if AI added extra text
 */
// eslint-disable-next-line max-depth
function extractPlayerName(text: string, allPlayers: Player[]): string | null {
  const cleanedText = text.trim();

  // Try exact match first
  const exactMatch = allPlayers.find(p => cleanedText === p.name);
  if (exactMatch) return exactMatch.name;

  // Try to find any player name mentioned in the text
  // Sort by name length (descending) to prioritize longer names
  const sortedPlayers = [...allPlayers].sort((a, b) => b.name.length - a.name.length);

  for (const player of sortedPlayers) {
    if (cleanedText.includes(player.name)) {
      return player.name;
    }
  }

  // Try partial match (first or last name)
  for (const player of sortedPlayers) {
    const nameParts = player.name.split('·');
    for (const part of nameParts) {
      if (cleanedText.includes(part) && part.length >= 2) {
        // Additional check: make sure this partial match uniquely identifies the player
        const matchingPlayers = allPlayers.filter(p => p.name.includes(part));
        // eslint-disable-next-line max-depth
        if (matchingPlayers.length === 1) {
          return player.name;
        }
      }
    }
  }

  return null;
}

/**
 * Record vote or action based on player response
 */
function recordVote(
  gameState: GameState,
  currentPlayer: Player,
  response: string,
): void {
  // Try to extract player name intelligently
  const extractedName = extractPlayerName(response, gameState.players);
  const targetName = extractedName || response.trim();
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

  // Check if target is clean (not marked or heretic)
  const isClean = targetPlayer.role !== 'marked' && targetPlayer.role !== 'heretic';

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
      enterNightPhase(gameState);
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
        // Record sacrificed player for coroner
        gameState.lastSacrificedPlayer = player.name;
        // Trigger emotional state changes for related characters
        handleDeathTriggers(gameState, player.name);
      }
    } else {
      // No one eliminated - clear last sacrificed
      gameState.lastSacrificedPlayer = undefined;
    }
    enterNightPhase(gameState);
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
  // Get current player
  let alivePlayers = getAlivePlayers(gameState);
  if (gameState.phase === 'night' && gameState.nightPhase) {
    if (gameState.nightPhase === 'listener') {
      alivePlayers = alivePlayers.filter((p) => p.role === 'listener');
    } else if (gameState.nightPhase === 'marked-discuss' || gameState.nightPhase === 'marked-vote') {
      alivePlayers = alivePlayers.filter((p) => p.role === 'marked');
    } else if (gameState.nightPhase === 'guard') {
      alivePlayers = alivePlayers.filter((p) => p.role === 'guard');
    }
  }
  if (gameState.phase === 'day' && gameState.isRevote && gameState.tiedPlayers.length > 0) {
    alivePlayers = alivePlayers.filter((p) => !gameState.tiedPlayers.includes(p.name));
  }

  const currentPlayer = alivePlayers[gameState.currentPlayerIndex];
  if (!currentPlayer) return;

  // Remove all messages from this player in current round/phase
  // Use filter to avoid index shifting issues with splice
  gameState.messages = gameState.messages.filter(msg => {
    // Keep messages that are NOT from current player in current round/phase
    if (msg.from === currentPlayer.name &&
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
