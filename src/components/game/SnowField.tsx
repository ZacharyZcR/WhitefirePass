/**
 * Drifting snow on a canvas. Cheap, decorative, pointer-transparent.
 */

'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface Flake {
  x: number;
  y: number;
  r: number;
  speed: number;
  drift: number;
  alpha: number;
}

export function SnowField({ count = 120, className }: { count?: number; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const spawn = (y = Math.random() * canvas.height): Flake => ({
      x: Math.random() * canvas.width,
      y,
      r: Math.random() * 1.8 + 0.4,
      speed: Math.random() * 0.6 + 0.25,
      drift: Math.random() * 0.4 - 0.2,
      alpha: Math.random() * 0.5 + 0.2,
    });
    const flakes = Array.from({ length: count }, () => spawn());

    let frame = 0;
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const f of flakes) {
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(235, 244, 250, ${f.alpha})`;
        ctx.fill();
        f.y += f.speed;
        f.x += f.drift + Math.sin(f.y / 60) * 0.15;
        if (f.y > canvas.height + 4) Object.assign(f, spawn(-4));
        if (f.x < -4) f.x = canvas.width + 4;
        if (f.x > canvas.width + 4) f.x = -4;
      }
      frame = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(frame);
    };
  }, [count]);

  return <canvas ref={canvasRef} className={cn('pointer-events-none absolute inset-0 h-full w-full', className)} />;
}
