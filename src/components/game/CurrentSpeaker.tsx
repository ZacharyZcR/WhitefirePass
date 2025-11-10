/**
 * Current speaker component - shows who is currently speaking
 */

'use client';

import type { GameState, Player } from '@/types/game';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  Loader2,
  CheckCircle2,
  Sun,
  Moon,
  Vote,
  Eye,
  Flame,
  Shield,
  Search,
  Users,
  Ghost,
  Ear,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CurrentSpeakerProps {
  gameState: GameState;
}

const roleNames: Record<string, { name: string; subtitle: string }> = {
  marked: { name: '烙印者', subtitle: 'The Marked' },
  heretic: { name: '背誓者', subtitle: 'The Heretic' },
  listener: { name: '聆心者', subtitle: 'The Listener' },
  coroner: { name: '食灰者', subtitle: 'Ash-Walker' },
  twin: { name: '共誓者', subtitle: 'The Twin' },
  guard: { name: '设闩者', subtitle: 'Guardian' },
  innocent: { name: '无知者', subtitle: 'The Innocent' },
};

const roleColors: Record<string, string> = {
  marked: 'bg-red-700',
  heretic: 'bg-slate-600',
  listener: 'bg-purple-700',
  coroner: 'bg-cyan-700',
  twin: 'bg-teal-700',
  guard: 'bg-amber-700',
  innocent: 'bg-blue-700',
};

const roleGradients: Record<string, string> = {
  marked: 'from-red-600 to-red-900',
  heretic: 'from-slate-600 to-slate-900',
  listener: 'from-purple-600 to-purple-900',
  coroner: 'from-cyan-700 to-cyan-900',
  twin: 'from-teal-600 to-teal-900',
  guard: 'from-amber-600 to-amber-900',
  innocent: 'from-blue-600 to-blue-900',
};

const getRoleIcon = (role: string) => {
  const icons: Record<string, React.ReactNode> = {
    marked: <Flame className="w-8 h-8" />,
    heretic: <Ghost className="w-8 h-8" />,
    listener: <Ear className="w-8 h-8" />,
    coroner: <Search className="w-8 h-8" />,
    twin: <Users className="w-8 h-8" />,
    guard: <Shield className="w-8 h-8" />,
    innocent: <User className="w-8 h-8" />,
  };
  return icons[role] || <User className="w-8 h-8" />;
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

  // Get phase display and icon
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
      prologue: '序章',
      setup: '序章',
      end: '游戏结束',
    };
    return phaseNames[phase] || phase;
  };

  const getPhaseIcon = () => {
    if (phase === 'night' && gameState.nightPhase) {
      const icons: Record<string, React.ReactNode> = {
        'listener': <Eye className="w-3 h-3" />,
        'marked-discuss': <Users className="w-3 h-3" />,
        'marked-vote': <Flame className="w-3 h-3" />,
        'guard': <Shield className="w-3 h-3" />,
        'coroner': <Search className="w-3 h-3" />,
      };
      return icons[gameState.nightPhase] || <Moon className="w-3 h-3" />;
    }
    const icons: Record<string, React.ReactNode> = {
      day: <Sun className="w-3 h-3" />,
      voting: <Vote className="w-3 h-3" />,
      night: <Moon className="w-3 h-3" />,
      setup: <MessageSquare className="w-3 h-3" />,
      end: <CheckCircle2 className="w-3 h-3" />,
    };
    return icons[phase] || <MessageSquare className="w-3 h-3" />;
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-shrink-0 pb-2 px-4 py-3 bg-gradient-to-r from-card via-card/50 to-card border-b border-border">
        <CardTitle className="text-base font-cinzel tracking-wide">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            <div>
              当前发言者
              <span className="block text-[9px] text-muted-foreground font-normal tracking-widest opacity-60">
                SPEAKER
              </span>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="space-y-3">
          {/* Phase Display */}
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">当前阶段</div>
            <Badge variant="outline" className="text-sm px-3 py-0.5 flex items-center gap-1.5 justify-center">
              {getPhaseIcon()}
              {getPhaseDisplay()}
            </Badge>
          </div>

          {/* Current Speaker */}
          {phase === 'prologue' || phase === 'setup' ? (
            <div className="text-center text-muted-foreground py-4">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-xs">故事叙述中...</p>
            </div>
          ) : currentPlayer ? (
            <div className="text-center space-y-2">
              <div
                className={cn(
                  'w-16 h-16 rounded-full mx-auto flex items-center justify-center text-white shadow-lg',
                  `bg-gradient-to-br ${roleGradients[currentPlayer.role] || 'from-gray-600 to-gray-800'}`,
                )}
              >
                {getRoleIcon(currentPlayer.role)}
              </div>
              <div>
                <div className="text-lg font-bold text-foreground">{currentPlayer.name}</div>
                <div className="space-y-0.5">
                  <Badge className={cn('text-xs', roleColors[currentPlayer.role])}>
                    {roleNames[currentPlayer.role]?.name}
                  </Badge>
                  <div className="text-[9px] text-muted-foreground font-cinzel tracking-wider opacity-60">
                    {roleNames[currentPlayer.role]?.subtitle}
                  </div>
                </div>
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
