/**
 * 从前后两份游戏状态推出该响的声音：阶段和夜间子阶段切换、死亡、情感突变、平票、异事、结局、新消息。
 * 纯函数，不碰 DOM；播放在 src/lib/audio/player.ts。
 *
 * 不开上帝视角时，私密消息（visibility !== 'all'）不出角色的声音——听声音就能认出烙印者。
 */

import type { GameState, Message } from '@/types/game';

export type Cue =
  // speaker：游戏里的名字，或 '山灵' / '叙述者'。sting：这句开口时同时响的音效（倒地、火焰……），跟着语音排队，不会提前响。delay：毫秒，等一会儿再开口
  | { kind: 'voice'; speaker: string; event: string; sting?: string; delay?: number }
  | { kind: 'sfx'; key: string; delay?: number }; // delay：毫秒，一串音效错开播

export type Ambient = 'amb_blizzard' | 'amb_fire' | 'amb_night';

/** 上一步的快照。store 是原地改 gameState 的，所以不能留旧对象来比，只能记下数字 */
export interface Seen {
  createdAt: number;
  phase: GameState['phase'];
  winner?: GameState['winner'];
  nightPhase?: GameState['nightPhase'];
  isRevote: boolean;
  messages: number;
  deaths: number;
  events: number;
  changes: number;
  cutscenes?: number;
}

export const snapshot = (s: GameState): Seen => ({
  createdAt: s.createdAt,
  phase: s.phase,
  winner: s.winner,
  nightPhase: s.nightPhase,
  isRevote: s.isRevote,
  messages: s.messages.length,
  deaths: s.deathLog?.length ?? 0,
  events: s.gameEvents?.length ?? 0,
  changes: s.pendingStateChanges?.length ?? 0,
  cutscenes: s.cutscenes?.length ?? 0,
});

// 钟声不挂在白天上：献祭平票后的重议也是白天，钟只在离开夜晚时敲
const PHASE_SFX: Partial<Record<GameState['phase'], string>> = {
  voting: 'heartbeat',
  night: 'howl',
  event: 'gust',
};

const PHASE_SPIRIT: Partial<Record<GameState['phase'], string>> = {
  day: 'day',
  voting: 'voting',
  night: 'night',
  event: 'event',
};

// 夜间子阶段：谁在行动不知道，只听得见动静
const NIGHT_SFX: Partial<Record<NonNullable<GameState['nightPhase']>, string>> = {
  listener: 'listen',
  'marked-discuss': 'clock',
  guard: 'steps',
  coroner: 'ash',
};

// 异事：每种事件的现场声
const EVENT_SFX: Record<string, string> = {
  shared_meal: 'cooking',
  rescue: 'snowslide',
  old_story: 'crackle',
  card_game: 'cards',
  shelter_repair: 'hammer',
  musical_evening: 'piano',
  group_prayer: 'prayer',
  supply_discovery: 'crates',
  food_theft: 'cupboard',
  blame_game: 'argument',
  secret_exposed: 'whispers',
  jealousy: 'whispers',
  alliance_betrayal: 'argument',
  resource_conflict: 'argument',
  rumor_spread: 'whispers',
  group_division: 'argument',
  scapegoat: 'argument',
  philosophical_debate: 'crackle',
  dream_sharing: 'dream',
};

const isHarvester = (role: string) => role === 'marked' || role === 'heretic';

// 夜里私密的选人：只出旁人也听得见的动静
const PRIVATE_PICK_SFX: Record<string, string> = { marked: 'heartbeat', guard: 'bolt' };

const DEFEND = /不是我|我不是|冤枉|清白|相信我|怀疑我|我没有/;
const ACCUSE = /怀疑|可疑|就是你|烙印者|收割者|撒谎|说谎|投给/;

/** 公开发言挑哪一类台词 */
export function speechEvent(content: string): 'defend' | 'accuse' | 'speak' {
  if (DEFEND.test(content)) return 'defend';
  if (ACCUSE.test(content)) return 'accuse';
  return 'speak';
}

// 山灵只对一个人说的话：第一夜叫醒烙印者、第二天背誓者堕落。上帝视角下才出声，不然一听就知道今晚有人被叫醒了
function spiritCue(m: Message, state: GameState, godView: boolean): Cue[] {
  if (!godView || typeof m.visibility !== 'object') return [];
  const { player } = m.visibility;
  const role = state.players.find((p) => p.name === player)?.role;
  if (role === 'marked') return [{ kind: 'voice', speaker: '山灵', event: 'marked_whisper' }];
  if (role === 'heretic' && m.content.startsWith('【灵魂的堕落】')) return [{ kind: 'voice', speaker: '山灵', event: 'fall', sting: 'vice' }];
  return [];
}

function messageCue(m: Message, state: GameState, godView: boolean): Cue[] {
  if (m.from === '山灵') return spiritCue(m, state, godView);
  const isPlayer = state.players.some((p) => p.name === m.from);
  if (!isPlayer) return [];
  const isPublic = m.visibility === 'all';
  const isPick = state.players.some((p) => p.name === m.content.trim());

  if (m.type === 'vote') return [{ kind: 'sfx', key: 'stone' }, { kind: 'voice', speaker: m.from, event: 'vote' }];
  if (m.type !== 'speech') return [];
  if (isPublic) return [{ kind: 'voice', speaker: m.from, event: speechEvent(m.content) }];
  if (isPick) {
    const key = typeof m.visibility === 'string' ? PRIVATE_PICK_SFX[m.visibility] : undefined;
    return key ? [{ kind: 'sfx', key }] : [];
  }
  return godView ? [{ kind: 'voice', speaker: m.from, event: 'whisper' }] : [];
}

