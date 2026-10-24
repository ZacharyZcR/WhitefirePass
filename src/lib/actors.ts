/**
 * 谁在行动、能选谁：store 推进流程、deepseek.ts 构建 prompt 共用同一份规则
 */

import type { GameState, Player } from '@/types/game';

/**
 * 当前阶段按顺序行动的玩家。白天发言顺序按回合轮转，避免每天都是同一个人开场
 */
export function getActingPlayers(state: GameState): Player[] {
  const alive = state.players.filter((p) => p.isAlive);

  if (state.phase === 'night') {
    if (state.nightPhase === 'listener') return alive.filter((p) => p.role === 'listener');
    if (state.nightPhase === 'marked-discuss' || state.nightPhase === 'marked-vote') {
      return alive.filter((p) => p.role === 'marked');
    }
    if (state.nightPhase === 'guard') return alive.filter((p) => p.role === 'guard');
    return [];
  }

  if (state.phase === 'day' || state.phase === 'voting') {
    const speakers = state.phase === 'day' && state.isRevote
      ? alive.filter((p) => !state.tiedPlayers.includes(p.name))
      : alive;
    const start = speakers.length ? (state.round - 1) % speakers.length : 0;
    return [...speakers.slice(start), ...speakers.slice(0, start)];
  }

  return alive;
}

/**
 * 这一步必须选目标时的合法目标；不需要选目标时返回 null
 */
export function getLegalTargets(state: GameState, player: Player): Player[] | null {
  const others = state.players.filter((p) => p.isAlive && p.name !== player.name);

  if (state.phase === 'voting') {
    const tied = state.isRevote ? others.filter((p) => state.tiedPlayers.includes(p.name)) : [];
    return tied.length ? tied : others;
  }

  if (state.phase !== 'night') return null;

  if (state.nightPhase === 'listener') {
    const checked = new Set(state.listenerChecks.map((c) => c.target));
    const fresh = others.filter((p) => !checked.has(p.name));
    return fresh.length ? fresh : others;
  }
  if (state.nightPhase === 'marked-vote') return others.filter((p) => p.role !== 'marked');
  if (state.nightPhase === 'guard') return others.filter((p) => p.name !== state.lastGuardedPlayer);
  return null;
}
