/**
 * Game end dialog - shows game results and statistics
 */

/* eslint-disable react/no-unescaped-entities */

'use client';

import type { GameState } from '@/types/game';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skull, Heart, Moon, Users, Eye, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GameEndDialogProps {
  gameState: GameState;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GameEndDialog({ gameState, open, onOpenChange }: GameEndDialogProps) {
  const { winner, players, round, voteHistory, nightVoteHistory, listenerChecks, coronerReports } = gameState;

  if (!winner) return null;

  // Calculate statistics
  const alivePlayers = players.filter(p => p.isAlive);
  const deadPlayers = players.filter(p => !p.isAlive);
  const markedPlayers = players.filter(p => p.role === 'marked' || p.role === 'heretic');
  const lambPlayers = players.filter(p => p.role !== 'marked' && p.role !== 'heretic');

  // Role name mapping
  const roleNames: Record<string, string> = {
    marked: '烙印者',
    heretic: '背誓者',
    listener: '聆心者',
    guard: '设闩者',
    coroner: '食灰者',
    twin: '共誓者',
    villager: '羔羊',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-cinzel tracking-wide">
            {winner === 'marked' ? (
              <div className="flex items-center gap-2 text-red-400">
                <Moon className="w-6 h-6" />
                收割阵营获胜
              </div>
            ) : (
              <div className="flex items-center gap-2 text-amber-400">
                <Heart className="w-6 h-6" />
                羔羊阵营获胜
              </div>
            )}
          </DialogTitle>
          <DialogDescription className="text-base">
            {winner === 'marked'
              ? '山灵的收割已然完成，永夜吞噬了白烬山口'
              : '黎明的光芒刺破了永夜，诅咒终于被打破'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            {/* Game Overview */}
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                游戏概况
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border bg-card p-3">
                  <div className="text-xs text-muted-foreground">总回合数</div>
                  <div className="text-2xl font-bold">{round}</div>
                </div>
                <div className="rounded-lg border bg-card p-3">
                  <div className="text-xs text-muted-foreground">幸存者</div>
                  <div className="text-2xl font-bold">{alivePlayers.length}/{players.length}</div>
                </div>
                <div className="rounded-lg border bg-card p-3">
                  <div className="text-xs text-muted-foreground">献祭投票</div>
                  <div className="text-2xl font-bold">{voteHistory.length}</div>
                </div>
                <div className="rounded-lg border bg-card p-3">
                  <div className="text-xs text-muted-foreground">夜间猎杀</div>
                  <div className="text-2xl font-bold">{nightVoteHistory.length}</div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Death List */}
            {deadPlayers.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Skull className="w-4 h-4" />
                    逝者名单
                  </h3>
                  <div className="rounded-lg border bg-card/50 p-3">
                    <div className="space-y-2">
                      {deadPlayers.map(player => (
                        <div key={player.name} className="flex items-center justify-between text-sm">
                          <span className="line-through opacity-60">{player.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {roleNames[player.role] || player.role}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* Player Roles */}
            <div>
              <h3 className="text-sm font-semibold mb-3">玩家身份揭示</h3>
              <div className="space-y-3">
                {/* Marked Camp */}
                <div>
                  <div className="text-xs text-red-400 font-semibold mb-2">收割阵营</div>
                  <div className="grid grid-cols-2 gap-2">
                    {markedPlayers.map(player => (
                      <div
                        key={player.name}
                        className={cn(
                          'rounded border p-2 text-sm flex items-center justify-between',
                          player.isAlive
                            ? 'bg-red-950/30 border-red-500/30'
                            : 'bg-stone-950/30 border-stone-500/30 opacity-60',
                        )}
                      >
                        <span className={player.isAlive ? '' : 'line-through'}>{player.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {roleNames[player.role]}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Lamb Camp */}
                <div>
                  <div className="text-xs text-sky-400 font-semibold mb-2">羔羊阵营</div>
                  <div className="grid grid-cols-2 gap-2">
                    {lambPlayers.map(player => (
                      <div
                        key={player.name}
                        className={cn(
                          'rounded border p-2 text-sm flex items-center justify-between',
                          player.isAlive
                            ? 'bg-sky-950/30 border-sky-500/30'
                            : 'bg-stone-950/30 border-stone-500/30 opacity-60',
                        )}
                      >
                        <span className={player.isAlive ? '' : 'line-through'}>{player.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {roleNames[player.role]}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Special Actions */}
            {(listenerChecks.length > 0 || coronerReports.length > 0) && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-semibold mb-3">特殊行动记录</h3>
                  <div className="space-y-3">
                    {/* Listener Checks */}
                    {listenerChecks.length > 0 && (
                      <div>
                        <div className="text-xs text-purple-400 font-semibold mb-2 flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          聆心者查验
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {listenerChecks.map((check, idx) => (
                            <div
                              key={idx}
                              className="rounded bg-purple-950/30 border border-purple-500/30 p-2 text-xs"
                            >
                              <div className="flex items-center justify-between">
                                <span>R{check.round} - {check.target}</span>
                                <Badge
                                  className={cn(
                                    'text-xs h-4 px-1',
                                    check.isClean ? 'bg-sky-600' : 'bg-red-600',
                                  )}
                                >
                                  {check.isClean ? '清白' : '污秽'}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Coroner Reports */}
                    {coronerReports.length > 0 && (
                      <div>
                        <div className="text-xs text-cyan-400 font-semibold mb-2 flex items-center gap-1">
                          <Flame className="w-3 h-3" />
                          食灰者验尸
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {coronerReports.map((report, idx) => (
                            <div
                              key={idx}
                              className="rounded bg-cyan-950/30 border border-cyan-500/30 p-2 text-xs"
                            >
                              <div className="flex items-center justify-between">
                                <span>R{report.round} - {report.target}</span>
                                <Badge
                                  className={cn(
                                    'text-xs h-4 px-1',
                                    report.isClean ? 'bg-sky-600' : 'bg-red-600',
                                  )}
                                >
                                  {report.isClean ? '清白' : '污秽'}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
