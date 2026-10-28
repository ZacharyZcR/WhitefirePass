/**
 * Lodge backdrop: the great hall by day, by night and at the vote, cross-fading
 * as phases change. A `scene` overrides the hall (title screen, secret meeting).
 * Snow, the breathing pale hearth, vignette and grain sit on top.
 */

'use client';

import { cn } from '@/lib/utils';
import { artSrc } from '@/lib/design-tokens';
import { SnowField } from './SnowField';

export type SceneMood = 'day' | 'night' | 'vote';

const MOOD_SCENE: Record<SceneMood, string> = {
  day: 'scenes/hall_day',
  night: 'scenes/hall_night',
  vote: 'scenes/hall_vote',
};

const HEARTH =
  'radial-gradient(ellipse 50% 40% at 50% 100%, rgba(168,230,240,0.30), rgba(124,199,214,0.08) 55%, transparent 78%)';

function Layer({ src, show }: { src: string; show: boolean }) {
  return (
    <div
      className="absolute inset-0 bg-cover bg-center transition-opacity duration-[1800ms] ease-in-out"
      style={{ backgroundImage: `url(${artSrc(src)})`, opacity: show ? 1 : 0 }}
    />
  );
}

export function SceneBackdrop({ mood, scene, className }: { mood: SceneMood; scene?: string; className?: string }) {
  const night = mood === 'night';
  const layers = scene ? [...Object.values(MOOD_SCENE), scene] : Object.values(MOOD_SCENE);
  const active = scene ?? MOOD_SCENE[mood];
  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden bg-ink', className)}>
      {[...new Set(layers)].map((src) => <Layer key={src} src={src} show={src === active} />)}

      {/* keep the UI legible over the painting */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/35 to-black/70" />

      <SnowField count={night ? 70 : 130} className={night ? 'opacity-40' : 'opacity-60'} />

      {/* the white fire: breathes, colder and brighter at night */}
      <div
        className="absolute inset-x-0 bottom-0 h-[70%] origin-bottom animate-hearth transition-opacity duration-[1800ms]"
        style={{ background: HEARTH, opacity: night ? 0.8 : 0.25 }}
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
