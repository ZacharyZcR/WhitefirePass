/**
 * Secret meeting selector - pick two living travelers for a private talk.
 */

'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import type { Player } from '@/types/game';
import { Button } from '@/components/ui/button';
import { FrameCorners } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { roleInfo } from '@/lib/design-tokens';
import { Portrait } from './Portrait';

interface SecretMeetingSelectorProps {
  players: Player[];
  timing: 'before_discussion' | 'after_sacrifice';
  onConfirm: (participants: [string, string]) => void;
}

export function SecretMeetingSelector({ players, timing, onConfirm }: SecretMeetingSelectorProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const alive = players.filter((p) => p.isAlive);

  const toggle = (name: string) => {
    if (selected.includes(name)) setSelected(selected.filter((n) => n !== name));
    else if (selected.length < 2) setSelected([...selected, name]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="brass-frame panel-ink relative flex max-h-[90vh] w-full max-w-5xl flex-col p-6">
        <FrameCorners />
        <header className="mb-4 flex items-end justify-between gap-4 border-b border-brass/15 pb-4">
          <div>
            <div className="font-latin text-sm italic tracking-[0.3em] text-[#b9a4d8]/80">Concilium Secretum</div>
            <h2 className="font-serif text-2xl tracking-[0.4em] text-parchment">密会</h2>
            <p className="mt-1 max-w-xl font-serif text-xs leading-relaxed text-frost-dim">
              {timing === 'before_discussion' ? '白天讨论开始前' : '投票献祭后'}，选择两位旅者进行私密会谈。
              对话只存在于这两人的记忆中，其他人无法得知。
            </p>
          </div>
          <div className="flex items-center gap-3">
            {[0, 1].map((i) => (
              <div key={i} className="flex h-10 w-28 items-center justify-center border border-dashed border-brass/30 font-serif text-sm text-parchment">
                {selected[i] ?? <span className="text-frost-dim/50">—</span>}
              </div>
            ))}
          </div>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-4 gap-3 overflow-y-auto p-1 sm:grid-cols-5 lg:grid-cols-7">
          {alive.map((p) => {
            const isSelected = selected.includes(p.name);
            const disabled = !isSelected && selected.length >= 2;
            return (
              <button
                key={p.id}
                onClick={() => toggle(p.name)}
                disabled={disabled}
                className={cn(
                  'group relative overflow-hidden rounded-sm border text-left transition-all',
                  isSelected ? 'border-brass-light shadow-[0_0_18px_rgba(220,192,138,0.35)]' : 'border-brass/20 hover:border-brass/60',
                  disabled && 'opacity-40',
                )}
              >
                <Portrait name={p.name} className="aspect-[832/1216] w-full" imgClassName="transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 to-transparent px-2 pb-1.5 pt-6">
                  <div className="truncate font-serif text-xs font-semibold text-parchment">{p.name}</div>
                  <div className="text-[10px]" style={{ color: roleInfo(p.role).color }}>{roleInfo(p.role).name}</div>
                </div>
                {isSelected && (
                  <span className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-brass text-ink">
                    <Check className="h-4 w-4" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex justify-end">
          <Button onClick={() => selected.length === 2 && onConfirm(selected as [string, string])} disabled={selected.length !== 2} className="px-10">
            确认密会
          </Button>
        </div>
      </div>
    </div>
  );
}
