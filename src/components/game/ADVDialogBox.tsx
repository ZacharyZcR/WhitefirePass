/**
 * ADV-style dialog box component
 * Visual novel style presentation for current speaker and dialogue
 */

'use client';

import { useEffect, useState } from 'react';
import { TarotCard } from './TarotCard';
import { cn } from '@/lib/utils';
import type { Player, Message } from '@/types/game';
import { TYPOGRAPHY, getBorderClass, BADGE } from '@/lib/design-tokens';

interface ADVDialogBoxProps {
  currentMessage?: Message;
  currentPlayer?: Player;
  className?: string;
}

/**
 * Role names with English/Latin subtitles
 */
const roleNames: Record<string, { name: string; subtitle: string }> = {
  marked: { name: '烙印者', subtitle: 'The Marked' },
  heretic: { name: '背誓者', subtitle: 'The Heretic' },
  listener: { name: '聆心者', subtitle: 'The Listener' },
  coroner: { name: '食灰者', subtitle: 'Ash-Walker' },
  twin: { name: '共誓者', subtitle: 'The Twin' },
  guard: { name: '设闩者', subtitle: 'Guardian' },
  innocent: { name: '无知者', subtitle: 'The Innocent' },
};

/**
 * Message type display names
 */
const messageTypeNames: Record<string, string> = {
  system: '叙述者',
  speech: '发言',
  thinking: '思考',
  action: '行动',
  death: '死亡',
  secret: '密会',
};

function EmptyDialogState({ className }: { className?: string }) {
  return (
    <div className={cn('relative w-full h-64 bg-gradient-to-b from-slate-900/95 to-slate-950/98 backdrop-blur-sm border-t-2 border-amber-600/30', className)}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-amber-600/50 font-cinzel text-lg mb-2">WHITEFIRE PASS</div>
          <div className="text-slate-500 text-sm font-serif">点击「下一步」，故事将会开始……</div>
        </div>
      </div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-600/50 to-transparent" />
    </div>
  );
}

function CharacterPortrait({ player, isVisible }: { player: Player; isVisible: boolean }) {
  return (
    <div className={cn('flex-shrink-0 transition-all duration-500', isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8')}>
      <div className="relative">
        <div className="relative group scale-75">
          <div className="absolute inset-0 bg-amber-600/20 blur-xl group-hover:bg-amber-600/30 transition-all" />
          <div className="relative transform hover:scale-105 transition-transform">
            <TarotCard player={player} isFlipped={true} size="small" />
          </div>
        </div>
        {!player.isAlive && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-red-500 font-bold text-sm rotate-12 font-cinzel tracking-wider">DECEASED</span>
          </div>
        )}
      </div>
    </div>
  );
}

function DialogContent({ message, displayText, roleInfo, messageTypeName, isVisible }: {
  message: Message;
  displayText: string;
  roleInfo: { name: string; subtitle: string } | null;
  messageTypeName: string;
  isVisible: boolean;
}) {
  return (
    <div className={cn('flex-1 flex flex-col justify-between min-h-0 transition-all duration-500', isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4')}>
      <div className="flex items-baseline gap-3 mb-3">
        <div className="relative">
          <h3 className={cn(TYPOGRAPHY.h2, "text-amber-100")}>{message.from}</h3>
          <div className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-amber-600/80 via-amber-600/40 to-transparent" />
        </div>
        {roleInfo && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-amber-600/70 font-serif">{roleInfo.name}</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-500 italic font-serif">{roleInfo.subtitle}</span>
          </div>
        )}
        <div className="ml-auto">
          <span className={cn(BADGE.default, "rounded font-serif bg-amber-900/30 text-amber-500/80", getBorderClass('all', 'border-amber-600', 'divider'))}>
            {messageTypeName}
          </span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgb(120 113 108) transparent' }}>
        <div className={cn('text-slate-200 text-base leading-relaxed font-serif', message.type === 'thinking' && 'italic text-emerald-400/90', message.type === 'system' && 'text-amber-100/90')}>
          {displayText}
        </div>
      </div>
      <div className="mt-3 pt-2 border-t border-amber-600/10">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-serif italic">白烬山口 · 寂静山庄</span>
          <span className="font-mono">{new Date(message.timestamp).toLocaleTimeString('zh-CN')}</span>
        </div>
      </div>
    </div>
  );
}

export function ADVDialogBox({ currentMessage, currentPlayer, className }: ADVDialogBoxProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    if (currentMessage) {
      setIsVisible(false);
      setTimeout(() => {
        setIsVisible(true);
        setDisplayText(currentMessage.content);
      }, 100);
    }
  }, [currentMessage]);

  if (!currentMessage) {
    return <EmptyDialogState className={className} />;
  }

  const isSystemMessage = currentMessage.from === '叙述者' || currentMessage.type === 'system';
  const roleInfo = currentPlayer ? roleNames[currentPlayer.role] : null;
  const messageTypeName = messageTypeNames[currentMessage.type] || currentMessage.type;

  return (
    <div className={cn(
      'relative w-full h-64 bg-gradient-to-b from-slate-900/95 to-slate-950/98 backdrop-blur-sm overflow-hidden',
      getBorderClass('t', 'border-amber-600', 'divider', '2'),
      className
    )}>
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-600/50 to-transparent" />

      {/* Background ornament */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" viewBox="0 0 800 300">
          <pattern id="adv-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <circle cx="50" cy="50" r="1" fill="currentColor" className="text-amber-600" />
          </pattern>
          <rect width="800" height="300" fill="url(#adv-pattern)" />
        </svg>
      </div>

      <div className="relative h-full flex items-center gap-6 px-8 py-6">
        {!isSystemMessage && currentPlayer && (
          <CharacterPortrait player={currentPlayer} isVisible={isVisible} />
        )}
        <DialogContent
          message={currentMessage}
          displayText={displayText}
          roleInfo={roleInfo}
          messageTypeName={messageTypeName}
          isVisible={isVisible}
        />
      </div>

      {/* Decorative corners */}
      <svg className="absolute top-0 left-0 w-16 h-16 text-amber-600/20 pointer-events-none">
        <path d="M0 0 L16 0 M0 0 L0 16" stroke="currentColor" strokeWidth="2" />
        <circle cx="0" cy="0" r="4" fill="currentColor" />
      </svg>
      <svg className="absolute top-0 right-0 w-16 h-16 text-amber-600/20 pointer-events-none">
        <path d="M64 0 L48 0 M64 0 L64 16" stroke="currentColor" strokeWidth="2" />
        <circle cx="64" cy="0" r="4" fill="currentColor" />
      </svg>
      <svg className="absolute bottom-0 left-0 w-16 h-16 text-amber-600/20 pointer-events-none">
        <path d="M0 64 L16 64 M0 64 L0 48" stroke="currentColor" strokeWidth="2" />
        <circle cx="0" cy="64" r="4" fill="currentColor" />
      </svg>
      <svg className="absolute bottom-0 right-0 w-16 h-16 text-amber-600/20 pointer-events-none">
        <path d="M64 64 L48 64 M64 64 L64 48" stroke="currentColor" strokeWidth="2" />
        <circle cx="64" cy="64" r="4" fill="currentColor" />
      </svg>
    </div>
  );
}
