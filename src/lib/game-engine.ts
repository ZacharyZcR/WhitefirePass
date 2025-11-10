/**
 * Core game engine - pure functions for game logic
 * 白烬山口 (Whitefire Pass) - 寂静山庄 (Silent Lodge)
 */

import type {
  GameState,
  Player,
  Message,
  GamePhase,
  Role,
  GameConfig,
  TwinPair,
} from '@/types/game';

/**
 * Create initial game state
 */
export function createGame(config: GameConfig): GameState {
  const players = createPlayers(config.roles);

  // Find twins and create twin pair
  const twins = players.filter((p) => p.role === 'twin');
  const twinPair: TwinPair | undefined =
    twins.length === 2
      ? { twin1: twins[0].name, twin2: twins[1].name }
      : undefined;

  // Count roles
  const roleCounts = config.roles.reduce(
    (acc, role) => {
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return {
    phase: 'setup',
    round: 0,
    players,
    messages: [
      {
        id: generateId(),
        type: 'system',
        from: '山灵',
        content: `白烬山口，寂静山庄。

一场非自然的暴风雪，将 ${config.roles.length} 名旅人驱赶至此。

大门轰然关闭。篝火散发着无温度的冰冷白光。`,
        timestamp: Date.now(),
        round: 0,
        phase: 'setup',
        visibility: 'all',
      },
      {
        id: generateId(),
        type: 'system',
        from: '山灵',
        content: `"契约已成。盛宴开始。"

"在你们之中，我播撒了'饥饿'。"

"现在，用你们的猜疑和恐惧，来取悦我。"`,
        timestamp: Date.now() + 1,
        round: 0,
        phase: 'setup',
        visibility: 'all',
      },
      {
        id: generateId(),
        type: 'system',
        from: '旁白',
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

夜幕即将降临。第一个夜晚开始...`,
        timestamp: Date.now() + 2,
        round: 0,
        phase: 'setup',
        visibility: 'all',
      },
    ],
    votes: [],
    nightVotes: [],
    nightActions: [],
    listenerChecks: [],
    coronerReports: [],
    guardRecords: [],
    twinPair,
    createdAt: Date.now(),
    lastUpdated: Date.now(),
    currentPlayerIndex: 0,
    waitingForNextStep: true,
    tiedPlayers: [],
    isRevote: false,
    revoteRound: 0,
    voteHistory: [],
    nightVoteHistory: [],
  };
}

/**
 * Create players with assigned roles
 */
function createPlayers(roles: Role[]): Player[] {
  const names = [
    '诺拉', '马库斯', '艾琳', '托马斯', '莉迪亚',
    '奥利弗', '索菲亚', '塞缪尔', '克莱尔', '维克多',
    '艾米莉', '本杰明', '伊莎贝拉', '亚历山大', '夏洛特',
  ];

  const personalities = [
    '你是一个冷静理智的学者，习惯用逻辑推理分析一切。即使身处恐怖之中，你也能保持头脑清醒，从细节中寻找线索。',
    '你是一个经验丰富的猎人，对危险有着敏锐的直觉。你善于观察他人的微表情和肢体语言，能快速判断谁在说谎。',
    '你是一个内向谨慎的研究员，不轻易表达观点，但每次发言都经过深思熟虑。你擅长记录和分析他人的行为模式。',
    '你是一个果断强势的领导者，习惯主导讨论和决策。你有很强的说服力，但有时过于自信可能导致判断失误。',
    '你是一个善解人意的医生，擅长从情感层面理解他人。你相信人性本善，但也明白绝境中人性的扭曲。',
    '你是一个玩世不恭的流浪者，用黑色幽默掩饰内心的恐惧。你的分析往往隐藏在玩笑话中，让人难以捉摸。',
    '你是一个精明的商人，擅长权衡利弊和概率计算。你会用数据和逻辑来支撑你的每一个判断。',
    '你是一个沉默寡言的工匠，只在关键时刻发声。你的观察力极强，往往能发现别人忽略的细节。',
    '你是一个热情外向的教师，善于组织讨论和整合信息。你试图用理性对抗恐惧，让大家团结起来。',
    '你是一个多疑警惕的侦探，对一切都保持怀疑态度。你擅长设置陷阱和试探，用反问揭露矛盾。',
    '你是一个温柔坚韧的护士，在混乱中试图保护他人。你相信观察比质问更有效，习惯倾听而非指责。',
    '你是一个冷酷现实的军人，只关注事实和证据。你的发言简洁有力，从不浪费时间在情绪上。',
    '你是一个敏感脆弱的艺术家，容易被恐惧支配，但有时直觉反而最准确。你的情绪化表达可能暴露真相，也可能被利用。',
    '你是一个老谋深算的政客，擅长操纵舆论和引导节奏。你深知人性的弱点，善于利用混乱达成目标。',
    '你是一个单纯善良的学生，对这一切感到恐惧和困惑。你缺乏经验，但真诚的态度可能成为你的保护伞。',
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
): 'marked' | 'lamb' | null {
  const alivePlayers = state.players.filter((p) => p.isAlive);
  const aliveMarked = alivePlayers.filter(
    (p) => p.role === 'marked' || p.role === 'heretic',
  );
  const aliveLambs = alivePlayers.filter(
    (p) => p.role !== 'marked' && p.role !== 'heretic',
  );

  // 所有烙印者+背誓者被淘汰，羔羊获胜
  if (aliveMarked.length === 0) {
    return 'lamb';
  }

  // 烙印者+背誓者数量 >= 羔羊数量，收割阵营获胜
  if (aliveMarked.length >= aliveLambs.length) {
    return 'marked';
  }

  return null;
}

/**
 * Process night phase - marked kill based on votes
 */
export function processNightPhase(state: GameState): {
  killedPlayer: Player | null;
  message: Message;
  isTied: boolean;
  tiedPlayers: string[];
} {
  if (state.nightVotes.length === 0) {
    return {
      killedPlayer: null,
      message: createMessage('旁白', '白蜡篝火跳动。这一夜，无人死去。'),
      isTied: false,
      tiedPlayers: [],
    };
  }

  // Count votes
  const voteCounts = new Map<string, number>();
  state.nightVotes.forEach((vote) => {
    voteCounts.set(vote.target, (voteCounts.get(vote.target) ?? 0) + 1);
  });

  // Find max votes
  let maxVotes = 0;
  voteCounts.forEach((count) => {
    if (count > maxVotes) {
      maxVotes = count;
    }
  });

  // Find all players with max votes
  const playersWithMaxVotes: string[] = [];
  voteCounts.forEach((count, target) => {
    if (count === maxVotes) {
      playersWithMaxVotes.push(target);
    }
  });

  // Check for tie
  if (playersWithMaxVotes.length > 1) {
    return {
      killedPlayer: null,
      message: createMessage(
        '旁白',
        `烙印者们的意见分歧。${playersWithMaxVotes.join('、')} 各得 ${maxVotes} 票。需要重新商议。`,
      ),
      isTied: true,
      tiedPlayers: playersWithMaxVotes,
    };
  }

  const targetName = playersWithMaxVotes[0];
  const player = state.players.find((p) => p.name === targetName);

  if (!player || !player.isAlive) {
    return {
      killedPlayer: null,
      message: createMessage('旁白', '白蜡篝火跳动。这一夜，无人死去。'),
      isTied: false,
      tiedPlayers: [],
    };
  }

  // Check if player was guarded
  const lastGuardRecord = state.guardRecords[state.guardRecords.length - 1];
  if (lastGuardRecord && lastGuardRecord.target === targetName && lastGuardRecord.round === state.round) {
    return {
      killedPlayer: null,
      message: createMessage(
        '旁白',
        `门闩阻挡了利爪。${targetName} 的房门从外被锁死，躲过了一劫。`,
      ),
      isTied: false,
      tiedPlayers: [],
    };
  }

  return {
    killedPlayer: player,
    message: createMessage(
      '旁白',
      `黎明时分，${player.name} 的房门被推开。冰冷的尸体躺在地上，灵魂已被收割。`,
    ),
    isTied: false,
    tiedPlayers: [],
  };
}

/**
 * Process voting phase
 */
export function processVoting(state: GameState): {
  eliminated: Player | null;
  message: Message;
  isTied: boolean;
  tiedPlayers: string[];
} {
  if (state.votes.length === 0) {
    return {
      eliminated: null,
      message: createMessage('旁白', '无人被选为献祭。'),
      isTied: false,
      tiedPlayers: [],
    };
  }

  const voteCounts = new Map<string, number>();
  state.votes.forEach((vote) => {
    voteCounts.set(vote.target, (voteCounts.get(vote.target) ?? 0) + 1);
  });

  // Find max votes
  let maxVotes = 0;
  voteCounts.forEach((count) => {
    if (count > maxVotes) {
      maxVotes = count;
    }
  });

  // Find all players with max votes
  const playersWithMaxVotes: string[] = [];
  voteCounts.forEach((count, target) => {
    if (count === maxVotes) {
      playersWithMaxVotes.push(target);
    }
  });

  // Check for tie
  if (playersWithMaxVotes.length > 1) {
    return {
      eliminated: null,
      message: createMessage(
        '旁白',
        `献祭石的指向分散。${playersWithMaxVotes.join('、')} 各得 ${maxVotes} 票。平票，无人被献祭。`,
      ),
      isTied: true,
      tiedPlayers: playersWithMaxVotes,
    };
  }

  const player = state.players.find((p) => p.name === playersWithMaxVotes[0]);

  if (!player) {
    return {
      eliminated: null,
      message: createMessage('旁白', '无人被选为献祭。'),
      isTied: false,
      tiedPlayers: [],
    };
  }

  return {
    eliminated: player,
    message: createMessage(
      '旁白',
      `献祭仪式完成。${player.name} 被推入白蜡篝火，化为灰烬。`,
    ),
    isTied: false,
    tiedPlayers: [],
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
