/**
 * Prompt viewer component - displays all AI prompts for current game state
 */

'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useGameStore } from '@/stores/game-store';
import { buildPrompt } from '@/lib/deepseek';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Brain, User, Users, Skull } from 'lucide-react';
import type { Player } from '@/types/game';

interface PromptViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
 * Get faction display name
 */
function getFactionDisplay(role: string): { name: string; color: string } {
  if (role === 'marked' || role === 'heretic') {
    return { name: '收割阵营', color: 'bg-seal' };
  }
  return { name: '羔羊阵营', color: 'bg-frost-deep' };
}

/**
 * Individual player prompt display
 */
function PlayerPromptDisplay({ player }: { player: Player }) {
  const { gameState } = useGameStore();

  if (!gameState) {
    return null;
  }

  const prompt = buildPrompt(player, gameState);
  const roleInfo = roleNames[player.role] || { name: player.role, subtitle: '' };
  const faction = getFactionDisplay(player.role);

  return (
    <div className="space-y-3">
      {/* Player Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {player.isAlive ? (
            <User className="w-5 h-5 text-pyre-soft" />
          ) : (
            <Skull className="w-5 h-5 text-seal-light" />
          )}
          <div>
            <h3 className="font-bold text-lg">{player.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {roleInfo.name}
              </Badge>
              <Badge className={`text-xs ${faction.color}`}>
                {faction.name}
              </Badge>
              {!player.isAlive && (
                <Badge variant="destructive" className="text-xs">
                  已死亡
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Prompt Content */}
      <ScrollArea className="h-[500px] w-full">
        <pre className="whitespace-pre-wrap font-mono text-xs bg-secondary/50 text-cyan-300 p-4 rounded border border-cyan-500/30">
          {prompt}
        </pre>
      </ScrollArea>
    </div>
  );
}

/**
 * All players prompt overview
 */
function AllPlayersOverview() {
  const { gameState } = useGameStore();

  if (!gameState) {
    return (
      <div className="flex items-center justify-center h-[500px] text-muted-foreground">
        <p>当前没有游戏进行中</p>
      </div>
    );
  }

  const alivePlayers = gameState.players.filter(p => p.isAlive);
  const deadPlayers = gameState.players.filter(p => !p.isAlive);

  return (
    <ScrollArea className="h-[500px] w-full">
      <div className="space-y-6 p-2">
        {/* Alive Players */}
        {alivePlayers.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-pyre-soft" />
              <h3 className="font-bold text-lg">存活玩家 ({alivePlayers.length})</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {alivePlayers.map(player => {
                const roleInfo = roleNames[player.role] || { name: player.role, subtitle: '' };
                const faction = getFactionDisplay(player.role);

                return (
                  <div key={player.id} className="p-3 rounded-lg border border-border bg-card">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-pyre-soft" />
                      <span className="font-semibold">{player.name}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {roleInfo.name}
                      </Badge>
                      <Badge className={`text-xs ${faction.color}`}>
                        {faction.name}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Dead Players */}
        {deadPlayers.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Skull className="w-5 h-5 text-seal-light" />
              <h3 className="font-bold text-lg">已死亡玩家 ({deadPlayers.length})</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {deadPlayers.map(player => {
                const roleInfo = roleNames[player.role] || { name: player.role, subtitle: '' };
                const faction = getFactionDisplay(player.role);

                return (
                  <div key={player.id} className="p-3 rounded-lg border border-border bg-card opacity-60">
                    <div className="flex items-center gap-2">
                      <Skull className="w-4 h-4 text-seal-light" />
                      <span className="font-semibold line-through">{player.name}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {roleInfo.name}
                      </Badge>
                      <Badge className={`text-xs ${faction.color}`}>
                        {faction.name}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}

export function PromptViewer({ open, onOpenChange }: PromptViewerProps) {
  const { gameState } = useGameStore();

  if (!gameState) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              神谕指引
            </DialogTitle>
            <DialogDescription>
              查看当前游戏中所有AI玩家的提示词
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center h-[500px] text-muted-foreground">
            <p>当前没有游戏进行中</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            神谕指引
          </DialogTitle>
          <DialogDescription>
            查看当前游戏中所有AI玩家的提示词（第 {gameState.round} 回合 · {gameState.phase}）
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full overflow-hidden">
          <div className="w-full overflow-x-auto overflow-y-hidden pb-2 -mx-6 px-6">
            <TabsList className="inline-flex">
              <TabsTrigger value="overview" className="text-xs flex-shrink-0">
                总览
              </TabsTrigger>
              {gameState.players.map(player => (
                <TabsTrigger key={player.id} value={player.id} className="text-xs flex-shrink-0">
                  {player.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="overview" className="mt-4">
            <AllPlayersOverview />
          </TabsContent>

          {gameState.players.map(player => (
            <TabsContent key={player.id} value={player.id} className="mt-4">
              <PlayerPromptDisplay player={player} />
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
