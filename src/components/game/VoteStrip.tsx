/**
 * 计票板：黄昏放下献祭石之后，舞台左侧列出每个人面前的石头和投石的人。
 * 白火收人要过门槛（sacrificeQuorum）；最多的那个人过了门槛就标红，平票、石头太散各有说法，弃权的人单列。
 * 投票是公开的，不需要上帝视角。
 */

'use client';

import type { GameState } from '@/types/game';
import { cn } from '@/lib/utils';
import { sacrificeQuorum } from '@/lib/game-engine';
import { Portrait } from './Portrait';

export function VoteStrip({ state }: { state: GameState }) {
  if (state.phase !== 'voting') return null;

  if (!state.ballot) {
    return (
      <div className="panel-ink rounded-sm border border-seal/30 px-4 py-1.5 font-serif text-xs tracking-[0.3em] text-seal-light/80 animate-in fade-in">
        黄昏 · 献祭石还没发下来
      </div>
    );
  }
  return null;
}

/** 舞台左侧的计票板：石头放下之后才出现，临终那几句话时也一直在 */
export function VoteBoard({ state }: { state: GameState }) {
  if (state.phase !== 'voting' || !state.ballot || state.votes.length === 0) return null;

  const quorum = sacrificeQuorum(state);
  const byTarget = new Map<string, string[]>();
  for (const v of state.votes) byTarget.set(v.target, [...(byTarget.get(v.target) ?? []), v.from]);
  const rows = [...byTarget].sort((a, b) => b[1].length - a[1].length);
  const top = rows[0]?.[1].length ?? 0;
  const tied = rows.filter(([, voters]) => voters.length === top).length > 1;
  const voted = new Set(state.votes.map((v) => v.from));
  const abstained = state.players.filter((p) => p.isAlive && !voted.has(p.name));

  const verdict = (count: number) => {
    if (count !== top) return null;
    if (count < quorum) return { text: '石头太散', tone: 'text-frost-dim border-frost-dim/40' };
    if (tied) return { text: '平票', tone: 'text-brass-light border-brass/50' };
    return { text: '白火收下', tone: 'text-seal-light border-seal-light/60 bg-seal-dark/60' };
  };

  return (
    <aside className="panel-ink absolute left-3 top-3 z-10 flex max-h-[calc(100%-clamp(170px,27vh,260px)-2.5rem)] w-[min(300px,34%)] flex-col rounded-sm border border-seal/40 duration-700 animate-in fade-in slide-in-from-left-4">
      <header className="flex items-baseline justify-between border-b border-seal/30 px-4 py-2.5">
        <span className="font-serif text-sm tracking-[0.35em] text-seal-light">献祭石</span>
        <span className="font-serif text-[11px] tracking-widest text-frost-dim">
          白火收人需 <span className="font-cinzel text-sm text-parchment">{quorum}</span> 块
        </span>
      </header>

      <ol className="min-h-0 flex-1 space-y-2 overflow-y-auto p-2.5">
        {rows.map(([target, voters]) => {
          const tag = verdict(voters.length);
          const doomed = tag?.text === '白火收下';
          return (
            <li
              key={target}
              className={cn(
                'rounded-sm border px-2.5 py-2 transition-colors',
                doomed ? 'border-seal-light/60 bg-seal-dark/30 shadow-[0_0_24px_rgba(160,30,30,0.35)]' : 'border-brass/15 bg-black/25',
              )}
            >
              <div className="flex items-center gap-2.5">
                <Portrait name={target} zoom={1.7} className="h-10 w-10 shrink-0 rounded-full border border-brass/40" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate font-serif text-sm text-parchment">{target}</span>
                    {tag && <span className={cn('shrink-0 rounded-sm border px-1 text-[10px] tracking-widest', tag.tone)}>{tag.text}</span>}
                  </div>
                  {/* 一块石头一个点；门槛那块之后换颜色 */}
                  <div className="mt-1 flex flex-wrap items-center gap-1">
                    {voters.map((v, i) => (
                      <span
                        key={v}
                        title={v}
                        className={cn('h-2.5 w-3.5 rounded-[50%] border', i < quorum ? 'border-parchment/50 bg-[#8a8478]' : 'border-seal-light/70 bg-seal')}
                      />
                    ))}
                    <span className="ml-1 font-cinzel text-xs text-parchment/80">{voters.length}</span>
                  </div>
                </div>
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1 pl-[50px]">
                {voters.map((v) => (
                  <Portrait key={v} name={v} zoom={1.8} className="h-5 w-5 rounded-full border border-brass/25 opacity-80" />
                ))}
              </div>
            </li>
          );
        })}
      </ol>

      {abstained.length > 0 && (
        <footer className="flex items-center gap-2 border-t border-brass/15 px-4 py-2">
          <span className="shrink-0 font-serif text-[11px] tracking-widest text-frost-dim">弃权</span>
          <div className="flex flex-wrap gap-1">
            {abstained.map((p) => (
              <span key={p.id} title={p.name}>
                <Portrait name={p.name} zoom={1.8} className="h-5 w-5 rounded-full border border-frost-dim/30 opacity-60 grayscale" />
              </span>
            ))}
          </div>
        </footer>
      )}
    </aside>
  );
}
