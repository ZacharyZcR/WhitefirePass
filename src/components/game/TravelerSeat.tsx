/**
 * A traveler's seat at the long table: face crop, name, role sigil.
 * Speaking seats glow; the dead are burnt and stamped.
 */

'use client';

import type { Player } from '@/types/game';
import { cn } from '@/lib/utils';
import { isHarvest, roleInfo, toRoman } from '@/lib/design-tokens';
import { Portrait } from './Portrait';

interface TravelerSeatProps {
  player: Player;
  seat: number;
  speaking?: boolean;
  next?: boolean;
  side: 'left' | 'right';
  reveal?: boolean;
  /** 露出收割之相 */
  harvest?: boolean;
  onSelect?: () => void;
}

const MOOD_MARK = {
  virtue: { label: '美德', className: 'text-pyre border-pyre/40' },
  vice: { label: '堕落', className: 'text-seal-light border-seal/50' },
} as const;

export function TravelerSeat({
  player,
  seat,
  speaking,
  next,
  side,
  reveal = true,
  harvest,
  onSelect,
}: TravelerSeatProps) {
  const role = roleInfo(player.role);
  const dead = !player.isAlive;
  const mood =
    player.emotionalState && player.emotionalState !== 'normal'
      ? MOOD_MARK[player.emotionalState]
      : null;

  return (
    <button
      type="button"
      onClick={onSelect}
      title={reveal ? `${player.name} · ${role.name}` : player.name}
      className={cn(
        'group relative flex min-h-0 w-full flex-1 items-stretch overflow-hidden rounded-sm border text-left transition-all duration-500',
        side === 'right' && 'flex-row-reverse text-right',
        dead
          ? 'border-white/5 bg-black/40'
          : 'border-brass/20 bg-ink-800/70 hover:border-brass/50 hover:bg-ink-700/80',
        speaking && 'animate-speaker-glow border-brass-light/70 bg-ink-700/90'
      )}
    >
      {/* faction edge: crimson for the harvest, frost for the lambs */}
      {reveal && (
        <span
          className={cn(
            'absolute inset-y-0 w-[2px]',
            side === 'left' ? 'left-0' : 'right-0'
          )}
          style={{
            background: isHarvest(player.role)
              ? 'rgba(184,74,74,0.7)'
              : 'rgba(158,190,210,0.45)',
            opacity: dead ? 0.25 : 1,
          }}
        />
      )}

      <Portrait
        name={player.name}
        dead={dead}
        harvest={harvest}
        zoom={1.6}
        className="w-[36%] max-w-[96px] shrink-0 bg-ink-700"
      />

      <div
        className={cn(
          'flex min-w-0 flex-1 flex-col justify-center gap-0.5 px-2.5',
          dead && 'opacity-50'
        )}
      >
        <div
          className={cn(
            'flex items-center gap-1.5',
            side === 'right' && 'flex-row-reverse'
          )}
        >
          <span className="font-cinzel text-[9px] tracking-[0.2em] text-brass/60">
            {toRoman(seat)}
          </span>
          {next && !speaking && (
            <span
              className="h-1 w-1 animate-pulse rounded-full bg-pyre"
              title="即将行动"
            />
          )}
          {mood && (
            <span
              className={cn(
                'rounded-[2px] border px-1 text-[9px] leading-tight',
                mood.className
              )}
            >
              {mood.label}
            </span>
          )}
        </div>
        <div
          className={cn(
            'truncate font-serif text-[13px] font-semibold leading-tight text-parchment',
            dead && 'line-through decoration-seal-light/60'
          )}
        >
          {player.name}
        </div>
        <div className="truncate text-[10px] leading-tight text-frost-dim">
          {reveal && <span style={{ color: role.color }}>{role.name} · </span>}
          {player.occupation && (
            <span className="opacity-70">{player.occupation}</span>
          )}
        </div>
      </div>

      {dead && (
        <span
          className={cn(
            'absolute bottom-1.5 flex h-6 w-6 rotate-[-12deg] items-center justify-center rounded-full border border-seal-light/60 bg-seal-dark/90 font-serif text-[11px] text-parchment/90 shadow-[0_0_10px_rgba(0,0,0,0.8)]',
            side === 'left' ? 'left-1.5' : 'right-1.5'
          )}
        >
          殁
        </span>
      )}
    </button>
  );
}
