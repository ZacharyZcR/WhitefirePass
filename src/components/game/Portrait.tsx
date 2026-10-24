/**
 * Character portrait. Designed for 832×1216 knee-up art; older 640×1632
 * full-body art also works because we always cover and anchor to the top.
 */

'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { portraitSrc } from '@/lib/design-tokens';

interface PortraitProps {
  name: string;
  dead?: boolean;
  /** Scale from the top edge, used to crop to the face in small seats */
  zoom?: number;
  className?: string;
  imgClassName?: string;
}

export function Portrait({ name, dead = false, zoom = 1, className, imgClassName }: PortraitProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {failed ? (
        <div className="absolute inset-0 flex items-center justify-center font-serif text-2xl text-brass/50">
          {name.charAt(0)}
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={portraitSrc(name)}
          alt={name}
          draggable={false}
          onError={() => setFailed(true)}
          className={cn(
            'absolute inset-0 h-full w-full select-none object-cover object-top transition-[filter] duration-700',
            dead && 'portrait-dead',
            imgClassName,
          )}
          style={zoom !== 1 ? { transform: `scale(${zoom})`, transformOrigin: '50% 10%' } : undefined}
        />
      )}
      {dead && <div className="burn-edge absolute inset-0" />}
    </div>
  );
}
