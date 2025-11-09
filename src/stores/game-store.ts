/**
 * Game state management using Zustand
 */

import { create } from 'zustand';
import type { GameState, GameConfig } from '@/types/game';
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

  // Actions
  setApiKey: (key: string) => void;
  startGame: (config: GameConfig) => void;
  resetGame: () => void;
  executeNextStep: () => Promise<void>;

  // Internal actions
  advanceToNextPhase: () => void;
  executeCurrentPlayerAction: () => Promise<void>;
}

/**
 * Create game store
 */
export const useGameStore = create<GameStore>((set, get) => ({
  gameState: null,
  isProcessing: false,
  apiKey: '',

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
    set({ gameState: null, isProcessing: false });
  },

  /**
   * Execute next step in the game
   */
  executeNextStep: async () => {
    const { gameState, isProcessing } = get();

    if (!gameState || isProcessing || gameState.phase === 'end') return;

    set({ isProcessing: true });

    try {
      // Handle setup phase
      if (gameState.phase === 'setup') {
        gameState.phase = 'night';
        gameState.round = 1;
        gameState.currentPlayerIndex = 0;
        gameState.messages.push(
          addMessage(gameState, 'system', '第 1 回合开始。夜幕降临...', 'system'),
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

    if (gameState.phase === 'night') {
      // Night phase ended, process night actions
      const { killedPlayer, message } = processNightPhase(gameState);
      if (killedPlayer) {
        const player = gameState.players.find((p) => p.id === killedPlayer.id);
        if (player) {
          player.isAlive = false;
        }
      }
      gameState.messages.push(message);
      gameState.phase = 'day';
      gameState.currentPlayerIndex = 0;
      gameState.messages.push(
        addMessage(gameState, 'system', '天亮了。开始讨论时间！', 'system'),
      );
    } else if (gameState.phase === 'day') {
      gameState.phase = 'voting';
      gameState.currentPlayerIndex = 0;
      gameState.votes = [];
      gameState.messages.push(
        addMessage(gameState, 'system', '投票时间！', 'system'),
      );
    } else if (gameState.phase === 'voting') {
      // Voting phase ended, process votes
      const { eliminated, message } = processVoting(gameState);
      if (eliminated) {
        const player = gameState.players.find((p) => p.id === eliminated.id);
        if (player) {
          player.isAlive = false;
        }
      }
      gameState.messages.push(message);
      gameState.round += 1;
      gameState.phase = 'night';
      gameState.currentPlayerIndex = 0;
      gameState.messages.push(
        addMessage(gameState, 'system', `第 ${gameState.round} 回合开始。夜幕降临...`, 'system'),
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
      // Get prompt for display
      const prompt = getPromptForDisplay(currentPlayer, gameState);

      // Add prompt message
      gameState.messages.push({
        id: `prompt-${Date.now()}`,
        type: 'prompt',
        from: currentPlayer.name,
        content: prompt,
        timestamp: Date.now(),
        round: gameState.round,
        phase: gameState.phase,
      });

      set({ gameState: { ...gameState } });

      // Get AI response
      const response = await getAIResponse(currentPlayer, gameState, { apiKey });

      // Add thinking/response message
      const messageType = gameState.phase === 'voting' ? 'vote' : 'speech';
      gameState.messages.push(
        addMessage(gameState, currentPlayer.name, response, messageType),
      );

      // Record vote if in voting phase
      if (gameState.phase === 'voting') {
        const votedName = response.trim();
        const targetPlayer = getPlayerByName(gameState, votedName);
        if (targetPlayer?.isAlive) {
          gameState.votes.push({ from: currentPlayer.name, target: votedName });
        }
      }

      // Move to next player
      gameState.currentPlayerIndex += 1;

      set({ gameState: { ...gameState }, isProcessing: false });
    } catch (error) {
      console.error(`Error executing action for ${currentPlayer.name}:`, error);
      set({ isProcessing: false });
    }
  },
}));

/**
 * Get prompt text for display
 */
function getPromptForDisplay(
  player: { name: string; role: string },
  gameState: GameState,
): string {
  const { phase, round, messages } = gameState;
  const alivePlayers = getAlivePlayers(gameState);

  const recentMessages = messages
    .filter((m) => m.type === 'speech' || m.type === 'vote' || m.type === 'system')
    .slice(-10);

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

  return `【AI Prompt】
玩家：${player.name}
身份：${roleNames[player.role]}
阶段：${phaseNames[phase]}
回合：${round}
存活玩家：${alivePlayers.map((p) => p.name).join('、')}

最近的对话：
${recentMessages.map((m) => `${m.from}: ${m.content}`).join('\n')}

${phase === 'day' ? '请发表你的看法（1-2句话）' : phase === 'voting' ? '请投票选择一个玩家（只回复名字）' : ''}`;
}
