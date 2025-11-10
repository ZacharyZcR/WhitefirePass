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
} from '@/lib/game-engine';
import { getAIResponse } from '@/lib/gemini';
import { getInitialClues } from '@/lib/clues-data';

/**
 * Game store state
 */
interface GameStore {
  gameState: GameState | null;
  isProcessing: boolean;
  apiKey: string;
  lastError: string | null;
  retryCount: number;  // Current retry attempt count
  clues: Clue[];  // Collected clues/documents

  // Phase transition animation
  showTransition: boolean;
  transitionPhase: GameState['phase'] | null;
  transitionRound: number;

  // Actions
  setApiKey: (key: string) => void;
  startGame: (config: GameConfig) => void;
  resetGame: () => void;
  executeNextStep: () => Promise<void>;
  retryCurrentStep: () => Promise<void>;
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
  lastError: null,
  retryCount: 0,
  clues: [],

  // Phase transition
  showTransition: false,
  transitionPhase: null,
  transitionRound: 0,

  /**
   * Set Gemini API key
   */
  setApiKey: (key: string) => {
    set({ apiKey: key });
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
    const { gameState, retryCount } = get();
    if (!gameState) return;

    // Clean up failed attempt
    cleanupFailedAttempt(gameState);

    // Reset retry count when manually retrying
    set({ gameState: { ...gameState }, lastError: null, retryCount: 0 });
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
        gameState.messages.push(
          addMessage(
            gameState,
            'system',
            `游戏结束！${winner === 'marked' ? '收割阵营' : '羔羊阵营'}获胜！`,
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

      // Transition to day phase with animation
      gameState.phase = 'day';
      gameState.round = 1;
      gameState.currentPlayerIndex = 0;

      // Trigger transition animation
      get().triggerTransition('day', 1);
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

      // Trigger transition if entered night phase
      if (phaseBefore === 'voting' && gameState.phase === 'night') {
        get().triggerTransition('night', gameState.round);
      }
    } else if (gameState.phase === 'night') {
      // Night phase ended, process night actions and go to day
      const { killedPlayer, message, isTied } = processNightPhase(gameState);

      // Only process kill if not tied (tie is handled in advanceNightPhase)
      if (!isTied) {
        const phaseBefore = gameState.phase;
        handleNightKillResult(gameState, killedPlayer, message);

        // Trigger transition to day phase
        if (phaseBefore === 'night' && gameState.phase === 'day') {
          get().triggerTransition('day', gameState.round);
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
    const { gameState, apiKey } = get();
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

      // Get prompt for display
      const prompt = getPromptForDisplay(currentPlayer, gameState);

      // Add prompt message with same visibility as response
      gameState.messages.push({
        id: `prompt-${Date.now()}`,
        type: 'prompt',
        from: currentPlayer.name,
        content: prompt,
        timestamp: Date.now(),
        round: gameState.round,
        phase: gameState.phase,
        visibility,
      });

      set({ gameState: { ...gameState } });

      // Get AI response
      const response = await getAIResponse(currentPlayer, gameState, { apiKey });

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
      const messageType = gameState.phase === 'voting' ? 'vote' : 'speech';
      gameState.messages.push(
        addMessage(gameState, currentPlayer.name, speech, messageType, visibility),
      );

      // Record vote using helper function (use speech part for voting)
      recordVote(gameState, currentPlayer, speech);

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
    },
  ),
);

/**
 * Get prompt text for display
 */
function getPromptForDisplay(
  player: { name: string; role: string },
  gameState: GameState,
): string {
  const { phase, round, messages, players } = gameState;
  const alivePlayers = getAlivePlayers(gameState);

  // Heretics don't know they are heretics until Day 2
  const effectiveRole = (player.role === 'heretic' && round === 1) ? 'innocent' : player.role;

  // Filter messages based on visibility (use actual role for message filtering)
  // eslint-disable-next-line complexity
  const visibleMessages = messages.filter((m) => {
    if (m.visibility === 'all') return true;
    if (m.visibility === 'marked' && player.role === 'marked') return true;
    if (m.visibility === 'listener' && player.role === 'listener') return true;
    if (m.visibility === 'coroner' && player.role === 'coroner') return true;
    if (m.visibility === 'guard' && player.role === 'guard') return true;
    if (m.visibility === 'twins' && player.role === 'twin') return true;
    if (typeof m.visibility === 'object' && m.visibility.player === player.name) return true;
    // AI can see its own thinking
    if (m.type === 'thinking' && m.from === player.name) return true;
    return false;
  });

  const recentMessages = visibleMessages
    .filter((m) => m.type !== 'prompt')  // Exclude prompt messages
    .slice(-20);  // 保留最近20条对话

  const roleNames: Record<string, string> = {
    marked: '烙印者',
    heretic: '背誓者',
    listener: '聆心者',
    coroner: '食灰者',
    twin: '共誓者',
    guard: '设闩者',
    innocent: '无知者',
  };

  const phaseNames: Record<string, string> = {
    setup: '准备',
    night: '夜晚',
    day: '白天',
    voting: '投票',
    end: '结束',
  };

  // Get teammate information for marked (use actual role)
  const markedTeammates = player.role === 'marked'
    ? players.filter((p) => p.role === 'marked' && p.name !== player.name)
    : [];

  // Use effective role for display (heretics see innocent info on day 1)
  const roleInstructions = getRoleInstructionsForDisplay(effectiveRole, phase, gameState.nightPhase);

  // Get phase display name
  let phaseDisplay = phaseNames[phase];
  if (phase === 'night' && gameState.nightPhase) {
    const nightPhaseNames: Record<string, string> = {
      'listener': '夜晚-聆心者查验',
      'marked-discuss': '夜晚-烙印者讨论',
      'marked-vote': '夜晚-烙印者投票',
      'guard': '夜晚-设闩者守护',
      'coroner': '夜晚-食灰者验尸',
    };
    phaseDisplay = nightPhaseNames[gameState.nightPhase] || phaseDisplay;
  }

  return `【AI Prompt】
玩家：${player.name}
身份：${roleNames[effectiveRole]}
阶段：${phaseDisplay}
回合：${round}
存活玩家：${alivePlayers.map((p) => p.name).join('、')}
${markedTeammates.length > 0 ? `烙印者队友：${markedTeammates.map((p) => p.name).join('、')}` : ''}

${roleInstructions}

最近的对话：
${recentMessages.map((m) => `${m.from}: ${m.content}`).join('\n')}

${getActionPrompt(phase, gameState.nightPhase, effectiveRole)}`;
}

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
 * Record vote or action based on player response
 */
function recordVote(
  gameState: GameState,
  currentPlayer: Player,
  response: string,
): void {
  const targetName = response.trim();
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
 * Get role instructions for display in prompt
 */
// eslint-disable-next-line complexity
function getRoleInstructionsForDisplay(role: string, phase: string, nightPhase?: string): string {
  if (role === 'marked') {
    if (phase === 'night') {
      if (nightPhase === 'marked-discuss') {
        return `【烙印者身份 - 讨论阶段】
你是烙印者。饥饿驱使着你。现在只有烙印者能看到这些对话。
【当前阶段】讨论今晚的猎物
- 和其他烙印者交流你的想法
- 分析哪个羔羊威胁最大
- 可以提出建议但不要做最终决定
- 保持 1-2 句话即可`;
      } else if (nightPhase === 'marked-vote') {
        return `【烙印者身份 - 投票阶段】
你是烙印者。现在需要投票决定猎杀目标。
【重要】投票选择今晚要杀的人
- 根据刚才的讨论做出决定
- 只回复要杀的玩家名字（如：诺拉）
- 不要解释原因，不要说其他内容`;
      }
    }
    return `【烙印者身份 - ${phase === 'day' ? '白天' : '投票'}阶段】
你是烙印者，但必须伪装成羔羊。
【重要规则】
- 绝不暴露自己的烙印
- 绝不暴露其他烙印者的身份
- 像羔羊一样恐惧、怀疑、指控
- 把怀疑引向真正的羔羊`;
  }
  if (role === 'listener') {
    if (phase === 'night' && nightPhase === 'listener') {
      return `【聆心者身份 - 查验阶段】
你是聆心者。现在是倾听时间。
【重要】选择一个玩家倾听其灵魂
- 根据白天的讨论选择最可疑的人
- 只回复要查验的玩家名字（如：诺拉）
- 不要解释原因，不要说其他内容
- 查验结果只有你能看到`;
    }
    return '你是聆心者。每晚可以倾听一名玩家的灵魂，判断其清白或污秽。谨慎使用你的知识，避免过早暴露。';
  }
  if (role === 'innocent') {
    return '你是无知者。通过讨论和投票找出烙印者。仔细观察每个人的发言和行为。';
  }
  if (role === 'heretic') {
    return '你是背誓者。你的灵魂与烙印者一样污秽，但你没有任何特殊能力。制造混乱，帮助烙印者获胜。';
  }
  if (role === 'twin') {
    return '你是共誓者。你知道另一个共誓者是谁，你们彼此信任。';
  }
  if (role === 'guard') {
    return '你是设闩者。每晚可以锁死一个人的房门，保护其免受烙印者的袭击。';
  }
  if (role === 'coroner') {
    return '你是食灰者。每晚可以检查被献祭者的真实身份。';
  }
  return '';
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
 * Get action prompt based on phase and role
 */
function getActionPrompt(phase: string, nightPhase: string | undefined, role: string): string {
  if (phase === 'day') {
    return '请发表你的看法';
  }
  if (phase === 'voting') {
    return '请投票选择一个玩家（只回复名字）';
  }
  if (phase === 'night') {
    if (nightPhase === 'listener' && role === 'listener') {
      return '请选择要倾听的玩家（只回复名字）';
    }
    if (nightPhase === 'marked-discuss' && role === 'marked') {
      return '请和队友讨论今晚的目标';
    }
    if (nightPhase === 'marked-vote' && role === 'marked') {
      return '请投票选择今晚要杀的玩家（只回复名字）';
    }
  }
  return '';
}

/**
 * Clean up messages and actions from a failed AI attempt
 */
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
        (msg.type === 'prompt' || msg.type === 'thinking' ||
         msg.type === 'speech' || msg.type === 'vote')) {
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
