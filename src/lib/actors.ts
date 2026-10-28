/**
 * 谁在行动、能选谁：store 推进流程、deepseek.ts 构建 prompt 共用同一份规则
 */

import type { GameState, Player } from '@/types/game';

const MAX_TURNS = 3; // 白天每人最多开口几次
const EXTRA_TURNS = 10; // 一段议事里插队回应的总数上限

/** 话里提到了谁，按出现先后：全名、名，或者没人同姓时的姓 */
export function mentions(text: string, names: string[]): string[] {
  const family = (n: string) => n.split('·')[1] ?? '';
  const keys = (n: string) => {
    const [given, fam] = n.split('·');
    const shared = names.some((m) => m !== n && family(m) === fam);
    return [n, given, ...(fam && !shared ? [fam] : [])];
  };
  const at = (n: string) => Math.min(...keys(n).map((k) => text.indexOf(k)).filter((i) => i >= 0));
  return names.filter((n) => Number.isFinite(at(n))).sort((a, b) => at(a) - at(b));
}

/** 一段议事：回合、白天/傍晚/夜里密谋、平票重议、自我介绍任何一个变了，就是新的一段 */
export const segmentKey = (s: GameState) =>
  `${s.round}|${s.phase === 'night' ? `${s.nightPhase}${s.revoteRound}` : s.phase}|${s.isRevote ? 1 : 0}|${s.isGathering ? 1 : 0}${s.lastWords ? `|临终${s.lastWords}` : ''}${s.mourners?.length ? '|死后' : ''}`;

/**
 * 白天发言队列：先按回合轮转排好每人一次，然后按这段里已经说过的话重建——
 * 被点名的人插到下一个回应；本来就排在后面的直接提前，不额外占一次
 */
function dayQueue(state: GameState, speakers: Player[], rounds = 1): Player[] {
  const start = speakers.length ? (state.round - 1) % speakers.length : 0;
  const once = [...speakers.slice(start), ...speakers.slice(0, start)].map((p) => p.name);
  const base = Array.from({ length: rounds }, () => once).flat();
  const queue = [...base];
  const can = new Set(base);
  const everyone = state.players.map((p) => p.name);
  const key = segmentKey(state);
  const said = state.messages.filter((m) => m.segment === key && m.type === 'speech' && can.has(m.from));

  if (state.isGathering) return queue.map((name) => speakers.find((p) => p.name === name)!); // 自我介绍按座次，不插队
  said.forEach((m, i) => {
    let at = i + 1;
    for (const name of mentions(m.content, everyone).filter((n) => can.has(n) && n !== m.from).slice(0, 2)) {
      const later = queue.indexOf(name, at);
      if (later >= 0) queue.splice(later, 1);
      else if (queue.filter((n) => n === name).length >= MAX_TURNS || queue.length >= base.length + EXTRA_TURNS) continue;
      queue.splice(at++, 0, name);
    }
  });
  return queue.map((name) => speakers.find((p) => p.name === name)!);
}

const LAST_WORDS = 8; // 临终最多说几轮

/**
 * 临终：被献祭的人先开口，然后一来一回——他点了谁的名谁回话，没点名就由往他面前放了石头的人来接；
 * 别人说完，又轮回到他。最多八轮
 */
function lastWordsQueue(state: GameState, alive: Player[]): Player[] {
  const condemned = state.lastWords!;
  const others = alive.map((p) => p.name).filter((n) => n !== condemned);
  const stoners = state.votes.filter((v) => v.target === condemned).map((v) => v.from).filter((n) => others.includes(n));
  const everyone = state.players.map((p) => p.name);
  const key = segmentKey(state);
  const queue = [condemned];
  for (const m of state.messages.filter((x) => x.segment === key && x.type === 'speech')) {
    if (queue.length >= LAST_WORDS) break;
    if (m.from !== condemned) {
      queue.push(condemned);
      continue;
    }
    const spoken = new Set(queue);
    const called = mentions(m.content, everyone).filter((n) => others.includes(n));
    const next = called.find((n) => !spoken.has(n)) ?? stoners.find((n) => !spoken.has(n)) ?? others.find((n) => !spoken.has(n)) ?? called[0];
    if (next) queue.push(next);
  }
  return queue.slice(0, LAST_WORDS).map((name) => alive.find((p) => p.name === name)!).filter(Boolean);
}

/**
 * 当前阶段按顺序行动的玩家。白天发言顺序按回合轮转，被点名的人插队回应
 */
export function getActingPlayers(state: GameState): Player[] {
  const alive = state.players.filter((p) => p.isAlive);

  // 有人刚死、情绪变了的人每人说一句；献祭前先留临终的话
  if (state.mourners?.length) return state.mourners.map((m) => alive.find((p) => p.name === m.name)).filter((p): p is Player => !!p);
  if (state.phase === 'voting' && state.lastWords) return lastWordsQueue(state, alive);

  if (state.phase === 'night') {
    // 聆心者：先选人去听，听完再对着结果说一句
    if (state.nightPhase === 'listener') return alive.filter((p) => p.role === 'listener').flatMap((p) => [p, p]);
    // 密谋至少轮两圈，被点名的同类插队回应
    if (state.nightPhase === 'marked-discuss') return dayQueue(state, alive.filter((p) => p.role === 'marked'), 2);
    if (state.nightPhase === 'marked-vote') return alive.filter((p) => p.role === 'marked');
    if (state.nightPhase === 'guard') return alive.filter((p) => p.role === 'guard');
    // 食灰者尝到了今夜的灰，醒着说几句
    if (state.nightPhase === 'coroner') {
      return state.coronerReports.some((r) => r.round === state.round) ? alive.filter((p) => p.role === 'coroner') : [];
    }
    return [];
  }

  if (state.phase === 'day') {
    return dayQueue(state, state.isRevote ? alive.filter((p) => !state.tiedPlayers.includes(p.name)) : alive);
  }
  if (state.phase === 'voting') {
    // 傍晚先讨论（和白天一样会插队），献祭石发下去后按座次投
    if (!state.ballot) return dayQueue(state, alive);
    const start = alive.length ? (state.round - 1) % alive.length : 0;
    return [...alive.slice(start), ...alive.slice(0, start)];
  }

  return []; // 事件等阶段没有轮流行动的人，由各自的流程推进
}

/**
 * 这一步必须选目标时的合法目标；不需要选目标时返回 null
 */
export function getLegalTargets(state: GameState, player: Player): Player[] | null {
  const others = state.players.filter((p) => p.isAlive && p.name !== player.name);

  if (state.mourners?.length || state.lastWords) return null;
  if (state.phase === 'voting' && state.ballot) {
    const tied = state.isRevote ? others.filter((p) => state.tiedPlayers.includes(p.name)) : [];
    return tied.length ? tied : others;
  }

  if (state.phase !== 'night') return null;

  if (state.nightPhase === 'listener') {
    if (state.listenerChecks.some((c) => c.round === state.round)) return null; // 已经听过了：这一轮只是对着结果说话
    const checked = new Set(state.listenerChecks.map((c) => c.target));
    const fresh = others.filter((p) => !checked.has(p.name));
    return fresh.length ? fresh : others;
  }
  if (state.nightPhase === 'marked-vote') return others.filter((p) => p.role !== 'marked');
  if (state.nightPhase === 'guard') return others.filter((p) => p.name !== state.lastGuardedPlayer);
  return null;
}
