/**
 * Current speaker component - shows who is currently speaking
 */

'use client';

import type { GameState, Player } from '@/types/game';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CurrentSpeakerProps {
  gameState: GameState;
}

const roleNames: Record<string, string> = {
  marked: '烙印者',
  heretic: '背誓者',
  listener: '聆心者',
  coroner: '食灰者',
  twin: '共誓者',
  guard: '设闩者',
  innocent: '无知者',
};

const roleColors: Record<string, string> = {
  marked: 'bg-red-600',
  heretic: 'bg-slate-700',
  listener: 'bg-purple-600',
  coroner: 'bg-cyan-700',
  twin: 'bg-teal-600',
  guard: 'bg-amber-600',
  innocent: 'bg-blue-600',
};

// eslint-disable-next-line complexity
export function CurrentSpeaker({ gameState }: CurrentSpeakerProps) {
  const { players, currentPlayerIndex, phase } = gameState;

  // Get current speaker
  const alivePlayers = players.filter((p) => p.isAlive);
  let currentPlayer: Player | null = null;

  if (phase === 'night' && gameState.nightPhase) {
    // During night, filter by night phase
    let nightPlayers = alivePlayers;
    if (gameState.nightPhase === 'listener') {
      nightPlayers = alivePlayers.filter((p) => p.role === 'listener');
    } else if (gameState.nightPhase === 'marked-discuss' || gameState.nightPhase === 'marked-vote') {
      nightPlayers = alivePlayers.filter((p) => p.role === 'marked');
    }
    currentPlayer = nightPlayers[currentPlayerIndex] || null;
  } else if (phase === 'day' || phase === 'voting') {
    currentPlayer = alivePlayers[currentPlayerIndex] || null;
  }

  // Get phase display
  const getPhaseDisplay = () => {
    if (phase === 'night' && gameState.nightPhase) {
      const nightPhaseNames: Record<string, string> = {
        'listener': '聆心者查验',
        'marked-discuss': '烙印者讨论',
        'marked-vote': '烙印者投票',
        'guard': '设闩者守护',
        'coroner': '食灰者验尸',
      };
      return nightPhaseNames[gameState.nightPhase] || '夜晚';
    }
    const phaseNames: Record<string, string> = {
      day: '白天讨论',
      voting: '献祭投票',
      night: '夜晚',
      setup: '准备中',
      end: '游戏结束',
    };
    return phaseNames[phase] || phase;
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-shrink-0 pb-2 px-4 py-3">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          当前发言者
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="space-y-3">
          {/* Phase Display */}
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">当前阶段</div>
            <Badge variant="outline" className="text-sm px-3 py-0.5">
              {getPhaseDisplay()}
            </Badge>
          </div>

          {/* Current Speaker */}
          {currentPlayer ? (
            <div className="text-center space-y-2">
              <div
                className={cn(
                  'w-16 h-16 rounded-full mx-auto flex items-center justify-center text-white text-xl font-bold shadow-lg',
                  `bg-gradient-to-br ${roleColors[currentPlayer.role] || 'from-gray-600 to-gray-800'}`,
                )}
              >
                {currentPlayer.name.charAt(0)}
              </div>
              <div>
                <div className="text-lg font-bold text-foreground">{currentPlayer.name}</div>
                <Badge className={cn('mt-1 text-xs', roleColors[currentPlayer.role])}>
                  {roleNames[currentPlayer.role]}
                </Badge>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="w-3 h-3 animate-spin" />
                正在发言...
              </div>
            </div>
          ) : phase === 'end' ? (
            <div className="text-center space-y-2">
              <CheckCircle2 className="w-12 h-12 mx-auto text-green-500" />
              <div className="text-base font-semibold text-foreground">游戏结束</div>
              <div className="text-xs text-muted-foreground">
                {gameState.winner === 'marked' ? '收割阵营获胜' : '羔羊阵营获胜'}
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-4">
              <p className="text-xs">等待游戏开始</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
