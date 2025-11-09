/**
 * Core game engine - pure functions for game logic
 */

import type {
  GameState,
  Player,
  Message,
  GamePhase,
  Role,
  GameConfig,
} from '@/types/game';

/**
 * Create initial game state
 */
export function createGame(config: GameConfig): GameState {
  const players = createPlayers(config.roles);

  return {
    phase: 'setup',
    round: 0,
    players,
    messages: [
      {
        id: generateId(),
        type: 'system',
        from: 'system',
        content: '游戏开始！正在分配角色...',
        timestamp: Date.now(),
        round: 0,
        phase: 'setup',
        visibility: 'all',
      },
    ],
    votes: [],
    nightVotes: [],
    nightActions: [],
    seerChecks: [],
    createdAt: Date.now(),
    lastUpdated: Date.now(),
    currentPlayerIndex: 0,
    waitingForNextStep: true,
  };
}

/**
 * Create players with assigned roles
 */
function createPlayers(roles: Role[]): Player[] {
  const names = [
    'Alice',
    'Bob',
    'Carol',
    'Dave',
    'Eve',
    'Frank',
    'Grace',
    'Henry',
  ];

  const personalities = [
    '你是一个逻辑严密的分析型高手，擅长通过细节推理找出矛盾和破绽。你习惯建立完整的推理链条，从发言时机、用词选择、投票行为等多维度交叉验证。你的发言通常逻辑清晰、条理分明，善于用演绎推理说服他人。',
    '你是一个直觉敏锐的心理分析专家，擅长通过微表情、语气变化、情绪波动来判断真伪。你有极强的共情能力和洞察力，能快速识别他人的紧张、撒谎或隐藏信息。你相信第一直觉，但也会用理性分析验证直觉。',
    '你是一个深藏不露的战略大师，擅长长线布局和信息收集。你很少在前期暴露观点，而是默默观察所有人的行为模式，在关键时刻用积累的信息一击制胜。你的发言往往一针见血，切中要害。',
    '你是一个强势的指挥官型玩家，擅长整合信息、组织讨论、推动节奏。你有很强的领导力和说服力，敢于在混乱局面中提出明确方向。你习惯主导投票，建立逻辑框架引导其他玩家思考。',
    '你是一个善于伪装的高级玩家，外表轻松幽默，实则心思缜密。你用风趣的方式降低他人警惕，同时暗中观察每个人的反应。你的分析藏在玩笑中，往往在不经意间透露关键信息或引导节奏。',
    '你是一个冷静的数据分析专家，擅长用概率论、博弈论和统计思维分析局势。你会记录每个人的发言次数、投票倾向、行为模式，用量化数据支撑判断。你的推理基于客观事实，很少受情绪影响。',
    '你是一个经验丰富的老手，擅长多层博弈和心理战。你深知常规套路，因此总是能预判他人的想法并反向操作。你喜欢设置陷阱、试探反应，用反常识的视角发现隐藏的真相。',
    '你是一个全局视野的战术家，擅长从整体态势推演局势走向。你会综合分析阵营平衡、关键角色存活情况、信息透明度等因素，制定最优化的战术方案。你的思考总是领先一步，预判各方的后续行动。',
  ];

  const shuffledRoles = shuffle([...roles]);

  return shuffledRoles.map((role, index) => ({
    id: generateId(),
    name: names[index],
    role,
    isAlive: true,
    isAI: true,
    personality: personalities[index],
  }));
}

/**
 * Advance to next game phase
 */
export function advancePhase(state: GameState): GamePhase {
  const phaseOrder: GamePhase[] = ['setup', 'night', 'day', 'voting', 'end'];
  const currentIndex = phaseOrder.indexOf(state.phase);

  if (state.phase === 'voting') {
    return checkWinCondition(state) ? 'end' : 'night';
  }

  if (currentIndex === 0) {
    return 'night';
  }

  return phaseOrder[currentIndex + 1] || 'end';
}

/**
 * Check if game has ended
 */
export function checkWinCondition(
  state: GameState,
): 'werewolf' | 'villager' | null {
  const alivePlayers = state.players.filter((p) => p.isAlive);
  const aliveWerewolves = alivePlayers.filter((p) => p.role === 'werewolf');
  const aliveVillagers = alivePlayers.filter((p) => p.role !== 'werewolf');

  if (aliveWerewolves.length === 0) {
    return 'villager';
  }

  if (aliveWerewolves.length >= aliveVillagers.length) {
    return 'werewolf';
  }

  return null;
}

/**
 * Process night phase - werewolf kill based on votes
 */
export function processNightPhase(state: GameState): {
  killedPlayer: Player | null;
  message: Message;
} {
  if (state.nightVotes.length === 0) {
    return {
      killedPlayer: null,
      message: createMessage('system', '昨夜平安无事'),
    };
  }

  // Count votes
  const voteCounts = new Map<string, number>();
  state.nightVotes.forEach((vote) => {
    voteCounts.set(vote.target, (voteCounts.get(vote.target) ?? 0) + 1);
  });

  // Find player with most votes
  let maxVotes = 0;
  let killedName: string | null = null;

  voteCounts.forEach((count, target) => {
    if (count > maxVotes) {
      maxVotes = count;
      killedName = target;
    }
  });

  const player = state.players.find((p) => p.name === killedName);

  if (!player || !player.isAlive) {
    return {
      killedPlayer: null,
      message: createMessage('system', '昨夜平安无事'),
    };
  }

  return {
    killedPlayer: player,
    message: createMessage(
      'system',
      `昨夜 ${player.name} 被狼人杀害了`,
    ),
  };
}

/**
 * Process voting phase
 */
export function processVoting(state: GameState): {
  eliminated: Player | null;
  message: Message;
} {
  if (state.votes.length === 0) {
    return {
      eliminated: null,
      message: createMessage('system', '没有人投票'),
    };
  }

  const voteCounts = new Map<string, number>();
  state.votes.forEach((vote) => {
    voteCounts.set(vote.target, (voteCounts.get(vote.target) ?? 0) + 1);
  });

  let maxVotes = 0;
  let eliminated: string | null = null;

  voteCounts.forEach((count, target) => {
    if (count > maxVotes) {
      maxVotes = count;
      eliminated = target;
    }
  });

  const player = state.players.find((p) => p.name === eliminated);

  if (!player) {
    return {
      eliminated: null,
      message: createMessage('system', '没有人被淘汰'),
    };
  }

  return {
    eliminated: player,
    message: createMessage(
      'system',
      `${player.name} 被投票淘汰了。`,
    ),
  };
}

/**
 * Add message to game state
 */
export function addMessage(
  state: GameState,
  from: string,
  content: string,
  type: Message['type'] = 'speech',
  visibility: Message['visibility'] = 'all',
): Message {
  return {
    id: generateId(),
    type,
    from,
    content,
    timestamp: Date.now(),
    round: state.round,
    phase: state.phase,
    visibility,
  };
}

/**
 * Create system message
 */
function createMessage(from: string, content: string): Message {
  return {
    id: generateId(),
    type: 'system',
    from,
    content,
    timestamp: Date.now(),
    visibility: 'all',
  };
}

/**
 * Shuffle array
 */
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Generate unique ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get alive players
 */
export function getAlivePlayers(state: GameState): Player[] {
  return state.players.filter((p) => p.isAlive);
}

/**
 * Get player by name
 */
export function getPlayerByName(
  state: GameState,
  name: string,
): Player | undefined {
  return state.players.find((p) => p.name === name);
}
