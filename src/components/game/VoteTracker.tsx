/**
 * Vote tracker component - visualizes voting records and seer checks
 */

'use client';

import type { GameState } from '@/types/game';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Eye, Moon, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoteTrackerProps {
  gameState: GameState;
}

export function VoteTracker({ gameState }: VoteTrackerProps) {
  const { voteHistory = [], nightVoteHistory = [], listenerChecks = [] } = gameState;

  // Group votes by round from history
  const votesByRound = new Map<number, typeof voteHistory>();
  voteHistory.forEach((vote) => {
    const voteRound = vote.round ?? 0;
    if (!votesByRound.has(voteRound)) {
      votesByRound.set(voteRound, []);
    }
    votesByRound.get(voteRound)?.push(vote);
  });

  // Group night votes by round from history
  const nightVotesByRound = new Map<number, typeof nightVoteHistory>();
  nightVoteHistory.forEach((vote) => {
    const voteRound = vote.round ?? 0;
    if (!nightVotesByRound.has(voteRound)) {
      nightVotesByRound.set(voteRound, []);
    }
    nightVotesByRound.get(voteRound)?.push(vote);
  });

  // Calculate vote counts
  const calculateVoteCounts = (voteList: typeof voteHistory) => {
    const counts = new Map<string, number>();
    voteList.forEach((vote) => {
      counts.set(vote.target, (counts.get(vote.target) ?? 0) + 1);
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([target, count]) => ({ target, count }));
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0 pb-2 px-3 py-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Users className="w-4 h-4" />
          投票记录
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full px-3 pb-3">
          <div className="space-y-3">
            {/* Listener Checks */}
            {listenerChecks.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs font-semibold text-purple-400">
                  <Eye className="w-3 h-3" />
                  查验
                </div>
                <div className="space-y-1">
                  {listenerChecks.slice(-3).map((check, idx) => (
                    <div
                      key={idx}
                      className="rounded bg-purple-950/30 border border-purple-500/30 p-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">R{check.round}</span>
                          <span className="text-foreground">{check.target}</span>
                        </div>
                        <Badge
                          className={cn(
                            'text-xs h-4 px-1',
                            !check.isClean
                              ? 'bg-red-600'
                              : 'bg-sky-600',
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

            {/* Night Votes (Werewolf) */}
            {Array.from(nightVotesByRound.entries())
              .sort((a, b) => b[0] - a[0])
              .slice(0, 2)
              .map(([voteRound, roundVotes]) => {
                const voteCounts = calculateVoteCounts(roundVotes);
                return (
                  <div key={`night-${voteRound}`} className="space-y-1">
                    <div className="flex items-center gap-1 text-xs font-semibold text-red-400">
                      <Moon className="w-3 h-3" />
                      R{voteRound} 夜
                    </div>
                    <div className="space-y-1">
                      {/* Vote counts */}
                      {voteCounts.length > 0 && (
                        <div className="rounded bg-red-950/30 border border-red-500/30 p-2">
                          <div className="space-y-1">
                            {voteCounts.map(({ target, count }) => {
                              const maxVotes = voteCounts[0].count;
                              const isLeader = count === maxVotes;

                              return (
                                <div key={target} className="flex items-center justify-between text-xs">
                                  <span className="text-foreground">{target}</span>
                                  <Badge variant="destructive" className={cn("text-xs h-4 px-1", isLeader && "bg-red-600")}>
                                    {count}票
                                  </Badge>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

            {/* Day Votes */}
            {Array.from(votesByRound.entries())
              .sort((a, b) => b[0] - a[0])
              .slice(0, 2)
              .map(([voteRound, roundVotes]) => {
                const voteCounts = calculateVoteCounts(roundVotes);
                return (
                  <div key={`day-${voteRound}`} className="space-y-1">
                    <div className="flex items-center gap-1 text-xs font-semibold text-amber-400">
                      <Users className="w-3 h-3" />
                      R{voteRound} 献祭
                    </div>
                    <div className="space-y-1">
                      {/* Vote counts */}
                      {voteCounts.length > 0 && (
                        <div className="rounded bg-amber-950/30 border border-amber-500/30 p-2">
                          <div className="space-y-1">
                            {voteCounts.map(({ target, count }) => {
                              const maxVotes = voteCounts[0].count;
                              const isLeader = count === maxVotes;

                              return (
                                <div key={target} className="flex items-center justify-between text-xs">
                                  <span className="text-foreground">{target}</span>
                                  <Badge
                                    className={cn(
                                      'text-xs h-4 px-1',
                                      isLeader
                                        ? 'bg-orange-600'
                                        : 'bg-stone-600',
                                    )}
                                  >
                                    {count}票
                                  </Badge>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

            {/* Empty state */}
            {voteHistory.length === 0 && nightVoteHistory.length === 0 && listenerChecks.length === 0 && (
              <div className="text-center text-muted-foreground py-4">
                <p className="text-xs">暂无记录</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
