/**
 * 上帝视角：开着时显示每个人的身份和夜里的私密行动；关着时只看得到在场的人看得到的东西
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Message } from '@/types/game';

interface GodView {
  godView: boolean;
  toggleGodView: () => void;
}

export const useGodView = create<GodView>()(
  persist(
    (set) => ({
      godView: false,
      toggleGodView: () => set((s) => ({ godView: !s.godView })),
    }),
    { name: 'whitefire-god-view' }
  )
);

// 不开上帝视角时，私密行动只留下旁人能察觉到的痕迹
const TRACE: Record<string, string> = {
  marked: '黑暗里，有几个人压低了声音……',
  listener: '有人闭上眼睛，去倾听某个灵魂。',
  guard: '走廊尽头，一扇门的门闩被悄悄放下。',
  coroner: '有人在梦里尝到了灰烬的味道。',
  twins: '有两个人交换了一个眼神。',
  player: '有人在心里盘算着什么。',
};

/** 旁观者看到的这条消息：公开的原样返回，私密的换成一句匿名旁白 */
export function asSeen(message: Message, godView: boolean): Message {
  if (godView || message.visibility === 'all') return message;
  const key =
    typeof message.visibility === 'string'
      ? message.visibility
      : Object.keys(message.visibility)[0];
  return {
    ...message,
    type: 'system',
    from: '叙述者',
    content: TRACE[key] ?? '夜色里有什么动了一下。',
  };
}