export function cuesFor(prev: Seen | null, next: GameState, godView: boolean): Cue[] {
  if (!prev || prev.createdAt !== next.createdAt) return []; // 换局 / 读档：不补播之前的事
  // 固定过场（第三夜、第七天）在播：游戏这边不出声，过场有自己的声音；全部播完，山灵才宣布开始
  if (next.cutscenes?.length) return [];
  if (prev.cutscenes) return [{ kind: 'voice', speaker: '山灵', event: 'start' }];
  const cues: Cue[] = [];
  const deaths = (next.deathLog ?? []).slice(prev.deaths);

  if (prev.phase !== next.phase) {
    // 天亮 = 离开夜晚（之后进密会、白天或直接结局都算）：先敲钟，死讯 / 没人死由旁白讲，山灵这一步不开口
    const dawn = prev.phase === 'night';
    if (dawn) cues.push({ kind: 'sfx', key: 'bell' });
    const sfx = PHASE_SFX[next.phase];
    if (sfx) cues.push({ kind: 'sfx', key: sfx, ...(dawn ? { delay: 700 } : {}) }); // 天亮：钟声起来再开门，倒地和第一句再晚一点
    if (dawn) {
      if (!deaths.length && next.phase !== 'end') cues.push({ kind: 'voice', speaker: '叙述者', event: 'no_death' });
    } else {
      const spirit = prev.phase === 'prologue' ? 'start' : PHASE_SPIRIT[next.phase];
      if (spirit && !deaths.length) cues.push({ kind: 'voice', speaker: '山灵', event: spirit });
    }
  }

  if (next.phase === 'night' && next.nightPhase && next.nightPhase !== prev.nightPhase) {
    const sfx = NIGHT_SFX[next.nightPhase];
    if (sfx) cues.push({ kind: 'sfx', key: sfx });
  }

  for (const d of deaths) {
    if (d.cause === 'night') {
      cues.push({ kind: 'voice', speaker: d.name, event: 'killed', sting: 'body' });
      cues.push({ kind: 'voice', speaker: '叙述者', event: 'night_death' });
    } else {
      cues.push({ kind: 'voice', speaker: '叙述者', event: 'sacrifice', sting: 'pyre' });
      cues.push({ kind: 'voice', speaker: d.name, event: 'sacrificed' });
    }
  }

  // 情感突变一次可能好几个人，只给第一个配音
  const change = next.pendingStateChanges?.[prev.changes];
  if (change && change.newState !== 'normal') {
    cues.push({ kind: 'voice', speaker: change.character, event: change.newState, sting: change.newState });
  }

  if (next.isRevote && !prev.isRevote) {
    cues.push({ kind: 'voice', speaker: '叙述者', event: 'tie', sting: 'murmur' });
  }

  const event = next.gameEvents?.[prev.events];
  if (event && EVENT_SFX[event.eventId]) cues.push({ kind: 'sfx', key: EVENT_SFX[event.eventId] });

  if (next.winner && !prev.winner) {
    cues.push({ kind: 'voice', speaker: '叙述者', event: `end_${next.winner}` });
    // 羔羊赢：一个幸存者松口气；收割赢：一个烙印者终于不用再装
    const marked = next.winner === 'marked';
    const last = next.players.find((p) => p.isAlive && (marked ? p.role === 'marked' : !isHarvester(p.role)));
    if (last) cues.push({ kind: 'voice', speaker: last.name, event: marked ? 'harvest' : 'survive' });
  }

  // 天亮：第一句话等钟声响一会儿再开口
  const firstVoice = cues.find((c) => c.kind === 'voice');
  if (prev.phase === 'night' && next.phase !== 'night' && firstVoice?.kind === 'voice') firstVoice.delay = 1500;

  const fresh = next.messages.slice(prev.messages);

  // 并行投票：一批票同时到。石子按票数错开落几颗，再挑两个人开口（每回合换人），不然十几句一起排队
  const votes = fresh.filter((m) => m.type === 'vote');
  if (votes.length > 1) {
    for (let i = 0; i < Math.min(votes.length, 5); i++) cues.push({ kind: 'sfx', key: 'stone', delay: i * 180 });
    const first = (next.round * 7) % votes.length;
    for (const i of new Set([first, (first + Math.floor(votes.length / 2)) % votes.length])) {
      cues.push({ kind: 'voice', speaker: votes[i].from, event: 'vote' });
    }
    return cues;
  }

  // 一步里通常只多出「心声 + 发言」，只给最后一条能出声的配音
  for (let i = fresh.length - 1; i >= 0; i--) {
    const c = messageCue(fresh[i], next, godView);
    if (c.length) {
      cues.push(...c);
      break;
    }
  }
  return cues;
}

/** 当前阶段的环境音 */
export function ambientFor(state: GameState | null): Ambient[] {
  if (!state) return [];
  if (state.phase === 'end') return state.winner === 'lamb' ? [] : ['amb_night']; // 羔羊赢了：暴风雪停了
  if (state.phase === 'night' || state.cutscenes?.[0] === 'chosen') return ['amb_night']; // 第三夜过场也是夜里
  if (state.phase === 'day' || state.phase === 'voting') return ['amb_blizzard', 'amb_fire'];
  return ['amb_blizzard'];
}
