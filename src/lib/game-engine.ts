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
      },
    ],
    votes: [],
    nightActions: [],
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

  const shuffledRoles = shuffle([...roles]);

  return shuffledRoles.map((role, index) => ({
    id: generateId(),
    name: names[index],
    role,
    isAlive: true,
    isAI: true,
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
 * Process night phase
 */
export function processNightPhase(state: GameState): {
  killedPlayer: Player | null;
  message: Message;
} {
  const targets = state.players.filter(
    (p) => p.isAlive && p.role !== 'werewolf',
  );

  if (targets.length === 0) {
    return {
      killedPlayer: null,
      message: createMessage('system', '没有可攻击的目标'),
    };
  }

  const target = targets[Math.floor(Math.random() * targets.length)];

  return {
    killedPlayer: target,
    message: createMessage(
      'system',
      `夜幕降临... 狼人选择了 ${target.name}`,
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

  const roleNames: Record<string, string> = {
    werewolf: '狼人',
    villager: '村民',
    seer: '预言家',
    witch: '女巫',
    hunter: '猎人',
  };

  return {
    eliminated: player,
    message: createMessage(
      'system',
      `${player.name} 被投票淘汰了。Ta 的身份是${roleNames[player.role]}。`,
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
): Message {
  return {
    id: generateId(),
    type,
    from,
    content,
    timestamp: Date.now(),
    round: state.round,
    phase: state.phase,
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
