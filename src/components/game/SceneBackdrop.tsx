/**
 * Lodge backdrop: lancet window, snow light or moonlight, the pale hearth.
 * Day and night layers cross-fade so phase changes feel like time passing.
 */

'use client';

import { cn } from '@/lib/utils';
import { SnowField } from './SnowField';

export type SceneMood = 'day' | 'night' | 'vote';

const DAY_SKY =
  'radial-gradient(ellipse 65% 60% at 50% -10%, rgba(238,246,252,0.55), transparent 72%),' +
  'radial-gradient(ellipse 90% 50% at 50% 0%, rgba(200,218,232,0.18), transparent 80%),' +
  'linear-gradient(180deg, #4a5866 0%, #2e3843 42%, #1b1a17 78%, #100c09 100%)';
const NIGHT_SKY =
  'radial-gradient(ellipse 55% 50% at 50% -8%, rgba(110,140,210,0.20), transparent 70%),' +
  'linear-gradient(180deg, #060c1e 0%, #0a1430 42%, #0a0d1a 80%, #050508 100%)';
const HEARTH =
  'radial-gradient(ellipse 50% 40% at 50% 100%, rgba(168,230,240,0.38), rgba(124,199,214,0.10) 55%, transparent 78%)';

/** Pointed-arch window with mullions; the light source of the room */
function LancetWindow({ night }: { night: boolean }) {
  const glass = night ? 'rgba(130,160,215,0.10)' : 'rgba(230,240,248,0.16)';
  const frame = night ? 'rgba(150,170,205,0.18)' : 'rgba(220,230,240,0.22)';
  return (
    <svg
      viewBox="0 0 200 320"
      className="absolute left-1/2 top-[3%] h-[80%] -translate-x-1/2 transition-opacity duration-[1500ms]"
      aria-hidden
    >
      <path d="M20 320 V120 Q20 30 100 6 Q180 30 180 120 V320 Z" fill={glass} stroke={frame} strokeWidth="2" />
      <path d="M100 8 V320 M20 170 H180 M20 250 H180" stroke={frame} strokeWidth="2" />
      <path d="M60 320 V150 Q60 90 100 60 Q140 90 140 150 V320" fill="none" stroke={frame} strokeWidth="1" />
      <circle cx="100" cy="92" r="16" fill="none" stroke={frame} strokeWidth="1.5" />
    </svg>
  );
}

export function SceneBackdrop({ mood, className }: { mood: SceneMood; className?: string }) {
  const night = mood === 'night';
  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      <div className="absolute inset-0" style={{ background: DAY_SKY }} />
      <div
        className="absolute inset-0 transition-opacity duration-[1800ms] ease-in-out"
        style={{ background: NIGHT_SKY, opacity: night ? 1 : 0 }}
      />

      <LancetWindow night={night} />
      <SnowField count={night ? 70 : 130} className={night ? 'opacity-40' : 'opacity-70'} />

      {/* the white fire: breathes, colder and brighter at night */}
      <div
        className="absolute inset-x-0 bottom-0 h-[70%] origin-bottom animate-hearth transition-opacity duration-[1800ms]"
        style={{ background: HEARTH, opacity: night ? 1 : 0.3 }}
      />

      {/* voting: a thin wash of wax-seal red */}
      <div
        className="absolute inset-0 transition-opacity duration-1000"
        style={{
          background: 'radial-gradient(ellipse at 50% 120%, rgba(142,42,42,0.28), transparent 65%)',
          opacity: mood === 'vote' ? 1 : 0,
        }}
      />

      <div className="vignette absolute inset-0" />
      <div className="grain absolute inset-0" />
    </div>
  );
}
