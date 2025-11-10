/**
 * Faction statistics component - shows alive players by faction
 * 白烬山口 (Whitefire Pass) - 阵营对抗统计
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { GameState } from '@/types/game';
import { Swords, Shield, Skull, AlertTriangle, CheckCircle2, Target } from 'lucide-react';

interface FactionStatsProps {
  gameState: GameState;
}

export function FactionStats({ gameState }: FactionStatsProps) {
  const alivePlayers = gameState.players.filter((p) => p.isAlive);
  // 收割阵营 = 烙印者 + 背誓者
  const aliveHarvest = alivePlayers.filter(
    (p) => p.role === 'marked' || p.role === 'heretic',
  );
  // 羔羊阵营 = 所有其他人
  const aliveLambs = alivePlayers.filter(
    (p) => p.role !== 'marked' && p.role !== 'heretic',
  );

  const totalAlive = alivePlayers.length;
  const harvestPercent = totalAlive > 0 ? (aliveHarvest.length / totalAlive) * 100 : 0;
  const lambPercent = totalAlive > 0 ? (aliveLambs.length / totalAlive) * 100 : 0;

  return (
    <Card className="bg-card/90 backdrop-blur-sm border-slate-700 shadow-inner-glow">
      <CardHeader className="pb-3 bg-gradient-to-r from-card via-card/50 to-card border-b border-border">
        <CardTitle className="text-sm font-bold font-cinzel tracking-wide">
          <div className="flex items-center gap-2">
            <Swords className="w-4 h-4" />
            <div>
              阵营对抗
              <span className="block text-[8px] text-muted-foreground font-normal tracking-widest opacity-60">
                FACTIONS
              </span>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Lamb Faction */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="space-y-2 cursor-help">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-sky-400">
                    <Shield className="w-4 h-4" />
                    羔羊阵营
                  </span>
                  <span className="font-bold text-sky-400">
                    {aliveLambs.length}
                  </span>
                </div>
                <div className="h-3 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sky-600 to-sky-400 transition-all duration-500"
                    style={{ width: `${lambPercent}%` }}
                  />
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p className="text-xs">
                存活: {aliveLambs.map((p) => p.name).join('、')}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Harvest Faction */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="space-y-2 cursor-help">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-red-400">
                    <Skull className="w-4 h-4" />
                    收割阵营
                  </span>
                  <span className="font-bold text-red-400">
                    {aliveHarvest.length}
                  </span>
                </div>
                <div className="h-3 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-500"
                    style={{ width: `${harvestPercent}%` }}
                  />
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p className="text-xs">
                存活: {aliveHarvest.map((p) => p.name).join('、')}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Balance Status */}
        <div className="pt-2 border-t border-border">
          <div className="flex items-center justify-center gap-2 text-xs">
            {aliveHarvest.length >= aliveLambs.length ? (
              <>
                <AlertTriangle className="w-3 h-3" />
                收割阵营占据优势！
              </>
            ) : aliveHarvest.length === 0 ? (
              <>
                <CheckCircle2 className="w-3 h-3" />
                羔羊获胜！
              </>
            ) : (
              <>
                <Target className="w-3 h-3" />
                势均力敌
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
