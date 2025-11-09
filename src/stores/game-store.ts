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
          addMessage(gameState, 'system', '第 1 回合开始。天亮了，请大家发言！', 'system', 'all'),
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
        addMessage(gameState, 'system', '讨论结束。现在开始投票！', 'system', 'all'),
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
      gameState.currentPlayerIndex = 0;
      gameState.nightVotes = [];  // Clear night votes for new night
      gameState.messages.push(
        addMessage(gameState, 'system', '夜幕降临... 狼人请睁眼', 'system', 'all'),
      );
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
        addMessage(gameState, 'system', `第 ${gameState.round} 回合。天亮了！`, 'system', 'all'),
      );
    }

    set({ gameState: { ...gameState } });
  },

  /**
   * Execute current player's action
   */
  executeCurrentPlayerAction: async () => {
    const { gameState, apiKey } = get();
    if (!gameState) return;

    const alivePlayers = getAlivePlayers(gameState).filter(
      (p) => gameState.phase !== 'night' || p.role === 'werewolf',
    );

    // If all players in current phase have acted, advance to next phase
    if (gameState.currentPlayerIndex >= alivePlayers.length) {
      get().advanceToNextPhase();
      set({ isProcessing: false });
      return;
    }

    const currentPlayer = alivePlayers[gameState.currentPlayerIndex];

    try {
      // Determine message visibility based on phase and role
      let visibility: Message['visibility'] = 'all';
      if (gameState.phase === 'night' && currentPlayer.role === 'werewolf') {
        visibility = 'werewolf'; // Only werewolves can see night discussion
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

  const roleInstructions = getRoleInstructionsForDisplay(player.role, phase);

  return `【AI Prompt】
玩家：${player.name}
身份：${roleNames[player.role]}
阶段：${phaseNames[phase]}
回合：${round}
存活玩家：${alivePlayers.map((p) => p.name).join('、')}
${werewolfTeammates.length > 0 ? `狼人队友：${werewolfTeammates.map((p) => p.name).join('、')}` : ''}

${roleInstructions}

最近的对话：
${recentMessages.map((m) => `${m.from}: ${m.content}`).join('\n')}

${phase === 'day' ? '请发表你的看法（1-2句话）' : phase === 'voting' ? '请投票选择一个玩家（只回复名字）' : phase === 'night' && player.role === 'werewolf' ? '请选择今晚要杀的玩家（只回复名字）' : ''}`;
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
 * Record vote based on player response
 */
function recordVote(
  gameState: GameState,
  currentPlayer: Player,
  response: string,
): void {
  const votedName = response.trim();
  const targetPlayer = getPlayerByName(gameState, votedName);

  // Record day vote
  if (gameState.phase === 'voting') {
    if (targetPlayer?.isAlive) {
      gameState.votes.push({ from: currentPlayer.name, target: votedName });
    }
    return;
  }

  // Record night vote (werewolf only)
  if (gameState.phase === 'night' && currentPlayer.role === 'werewolf') {
    if (targetPlayer?.isAlive && targetPlayer.role !== 'werewolf') {
      gameState.nightVotes.push({ from: currentPlayer.name, target: votedName });
    }
  }
}

/**
 * Get role instructions for display in prompt
 */
function getRoleInstructionsForDisplay(role: string, phase: string): string {
  if (role === 'werewolf') {
    if (phase === 'night') {
      return `【狼人身份 - 夜晚阶段】
你是狼人。现在是夜晚，只有狼人能看到这些对话。
⚠️ 重要：你需要投票选择今晚要杀的人
- 分析白天的讨论，选择威胁最大的玩家
- 优先杀掉发言好、逻辑清晰的玩家
- 只回复要杀的玩家名字（如：Alice）
- 不要解释原因，不要说其他内容`;
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
    return '你是预言家。每晚可以查验一名玩家的身份。谨慎使用你的知识。';
  }
  if (role === 'villager') {
    return '你是村民。通过讨论和投票找出狼人。';
  }
  return '';
}
