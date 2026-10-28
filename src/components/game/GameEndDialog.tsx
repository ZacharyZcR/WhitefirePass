/**
 * Game end dialog - verdict, statistics and the full reveal.
 */

'use client';

import type { GameState, Player } from '@/types/game';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { artSrc, isHarvest, roleInfo, toHanzi } from '@/lib/design-tokens';
import { Portrait } from './Portrait';
import { PAYNE_NIGHT, SINS } from '@/lib/sins';

interface GameEndDialogProps {
  gameState: GameState;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border border-brass/15 bg-black/25 px-3 py-2 text-center">
      <div className="font-serif text-[10px] tracking-[0.3em] text-frost-dim">{label}</div>
      <div className="font-cinzel text-2xl text-parchment">{value}</div>
    </div>
  );
}

function RevealGrid({ title, players, tone, harvest }: { title: string; players: Player[]; tone: string; harvest?: boolean }) {
  return (
    <section>
      <h3 className={cn('mb-2 font-serif text-xs tracking-[0.4em]', tone)}>{title}</h3>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
        {players.map((p) => (
          <div key={p.id} className="relative overflow-hidden rounded-sm border border-brass/20" title={p.name}>
            <Portrait name={p.name} dead={!p.isAlive} harvest={harvest} zoom={1.5} className="aspect-[832/1216] w-full" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 to-transparent px-1.5 pb-1 pt-4">
              <div className={cn('truncate font-serif text-[11px] text-parchment', !p.isAlive && 'line-through opacity-60')}>{p.name}</div>
              <div className="text-[9px]" style={{ color: roleInfo(p.role).color }}>{roleInfo(p.role).name}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Verdicts({ title, items }: { title: string; items: { round: number; target: string; isClean: boolean }[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <div className="mb-1.5 font-serif text-[11px] tracking-[0.3em] text-frost-dim">{title}</div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((c, i) => (
          <span key={i} className="border border-brass/15 bg-black/25 px-2 py-1 font-serif text-xs text-parchment">
            第{toHanzi(c.round)}夜 · {c.target} · <span className={c.isClean ? 'text-frost' : 'text-seal-light'}>{c.isClean ? '清白' : '污秽'}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/** 终局揭开罪孽之网：佩恩宅之夜，以及每个人亲手犯下的那桩罪 */
function Truth() {
  const core = SINS.filter((s) => s.core).sort((a, b) => a.year - b.year);
  return (
    <section className="space-y-4 border-t border-brass/15 pt-5">
      <div className="text-center">
        <div className="font-latin text-xs italic tracking-[0.4em] text-brass/60">Veritas</div>
        <h3 className="mt-1 font-serif text-lg font-bold tracking-[0.5em] text-parchment">真相</h3>
      </div>
      <p className="font-serif text-sm leading-relaxed tracking-wide text-frost">{PAYNE_NIGHT}</p>
      <ol className="space-y-3">
        {core.map((s) => (
          <li key={s.id} className="flex gap-3 border-l border-seal/40 pl-3">
            <span className="w-10 flex-shrink-0 font-cinzel text-xs text-brass/70">{s.year}</span>
            <div className="min-w-0">
              <div className="font-serif text-xs tracking-widest text-seal-light">
                {s.by} → {s.against.join('、')}
              </div>
              <p className="mt-0.5 font-serif text-sm leading-relaxed text-parchment/85">{s.reveal ?? s.truth}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function GameEndDialog({ gameState, open, onOpenChange }: GameEndDialogProps) {
  const { winner, players, round, voteHistory, nightVoteHistory, listenerChecks, coronerReports } = gameState;
  if (!winner) return null;

  const harvestWon = winner === 'marked';
  const alive = players.filter((p) => p.isAlive);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[88vh] max-w-3xl flex-col overflow-hidden">
        <div
          className="-mx-6 -mt-6 aspect-[1216/400] bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(180deg, transparent 40%, rgba(10,13,18,0.95)), url(${artSrc(harvestWon ? 'scenes/ending_night' : 'scenes/ending_dawn')})`,
          }}
        />
        <DialogHeader className="-mt-10 items-center text-center sm:text-center">
          <div className="font-latin text-sm italic tracking-[0.4em] text-brass/60">Finis</div>
          <DialogTitle className={cn('font-serif text-3xl font-black tracking-[0.4em]', harvestWon ? 'text-seal-light' : 'text-frost')}>
            {harvestWon ? '收割阵营获胜' : '羔羊阵营获胜'}
          </DialogTitle>
          <DialogDescription className="font-serif tracking-widest">
            {harvestWon ? '山灵的收割已然完成，永夜吞噬了白烬山口' : '黎明的光芒刺破了永夜，诅咒终于被打破'}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto pr-2">
          <div className="grid grid-cols-4 gap-2">
            <Stat label="回合" value={round} />
            <Stat label="幸存" value={`${alive.length}/${players.length}`} />
            <Stat label="献祭票" value={voteHistory.length} />
            <Stat label="夜猎票" value={nightVoteHistory.length} />
          </div>

          <RevealGrid title="收割阵营" players={players.filter((p) => isHarvest(p.role))} tone="text-seal-light" harvest />
          <RevealGrid title="羔羊阵营" players={players.filter((p) => !isHarvest(p.role))} tone="text-frost" />

          {(listenerChecks.length > 0 || coronerReports.length > 0) && (
            <section className="space-y-3 border-t border-brass/15 pt-4">
              <Verdicts title="聆心者查验" items={listenerChecks} />
              <Verdicts title="食灰者验尸" items={coronerReports} />
            </section>
          )}

          <Truth />
        </div>
      </DialogContent>
    </Dialog>
  );
}
