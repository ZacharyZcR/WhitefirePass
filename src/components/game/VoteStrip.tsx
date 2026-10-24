/**
 * Voting progress: one pip per living voter, plus the current leaders.
 */

'use client';

import type { GameState } from '@/types/game';
import { cn } from '@/lib/utils';

export function VoteStrip({ state }: { state: GameState }) {
  if (state.phase !== 'voting') return null;

  const alive = state.players.filter((p) => p.isAlive);
  const voted = new Set(state.votes.map((v) => v.from));
  const tally = new Map<string, number>();
  state.votes.forEach((v) => tally.set(v.target, (tally.get(v.target) ?? 0) + 1));
  const leaders = Array.from(tally.entries()).sort((a, b) => b[1] - a[1]).slice(0, 3);

  return (
    <div className="panel-ink flex items-center gap-4 rounded-sm border border-seal/40 px-4 py-2 animate-in fade-in">
      <div className="font-serif text-xs tracking-[0.3em] text-seal-light">
        献祭 {voted.size}/{alive.length}
      </div>
      <div className="flex gap-1">
        {alive.map((p) => (
          <span
            key={p.id}
            title={`${p.name}${voted.has(p.name) ? ' · 已投' : ' · 未投'}`}
            className={cn(
              'h-2.5 w-2.5 rotate-45 border transition-colors duration-500',
              voted.has(p.name) ? 'border-seal-light bg-seal' : 'border-brass/30 bg-transparent',
            )}
          />
        ))}
      </div>
      {leaders.length > 0 && (
        <div className="flex gap-3 border-l border-brass/20 pl-4 font-serif text-xs text-parchment">
          {leaders.map(([name, n]) => (
            <span key={name}>
              {name} <span className="font-cinzel text-seal-light">×{n}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
