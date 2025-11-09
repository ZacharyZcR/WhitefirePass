/**
 * Faction statistics component - shows villagers vs werewolves
 */

'use client';

import type { GameState } from '@/types/game';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Users, Dog, Shield, Swords, AlertTriangle, CheckCircle2, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FactionStatsProps {
  gameState: GameState;
}

export function FactionStats({ gameState }: FactionStatsProps) {
  const alivePlayers = gameState.players.filter((p) => p.isAlive);
  const aliveWerewolves = alivePlayers.filter((p) => p.role === 'werewolf');
  const aliveVillagers = alivePlayers.filter((p) => p.role !== 'werewolf');

  const totalAlive = alivePlayers.length;
  const werewolfPercent = totalAlive > 0 ? (aliveWerewolves.length / totalAlive) * 100 : 0;
  const villagerPercent = totalAlive > 0 ? (aliveVillagers.length / totalAlive) * 100 : 0;

  return (
    <Card className="bg-card/90 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Swords className="w-4 h-4" />
          阵营对抗
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Villagers */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="space-y-2 cursor-help">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-blue-400">
                    <Shield className="w-4 h-4" />
                    好人阵营
                  </span>
                  <span className="font-bold text-blue-400">
                    {aliveVillagers.length}
                  </span>
                </div>
                <div className="h-3 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-500"
                    style={{ width: `${villagerPercent}%` }}
                  />
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p className="text-xs">
                存活: {aliveVillagers.map((p) => p.name).join(', ')}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Werewolves */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="space-y-2 cursor-help">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-red-400">
                    <Dog className="w-4 h-4" />
                    狼人阵营
                  </span>
                  <span className="font-bold text-red-400">
                    {aliveWerewolves.length}
                  </span>
                </div>
                <div className="h-3 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-500"
                    style={{ width: `${werewolfPercent}%` }}
                  />
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p className="text-xs">
                存活: {aliveWerewolves.map((p) => p.name).join(', ')}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Total alive */}
        <div className="pt-2 border-t border-border">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              存活人数
            </span>
            <span className="font-semibold">
              {totalAlive} / {gameState.players.length}
            </span>
          </div>
        </div>

        {/* Victory condition hint */}
        {totalAlive > 0 && (
          <div className={cn(
            "text-xs p-2 rounded text-center font-medium transition-colors flex items-center justify-center gap-1",
            aliveWerewolves.length >= aliveVillagers.length
              ? "bg-red-950/50 text-red-400"
              : aliveWerewolves.length === 0
                ? "bg-blue-950/50 text-blue-400"
                : "bg-yellow-950/50 text-yellow-400"
          )}>
            {aliveWerewolves.length >= aliveVillagers.length ? (
              <>
                <AlertTriangle className="w-3 h-3" />
                狼人占据优势！
              </>
            ) : aliveWerewolves.length === 0 ? (
              <>
                <CheckCircle2 className="w-3 h-3" />
                好人获胜！
              </>
            ) : (
              <>
                <Target className="w-3 h-3" />
                势均力敌
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
