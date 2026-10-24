/**
 * Vote tracker - day sacrifices, night hunts, listener checks, autopsies.
 */

'use client';

import type { GameState, Vote } from '@/types/game';
import { Eye, Flame, Moon, Scale } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toHanzi } from '@/lib/design-tokens';

function groupByRound(votes: Vote[]): [number, Vote[]][] {
  const map = new Map<number, Vote[]>();
  votes.forEach((v) => map.set(v.round ?? 0, [...(map.get(v.round ?? 0) ?? []), v]));
  return Array.from(map.entries()).sort((a, b) => b[0] - a[0]);
}

function tally(votes: Vote[]) {
  const counts = new Map<string, number>();
  votes.forEach((v) => counts.set(v.target, (counts.get(v.target) ?? 0) + 1));
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
}

function Section({ icon: Icon, title, tone, children }: { icon: typeof Eye; title: string; tone: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h3 className={cn('flex items-center gap-2 font-serif text-xs tracking-[0.3em]', tone)}>
        <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
        {title}
      </h3>
      {children}
    </section>
  );
}

function TallyCard({ label, votes, bar }: { label: string; votes: Vote[]; bar: string }) {
  const rows = tally(votes);
  const max = rows[0]?.[1] ?? 1;
  return (
    <div className="rounded-sm border border-brass/15 bg-black/25 p-3">
      <div className="mb-2 font-serif text-[11px] tracking-widest text-frost-dim">{label}</div>
      <div className="space-y-1.5">
        {rows.map(([target, n]) => (
          <div key={target} className="flex items-center gap-2 font-serif text-xs">
            <span className="w-24 truncate text-parchment">{target}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-600">
              <div className={cn('h-full', bar, n === max ? 'opacity-100' : 'opacity-50')} style={{ width: `${(n / max) * 100}%` }} />
            </div>
            <span className="w-8 text-right font-cinzel text-brass-light">{n}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Verdicts({ items }: { items: { round: number; target: string; isClean: boolean }[] }) {
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {items.map((c, i) => (
        <div key={i} className="flex items-center justify-between rounded-sm border border-brass/15 bg-black/25 px-2.5 py-1.5 font-serif text-xs">
          <span className="text-parchment">
            <span className="mr-1.5 text-frost-dim">第{toHanzi(c.round)}夜</span>
            {c.target}
          </span>
          <span className={c.isClean ? 'text-frost' : 'text-seal-light'}>{c.isClean ? '清白' : '污秽'}</span>
        </div>
      ))}
    </div>
  );
}

export function VoteTracker({ gameState }: { gameState: GameState }) {
  const { voteHistory = [], nightVoteHistory = [], listenerChecks = [], coronerReports = [] } = gameState;
  const empty = !voteHistory.length && !nightVoteHistory.length && !listenerChecks.length && !coronerReports.length;

  return (
    <div className="h-full space-y-6 overflow-y-auto px-6 py-4">
      {empty && <div className="py-16 text-center font-serif text-sm tracking-widest text-frost-dim">尚无票决与查验</div>}

      {listenerChecks.length > 0 && (
        <Section icon={Eye} title="聆心者查验" tone="text-[#a99bd0]">
          <Verdicts items={listenerChecks} />
        </Section>
      )}
      {coronerReports.length > 0 && (
        <Section icon={Flame} title="食灰者验尸" tone="text-pyre-soft">
          <Verdicts items={coronerReports} />
        </Section>
      )}
      {voteHistory.length > 0 && (
        <Section icon={Scale} title="白昼献祭" tone="text-brass-light">
          {groupByRound(voteHistory).map(([r, votes]) => (
            <TallyCard key={r} label={`第${toHanzi(r)}日`} votes={votes} bar="bg-brass" />
          ))}
        </Section>
      )}
      {nightVoteHistory.length > 0 && (
        <Section icon={Moon} title="烙印者夜猎" tone="text-seal-light">
          {groupByRound(nightVoteHistory).map(([r, votes]) => (
            <TallyCard key={r} label={`第${toHanzi(r)}夜`} votes={votes} bar="bg-seal-light" />
          ))}
        </Section>
      )}
    </div>
  );
}
