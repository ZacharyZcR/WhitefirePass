/**
 * Traveler Gallery - Tarot Card Style
 * Display all travelers as tarot cards
 */

'use client';

import { useState } from 'react';
import { useGameStore } from '@/stores/game-store';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TarotCard } from './TarotCard';
import { Sparkles } from 'lucide-react';
import type { Player } from '@/types/game';

interface PersonalityEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PersonalityEditor({ open, onOpenChange }: PersonalityEditorProps) {
  const { gameState } = useGameStore();
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  if (!gameState) {
    return null;
  }

  const handleCardClick = (playerId: string) => {
    setSelectedPlayerId(playerId === selectedPlayerId ? null : playerId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-hidden flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <DialogHeader className="flex-shrink-0 border-b border-amber-900/30 pb-4">
          <DialogTitle className="flex items-center gap-2 text-amber-100">
            <Sparkles className="w-5 h-5 text-amber-500" />
            旅者画廊
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            点击卡片查看旅者详情
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 px-4">
            {gameState.players.map((player) => (
              <div
                key={player.id}
                className="perspective-1000 flex justify-center"
                onClick={() => handleCardClick(player.id)}
              >
                <TarotCard
                  player={player}
                  isFlipped={selectedPlayerId === player.id}
                  className="hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Detail panel - shows when a card is selected */}
        {selectedPlayerId && (
          <div className="flex-shrink-0 border-t border-amber-900/30 bg-slate-900/50 backdrop-blur-sm">
            <TravelerDetail
              player={gameState.players.find((p) => p.id === selectedPlayerId)!}
              onClose={() => setSelectedPlayerId(null)}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/**
 * Traveler detail panel - shows below when card is flipped
 */
function TravelerDetail({
  player,
  onClose,
}: {
  player: Player;
  onClose: () => void;
}) {
  const roleNames: Record<string, { name: string; subtitle: string }> = {
    marked: { name: '烙印者', subtitle: 'The Marked' },
    heretic: { name: '背誓者', subtitle: 'The Heretic' },
    listener: { name: '聆心者', subtitle: 'The Listener' },
    coroner: { name: '食灰者', subtitle: 'Ash-Walker' },
    twin: { name: '共誓者', subtitle: 'The Twin' },
    guard: { name: '设闩者', subtitle: 'Guardian' },
    innocent: { name: '无知者', subtitle: 'The Innocent' },
  };

  return (
    <div className="p-6 animate-in slide-in-from-bottom duration-500">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-amber-100 font-cinzel tracking-wider">
              {player.name}
            </h3>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-sm text-amber-500 font-cinzel">
                {roleNames[player.role]?.name}
              </span>
              <span className="text-xs text-slate-500 font-serif">
                {roleNames[player.role]?.subtitle}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-amber-500 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content placeholder - will be designed later */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column - Basic info */}
          <div className="space-y-4">
            <div className="border border-amber-900/30 rounded-lg p-4 bg-slate-950/50">
              <h4 className="text-sm font-semibold text-amber-400 mb-2 font-cinzel tracking-wider">
                基本信息
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">编号</span>
                  <span className="text-slate-200 font-mono">
                    {player.id.slice(-6).toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">状态</span>
                  <span
                    className={
                      player.isAlive ? 'text-green-400' : 'text-red-400'
                    }
                  >
                    {player.isAlive ? '存活' : '已死亡'}
                  </span>
                </div>
              </div>
            </div>

            <div className="border border-amber-900/30 rounded-lg p-4 bg-slate-950/50">
              <h4 className="text-sm font-semibold text-amber-400 mb-2 font-cinzel tracking-wider">
                旅者人设
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed font-serif">
                {player.personality || '暂无人设描述'}
              </p>
            </div>
          </div>

          {/* Right column - Additional info (placeholder) */}
          <div className="space-y-4">
            <div className="border border-amber-900/30 rounded-lg p-4 bg-slate-950/50">
              <h4 className="text-sm font-semibold text-amber-400 mb-2 font-cinzel tracking-wider">
                角色能力
              </h4>
              <p className="text-sm text-slate-400 italic">
                详细能力说明将在此显示...
              </p>
            </div>

            <div className="border border-amber-900/30 rounded-lg p-4 bg-slate-950/50">
              <h4 className="text-sm font-semibold text-amber-400 mb-2 font-cinzel tracking-wider">
                游戏记录
              </h4>
              <p className="text-sm text-slate-400 italic">
                该旅者的行动记录将在此显示...
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
