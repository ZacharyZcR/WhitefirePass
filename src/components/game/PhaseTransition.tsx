/**
 * Phase transition - a two-second title card between phases.
 */

'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { PHASE_LABELS } from '@/lib/latin-text';
import { PHASE_NAME, isNightScene, toHanzi } from '@/lib/design-tokens';
import type { GamePhase } from '@/types/game';

interface PhaseTransitionProps {
  phase: GamePhase;
  round: number;
  onComplete: () => void;
}

function titleFor(phase: GamePhase, round: number): string {
  if (phase === 'prologue' || phase === 'setup') return '序章';
  if (phase === 'end') return '终局';
  if (phase === 'night') return `第${toHanzi(round)}夜`;
  if (phase === 'day') return `第${toHanzi(round)}日`;
  return PHASE_NAME[phase];
}

export function PhaseTransition({ phase, round, onComplete }: PhaseTransitionProps) {
  const [stage, setStage] = useState<'enter' | 'show' | 'exit'>('enter');
  const [done, setDone] = useState(false);
  const night = isNightScene(phase);
  const label = PHASE_LABELS[phase];

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage('show'), 300),
      setTimeout(() => setStage('exit'), 1800),
      setTimeout(() => {
        setDone(true);
        onComplete();
      }, 2000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  if (done) return null;

  const subtitle = phase === 'day' || phase === 'night' ? PHASE_NAME[phase] : round > 0 ? `第${toHanzi(round)}回` : '';

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300',
        stage === 'show' ? 'opacity-100' : 'opacity-0',
      )}
      style={{
        background: night
          ? 'radial-gradient(ellipse at 50% 60%, rgba(40,70,110,0.55), rgba(3,5,10,0.96) 70%)'
          : phase === 'voting'
            ? 'radial-gradient(ellipse at 50% 60%, rgba(110,30,30,0.5), rgba(8,5,5,0.96) 70%)'
            : 'radial-gradient(ellipse at 50% 40%, rgba(200,215,228,0.25), rgba(8,10,14,0.96) 70%)',
      }}
    >
      <div className="grain absolute inset-0" />
      <div
        className={cn(
          'relative flex flex-col items-center gap-4 transition-all duration-700 ease-out',
          stage === 'show' ? 'translate-y-0 opacity-100 blur-0' : 'translate-y-2 opacity-0 blur-sm',
        )}
      >
        <div className="font-latin text-lg italic tracking-[0.3em] text-brass/70">{label.latin}</div>
        <div className="rule-brass w-64" />
        <h2 className={cn('font-serif text-6xl font-black tracking-[0.5em]', night ? 'text-frost-gradient' : 'text-brass-gradient')}>
          {titleFor(phase, round)}
        </h2>
        <div className="rule-brass w-64" />
        {subtitle && <div className="font-serif text-sm tracking-[0.6em] text-frost-dim">{subtitle}</div>}
      </div>
    </div>
  );
}
