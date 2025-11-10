/**
 * Game Transition - Animated transition between start menu and game
 */

'use client';

import { useEffect, useState } from 'react';
import { Mountain, Snowflake } from 'lucide-react';

interface GameTransitionProps {
  onComplete: () => void;
}

export function GameTransition({ onComplete }: GameTransitionProps) {
  const [step, setStep] = useState<'fade-in' | 'show' | 'fade-out'>('fade-in');

  useEffect(() => {
    // Fade in
    const timer1 = setTimeout(() => {
      setStep('show');
    }, 100);

    // Hold
    const timer2 = setTimeout(() => {
      setStep('fade-out');
    }, 2500);

    // Complete
    const timer3 = setTimeout(() => {
      onComplete();
    }, 3500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-center justify-center
        bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900
        transition-opacity duration-1000
        ${step === 'fade-in' ? 'opacity-0' : ''}
        ${step === 'show' ? 'opacity-100' : ''}
        ${step === 'fade-out' ? 'opacity-0' : ''}
      `}
    >
      {/* Animated snow particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <Snowflake
            key={i}
            className="absolute text-white/20 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 20 + 10}px`,
              height: `${Math.random() * 20 + 10}px`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${Math.random() * 3 + 2}s`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div
        className={`
          relative z-10 text-center space-y-8
          transition-all duration-1000 ease-out
          ${step === 'fade-in' ? 'opacity-0 scale-95 translate-y-8' : ''}
          ${step === 'show' ? 'opacity-100 scale-100 translate-y-0' : ''}
          ${step === 'fade-out' ? 'opacity-0 scale-105 -translate-y-8' : ''}
        `}
      >
        {/* Mountain icon with glow */}
        <div className="flex justify-center">
          <div className="relative">
            <Mountain
              className="w-24 h-24 text-amber-400 drop-shadow-[0_0_30px_rgba(251,191,36,0.6)] animate-pulse"
              strokeWidth={1.5}
            />
            <div className="absolute inset-0 w-24 h-24 bg-amber-400/20 rounded-full blur-3xl animate-pulse" />
          </div>
        </div>

        {/* Text */}
        <div className="space-y-4">
          <h2 className="text-5xl font-bold font-cinzel tracking-wider text-amber-100 drop-shadow-lg">
            进入山庄
          </h2>
          <p className="text-lg font-serif text-slate-300 tracking-wide">
            暴风雪已至，山门即将关闭...
          </p>
        </div>

        {/* Loading animation */}
        <div className="flex justify-center gap-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-amber-400 animate-bounce"
              style={{
                animationDelay: `${i * 0.15}s`,
                animationDuration: '0.6s',
              }}
            />
          ))}
        </div>
      </div>

      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/50 pointer-events-none" />
    </div>
  );
}
