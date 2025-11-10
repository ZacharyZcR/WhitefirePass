/**
 * Phase transition animation component
 * 阶段过渡动画 - 显示1-2秒的全屏动画
 */

'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon, Vote, Mountain } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GamePhase } from '@/types/game';

interface PhaseTransitionProps {
  phase: GamePhase;
  round: number;
  onComplete: () => void;
}

const phaseConfig: Record<GamePhase, {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  sublabel: string;
  gradient: string;
  iconColor: string;
}> = {
  prologue: {
    icon: Mountain,
    label: '序章',
    sublabel: 'PROLOGUE',
    gradient: 'from-slate-900 via-slate-800 to-slate-900',
    iconColor: 'text-slate-300',
  },
  setup: {
    icon: Mountain,
    label: '序章',
    sublabel: 'SETUP',
    gradient: 'from-slate-900 via-slate-800 to-slate-900',
    iconColor: 'text-slate-300',
  },
  day: {
    icon: Sun,
    label: '白天',
    sublabel: 'DAY',
    gradient: 'from-amber-900 via-orange-800 to-amber-900',
    iconColor: 'text-amber-300',
  },
  voting: {
    icon: Vote,
    label: '投票',
    sublabel: 'VOTING',
    gradient: 'from-orange-900 via-red-800 to-orange-900',
    iconColor: 'text-orange-300',
  },
  night: {
    icon: Moon,
    label: '夜晚',
    sublabel: 'NIGHT',
    gradient: 'from-blue-950 via-indigo-900 to-blue-950',
    iconColor: 'text-blue-300',
  },
  end: {
    icon: Mountain,
    label: '游戏结束',
    sublabel: 'GAME OVER',
    gradient: 'from-slate-900 via-cyan-900 to-slate-900',
    iconColor: 'text-cyan-300',
  },
};

export function PhaseTransition({ phase, round, onComplete }: PhaseTransitionProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [animationStage, setAnimationStage] = useState<'enter' | 'show' | 'exit'>('enter');

  const config = phaseConfig[phase];
  const Icon = config.icon;

  useEffect(() => {
    // Enter animation (0-300ms)
    const enterTimer = setTimeout(() => {
      setAnimationStage('show');
    }, 300);

    // Show phase (300-1800ms)
    const showTimer = setTimeout(() => {
      setAnimationStage('exit');
    }, 1800);

    // Exit animation (1800-2000ms)
    const exitTimer = setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 2000);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(showTimer);
      clearTimeout(exitTimer);
    };
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center',
        'bg-gradient-to-br',
        config.gradient,
        'transition-opacity duration-300',
        animationStage === 'enter' ? 'opacity-0' : '',
        animationStage === 'show' ? 'opacity-100' : '',
        animationStage === 'exit' ? 'opacity-0' : '',
      )}
    >
      <div
        className={cn(
          'flex flex-col items-center gap-6',
          'transition-all duration-500 ease-out',
          animationStage === 'enter' ? 'scale-50 opacity-0' : '',
          animationStage === 'show' ? 'scale-100 opacity-100' : '',
          animationStage === 'exit' ? 'scale-150 opacity-0' : '',
        )}
      >
        {/* Icon with pulsing animation */}
        <div
          className={cn(
            'relative',
            animationStage === 'show' && 'animate-pulse',
          )}
        >
          <Icon
            className={cn(
              'w-32 h-32 drop-shadow-2xl',
              config.iconColor,
            )}
          />
          {/* Glow effect */}
          <div
            className={cn(
              'absolute inset-0 blur-3xl opacity-50',
              config.iconColor,
            )}
          />
        </div>

        {/* Phase label */}
        <div className="text-center">
          <h2
            className={cn(
              'text-6xl font-bold font-cinzel tracking-wider text-white drop-shadow-lg',
              'transition-all duration-300',
              animationStage === 'enter' ? 'translate-y-4 opacity-0' : '',
              animationStage === 'show' ? 'translate-y-0 opacity-100' : '',
              animationStage === 'exit' ? '-translate-y-4 opacity-0' : '',
            )}
          >
            {config.label}
          </h2>
          <p
            className={cn(
              'text-xl font-cinzel tracking-widest text-white/60 uppercase mt-2',
              'transition-all duration-300 delay-100',
              animationStage === 'enter' ? 'translate-y-4 opacity-0' : '',
              animationStage === 'show' ? 'translate-y-0 opacity-100' : '',
              animationStage === 'exit' ? '-translate-y-4 opacity-0' : '',
            )}
          >
            {config.sublabel}
          </p>
        </div>

        {/* Round number */}
        {round > 0 && (
          <div
            className={cn(
              'px-6 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20',
              'transition-all duration-300 delay-200',
              animationStage === 'enter' ? 'translate-y-4 opacity-0' : '',
              animationStage === 'show' ? 'translate-y-0 opacity-100' : '',
              animationStage === 'exit' ? '-translate-y-4 opacity-0' : '',
            )}
          >
            <span className="text-lg font-cinzel text-white tracking-wider">
              第 {round} 回合
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
