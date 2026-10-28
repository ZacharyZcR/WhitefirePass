/**
 * 一个角色能看到什么：会话重建（session.ts）按这里的规则挑消息
 */

import type { Message, Player, SuspicionEntry } from '@/types/game';

/** 这条私密消息他有没有权利知道 */
export const isOwnPrivate = (m: Message, player: Player) => {
  const v = m.visibility;
  if (v === 'all') return false;
  if (typeof v === 'object') {
    return v.player === player.name;
  }
  return (v === 'marked' && player.role === 'marked')
    || (v === 'listener' && player.role === 'listener')
    || (v === 'coroner' && player.role === 'coroner')
    || (v === 'guard' && player.role === 'guard')
    || (v === 'twins' && player.role === 'twin');
};

// 怀疑名单按可能性从高到低排成一行一人（旧存档里可能还有）
export const formatSuspicion = (list: SuspicionEntry[]) =>
  [...list].sort((a, b) => b.p - a.p).map((s) => `${s.name} ${s.p}%：${s.why}`).join('\n');
