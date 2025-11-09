/**
 * Game state management using Zustand
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { GameState, GameConfig, Message, Player } from '@/types/game';
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

/**
 * Game store state
 */
interface GameStore {
  gameState: GameState | null;
  isProcessing: boolean;
  apiKey: string;
  lastError: string | null;

  // Actions
  setApiKey: (key: string) => void;
  startGame: (config: GameConfig) => void;
  resetGame: () => void;
  executeNextStep: () => Promise<void>;
  retryCurrentStep: () => Promise<void>;
  clearError: () => void;
  updatePlayerPersonality: (playerId: string, personality: string) => void;

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
    set({ gameState, isProcessing: false });
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
   * Retry current step after error
   */
  retryCurrentStep: async () => {
    set({ lastError: null });
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
      // Handle setup phase - game starts with day phase
      if (gameState.phase === 'setup') {
        gameState.phase = 'day';
        gameState.round = 1;
        gameState.currentPlayerIndex = 0;
        gameState.messages.push(
          addMessage(gameState, '旁白', '第 1 回合开始。天亮了，请大家发言！', 'system', 'all'),
        );
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
            `游戏结束！${winner === 'werewolf' ? '狼人阵营' : '村民阵营'}获胜！`,
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
  advanceNightPhase: () => {
    const { gameState } = get();
    if (!gameState || gameState.phase !== 'night') return;

    if (gameState.nightPhase === 'seer') {
      // Seer phase ended, go to werewolf discuss
      gameState.nightPhase = 'werewolf-discuss';
      gameState.currentPlayerIndex = 0;
      gameState.messages.push(
        addMessage(gameState, '旁白', '狼人请开始讨论今晚的目标', 'system', 'werewolf'),
      );
    } else if (gameState.nightPhase === 'werewolf-discuss') {
      // Werewolf discuss ended, go to werewolf vote
      gameState.nightPhase = 'werewolf-vote';
      gameState.currentPlayerIndex = 0;
      gameState.messages.push(
        addMessage(gameState, '旁白', '狼人请投票选择击杀目标', 'system', 'werewolf'),
      );
    } else if (gameState.nightPhase === 'werewolf-vote') {
      // All night phases completed, advance to day
      get().advanceToNextPhase();
      return;
    }

    set({ gameState: { ...gameState } });
  },

  /**
   * Advance to next phase
   */
  advanceToNextPhase: () => {
    const { gameState } = get();
    if (!gameState) return;

    if (gameState.phase === 'day') {
      // Day phase ended, go to voting
      gameState.phase = 'voting';
      gameState.currentPlayerIndex = 0;
      gameState.votes = [];
      gameState.messages.push(
        addMessage(gameState, '旁白', '讨论结束。现在开始投票！', 'system', 'all'),
      );
    } else if (gameState.phase === 'voting') {
      // Voting phase ended, process votes and go to night
      const { eliminated, message } = processVoting(gameState);
      if (eliminated) {
        const player = gameState.players.find((p) => p.id === eliminated.id);
        if (player) {
          player.isAlive = false;
        }
      }
      gameState.messages.push(message);
      gameState.phase = 'night';
      gameState.nightPhase = 'seer';  // Start with seer phase
      gameState.currentPlayerIndex = 0;
      gameState.nightVotes = [];  // Clear night votes for new night

      // Check if seer is alive
      const seer = gameState.players.find((p) => p.role === 'seer' && p.isAlive);
      if (seer) {
        gameState.messages.push(
          addMessage(gameState, '旁白', '夜幕降临... 预言家请睁眼', 'system', 'all'),
        );
      } else {
        // Skip to werewolf discuss if seer is dead
        gameState.nightPhase = 'werewolf-discuss';
        gameState.messages.push(
          addMessage(gameState, '旁白', '夜幕降临... 狼人请睁眼', 'system', 'all'),
        );
      }
    } else if (gameState.phase === 'night') {
      // Night phase ended, process night actions and go to day
      const { killedPlayer, message } = processNightPhase(gameState);
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
      gameState.messages.push(
        addMessage(gameState, '旁白', `第 ${gameState.round} 回合。天亮了！`, 'system', 'all'),
      );
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
      if (gameState.nightPhase === 'seer') {
        // Only seer acts
        alivePlayers = alivePlayers.filter((p) => p.role === 'seer');
      } else if (gameState.nightPhase === 'werewolf-discuss' || gameState.nightPhase === 'werewolf-vote') {
        // Only werewolves act
        alivePlayers = alivePlayers.filter((p) => p.role === 'werewolf');
      }
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
        if (gameState.nightPhase === 'seer' && currentPlayer.role === 'seer') {
          visibility = 'seer';  // Only seer can see their check
        } else if (currentPlayer.role === 'werewolf') {
          visibility = 'werewolf'; // Only werewolves can see night discussion
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

      set({ gameState: { ...gameState }, isProcessing: false, lastError: null });
    } catch (error) {
      console.error(`Error executing action for ${currentPlayer.name}:`, error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      set({
        isProcessing: false,
        lastError: `${currentPlayer.name} 的 AI 请求失败: ${errorMessage}`,
      });
    }
  },
}),
    {
      name: 'werewolf-game-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        gameState: state.gameState,
        apiKey: state.apiKey,
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

  // Filter messages based on visibility
  const visibleMessages = messages.filter((m) => {
    if (m.visibility === 'all') return true;
    if (m.visibility === 'werewolf' && player.role === 'werewolf') return true;
    if (m.visibility === 'seer' && player.role === 'seer') return true;
    if (typeof m.visibility === 'object' && m.visibility.player === player.name) return true;
    // AI can see its own thinking
    if (m.type === 'thinking' && m.from === player.name) return true;
    return false;
  });

  const recentMessages = visibleMessages
    .filter((m) => m.type !== 'prompt')  // Exclude prompt messages
    .slice(-50);

  const roleNames: Record<string, string> = {
    werewolf: '狼人',
    villager: '村民',
    seer: '预言家',
    witch: '女巫',
    hunter: '猎人',
  };

  const phaseNames: Record<string, string> = {
    setup: '准备',
    night: '夜晚',
    day: '白天',
    voting: '投票',
    end: '结束',
  };

  // Get teammate information for werewolves
  const werewolfTeammates = player.role === 'werewolf'
    ? players.filter((p) => p.role === 'werewolf' && p.name !== player.name)
    : [];

  const roleInstructions = getRoleInstructionsForDisplay(player.role, phase, gameState.nightPhase);

  // Get phase display name
  let phaseDisplay = phaseNames[phase];
  if (phase === 'night' && gameState.nightPhase) {
    const nightPhaseNames: Record<string, string> = {
      'seer': '夜晚-预言家查验',
      'werewolf-discuss': '夜晚-狼人讨论',
      'werewolf-vote': '夜晚-狼人投票',
    };
    phaseDisplay = nightPhaseNames[gameState.nightPhase] || phaseDisplay;
  }

  return `【AI Prompt】
玩家：${player.name}
身份：${roleNames[player.role]}
阶段：${phaseDisplay}
回合：${round}
存活玩家：${alivePlayers.map((p) => p.name).join('、')}
${werewolfTeammates.length > 0 ? `狼人队友：${werewolfTeammates.map((p) => p.name).join('、')}` : ''}

${roleInstructions}

最近的对话：
${recentMessages.map((m) => `${m.from}: ${m.content}`).join('\n')}

${getActionPrompt(phase, gameState.nightPhase, player.role)}`;
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
  if (gameState.nightPhase === 'seer' && currentPlayer.role === 'seer') {
    recordSeerCheck(gameState, targetName, targetPlayer);
  } else if (gameState.nightPhase === 'werewolf-vote' && currentPlayer.role === 'werewolf') {
    recordWerewolfVote(gameState, currentPlayer, targetName, targetPlayer);
  }
}

/**
 * Record seer check
 */
function recordSeerCheck(
  gameState: GameState,
  targetName: string,
  targetPlayer: Player | undefined,
): void {
  if (!targetPlayer?.isAlive) return;

  gameState.seerChecks.push({
    round: gameState.round,
    target: targetName,
    role: targetPlayer.role,
  });

  const roleNames: Record<string, string> = {
    werewolf: '狼人',
    villager: '村民',
    seer: '预言家',
    witch: '女巫',
    hunter: '猎人',
  };

  gameState.messages.push(
    addMessage(
      gameState,
      '旁白',
      `查验结果：${targetName} 是 ${roleNames[targetPlayer.role]}`,
      'system',
      'seer',
    ),
  );
}

/**
 * Record werewolf vote
 */
function recordWerewolfVote(
  gameState: GameState,
  currentPlayer: Player,
  targetName: string,
  targetPlayer: Player | undefined,
): void {
  if (targetPlayer?.isAlive && targetPlayer.role !== 'werewolf') {
    gameState.nightVotes.push({ from: currentPlayer.name, target: targetName });
  }
}

/**
 * Get role instructions for display in prompt
 */
function getRoleInstructionsForDisplay(role: string, phase: string, nightPhase?: string): string {
  if (role === 'werewolf') {
    if (phase === 'night') {
      if (nightPhase === 'werewolf-discuss') {
        return `【狼人身份 - 讨论阶段】
你是狼人。现在是夜晚，只有狼人能看到这些对话。
⚠️ 当前阶段：讨论今晚的击杀目标
- 和其他狼人交流你的想法
- 分析哪个玩家威胁最大
- 可以提出建议但不要做最终决定
- 保持 1-2 句话即可`;
      } else if (nightPhase === 'werewolf-vote') {
        return `【狼人身份 - 投票阶段】
你是狼人。现在需要投票决定击杀目标。
⚠️ 重要：投票选择今晚要杀的人
- 根据刚才的讨论做出决定
- 只回复要杀的玩家名字（如：Alice）
- 不要解释原因，不要说其他内容`;
      }
    }
    return `【狼人身份 - ${phase === 'day' ? '白天' : '投票'}阶段】
你是狼人，但必须伪装成村民。
⚠️ 重要规则：
- 绝不暴露自己是狼人
- 绝不暴露其他狼人的身份
- 像村民一样说话和投票
- 可以指控真正的村民，转移注意力`;
  }
  if (role === 'seer') {
    if (phase === 'night' && nightPhase === 'seer') {
      return `【预言家身份 - 查验阶段】
你是预言家。现在是夜晚查验时间。
⚠️ 重要：选择一个玩家查验身份
- 根据白天的讨论选择最可疑的人
- 只回复要查验的玩家名字（如：Alice）
- 不要解释原因，不要说其他内容
- 查验结果只有你能看到`;
    }
    return '你是预言家。每晚可以查验一名玩家的身份。谨慎使用你的知识，避免过早暴露。';
  }
  if (role === 'villager') {
    return '你是村民。通过讨论和投票找出狼人。仔细观察每个人的发言和行为。';
  }
  return '';
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
    if (nightPhase === 'seer' && role === 'seer') {
      return '请选择要查验的玩家（只回复名字）';
    }
    if (nightPhase === 'werewolf-discuss' && role === 'werewolf') {
      return '请和队友讨论今晚的目标';
    }
    if (nightPhase === 'werewolf-vote' && role === 'werewolf') {
      return '请投票选择今晚要杀的玩家（只回复名字）';
    }
  }
  return '';
}
