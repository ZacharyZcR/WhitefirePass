/**
 * 讣告：有人死去时全屏停留片刻——焦黑的立绘、名字、怎么死的。
 * 死者的身份照规矩不公开，只在上帝视角下揭示。
 */

'use client';

import { useEffect, useState } from 'react';
import type { GameState } from '@/types/game';
import { cn } from '@/lib/utils';
import { artSrc, roleInfo, toHanzi } from '@/lib/design-tokens';
import { useGodView } from '@/hooks/useGodView';
import { Portrait } from './Portrait';

export function DeathNotice({ state }: { state: GameState }) {
  const godView = useGodView((s) => s.godView);
  const deaths = state.deathLog ?? [];
  const [seen, setSeen] = useState(deaths.length);
  const latest = deaths.length > seen ? deaths[deaths.length - 1] : undefined;

  // 新开一局时记录清零
  useEffect(() => {
    if (deaths.length < seen) setSeen(deaths.length);
  }, [deaths.length, seen]);

  useEffect(() => {
    if (!latest) return;
    const timer = setTimeout(() => setSeen(deaths.length), 4200);
    return () => clearTimeout(timer);
  }, [latest, deaths.length]);

  if (!latest) return null;

  const night = latest.cause === 'night';
  const player = state.players.find((p) => p.name === latest.name);
  const role = player ? roleInfo(player.role) : null;

  return (
    <button
      type="button"
      onClick={() => setSeen(deaths.length)}
      className="fixed inset-0 z-[60] flex items-center justify-center gap-12 duration-700 animate-in fade-in"
      style={{
        background: `linear-gradient(90deg, rgba(5,5,8,0.55), rgba(5,5,8,0.88) 50%, rgba(5,5,8,0.96)), url(${artSrc(night ? 'scenes/corridor_night' : 'scenes/pyre')}) center / cover`,
      }}
    >
      <div className="grain absolute inset-0" />
      <div
        className="stage-mask relative h-[60vh] duration-1000 animate-in fade-in slide-in-from-bottom-4"
        style={{ aspectRatio: '832 / 1216' }}
      >
        <Portrait
          name={latest.name}
          dead
          className="stage-mask h-full w-full"
        />
      </div>
      <div className="relative max-w-md text-left [text-shadow:0_2px_12px_rgba(0,0,0,0.9)]">
        <div className="font-latin text-sm italic tracking-[0.4em] text-brass/60">
          {night ? 'Messis Nocturna' : 'Sacrificium'}
        </div>
        <div className="rule-brass my-3 w-48" />
        <h2 className="font-serif text-5xl font-black tracking-[0.25em] text-parchment">
          {latest.name}
        </h2>
        <p
          className={cn(
            'mt-5 font-serif text-lg leading-relaxed tracking-widest',
            night ? 'text-frost' : 'text-seal-light'
          )}
        >
          {night
            ? `第${toHanzi(latest.round)}夜，房门被推开。再也没有醒来。`
            : `第${toHanzi(latest.round)}日黄昏，被推入白蜡篝火，化为灰烬。`}
        </p>
        {godView && role && (
          <p className="mt-4 font-serif text-sm tracking-[0.3em] text-frost-dim">
            真实身份 · <span style={{ color: role.color }}>{role.name}</span>
          </p>
        )}
        <p className="mt-10 font-serif text-[11px] tracking-[0.4em] text-frost-dim/50">
          点击继续
        </p>
      </div>
    </button>
  );
}
