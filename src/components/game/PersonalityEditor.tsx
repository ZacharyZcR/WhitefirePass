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
  const [flippingCardId, setFlippingCardId] = useState<string | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  if (!gameState) {
    return null;
  }

  const handleCardClick = (playerId: string) => {
    // Start flip animation
    setFlippingCardId(playerId);
    setSelectedPlayerId(playerId);

    // After flip animation completes, show detail panel
    setTimeout(() => {
      setShowDetail(true);
    }, 600); // Flip animation duration
  };

  const handleClose = () => {
    setShowDetail(false);
    setFlippingCardId(null);
    // Delay clearing selection to allow animation
    setTimeout(() => {
      setSelectedPlayerId(null);
    }, 300);
  };

  const selectedPlayer = selectedPlayerId
    ? gameState.players.find((p) => p.id === selectedPlayerId)
    : null;

  const handleDialogChange = (newOpen: boolean) => {
    if (!newOpen) {
      // If closing dialog, reset all states
      setShowDetail(false);
      setFlippingCardId(null);
      setSelectedPlayerId(null);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent
        className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
        onInteractOutside={(e) => {
          // If detail panel is open, close it instead of the dialog
          if (showDetail) {
            e.preventDefault();
            handleClose();
          }
        }}
      >
        <DialogHeader className="flex-shrink-0 border-b border-amber-900/30 pb-4">
          <DialogTitle className="flex items-center gap-2 text-amber-100">
            <Sparkles className="w-5 h-5 text-amber-500" />
            {selectedPlayer ? '旅者档案' : '旅者画廊'}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {selectedPlayer ? (
              <button
                onClick={handleClose}
                className="text-amber-500 hover:text-amber-400 transition-colors"
              >
                ← 返回画廊
              </button>
            ) : (
              '点击卡片查看旅者详情'
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden relative">
          {/* Gallery View - responsive grid */}
          <div
            className={`h-full overflow-y-auto overflow-x-hidden py-6 px-4 transition-opacity duration-300 ${
              showDetail ? 'opacity-0 pointer-events-none' : 'opacity-100'
            } ${flippingCardId ? 'pointer-events-none' : ''}`}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-w-2xl mx-auto">
              {gameState.players.map((player) => (
                <div
                  key={player.id}
                  className="perspective-1000 flex justify-center cursor-pointer"
                  onClick={() => handleCardClick(player.id)}
                >
                  <TarotCard
                    player={player}
                    isFlipped={flippingCardId === player.id}
                    size="small"
                    className="hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Detail Panel - slides in from right as overlay */}
          {showDetail && selectedPlayer && (
            <div className="absolute inset-0 flex items-center justify-end animate-in slide-in-from-right duration-500">
              <div className="h-full w-full sm:w-[450px] lg:w-[550px] bg-gradient-to-l from-slate-950 via-slate-900 to-slate-950/95 backdrop-blur-md border-l border-amber-900/30 shadow-2xl overflow-y-auto">
                <div className="p-6 sm:p-8 space-y-6">
                  {/* Card at top */}
                  <div className="flex justify-center perspective-1000">
                    <TarotCard
                      player={selectedPlayer}
                      isFlipped={true}
                      size="small"
                    />
                  </div>

                  {/* Detail panel */}
                  <TravelerDetail player={selectedPlayer} />
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Traveler detail panel - right side content
 */
function TravelerDetail({ player }: { player: Player }) {
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-3xl font-bold text-amber-100 font-cinzel tracking-wider mb-2">
          {player.name}
        </h3>
        <div className="flex items-center gap-3">
          <span className="text-lg text-amber-500 font-cinzel">
            {roleNames[player.role]?.name}
          </span>
          <span className="text-sm text-slate-500 font-serif">
            {roleNames[player.role]?.subtitle}
          </span>
        </div>
      </div>

      {/* Basic info */}
      <div className="border border-amber-900/30 rounded-lg p-5 bg-slate-950/50">
        <h4 className="text-sm font-semibold text-amber-400 mb-3 font-cinzel tracking-wider">
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
              className={player.isAlive ? 'text-green-400' : 'text-red-400'}
            >
              {player.isAlive ? '存活' : '已死亡'}
            </span>
          </div>
        </div>
      </div>

      {/* Personality */}
      <div className="border border-amber-900/30 rounded-lg p-5 bg-slate-950/50">
        <h4 className="text-sm font-semibold text-amber-400 mb-3 font-cinzel tracking-wider">
          旅者人设
        </h4>
        <p className="text-sm text-slate-300 leading-relaxed font-serif">
          {player.personality || '暂无人设描述'}
        </p>
      </div>

      {/* Role abilities */}
      <div className="border border-amber-900/30 rounded-lg p-5 bg-slate-950/50">
        <h4 className="text-sm font-semibold text-amber-400 mb-3 font-cinzel tracking-wider">
          角色能力
        </h4>
        <p className="text-sm text-slate-400 italic">
          详细能力说明将在此显示...
        </p>
      </div>

      {/* Game records */}
      <div className="border border-amber-900/30 rounded-lg p-5 bg-slate-950/50">
        <h4 className="text-sm font-semibold text-amber-400 mb-3 font-cinzel tracking-wider">
          游戏记录
        </h4>
        <p className="text-sm text-slate-400 italic">
          该旅者的行动记录将在此显示...
        </p>
      </div>
    </div>
  );
}
