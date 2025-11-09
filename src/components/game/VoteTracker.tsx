/**
 * Vote tracker component - visualizes voting records and seer checks
 */

'use client';

import type { GameState } from '@/types/game';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Eye, Moon, Users, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoteTrackerProps {
  gameState: GameState;
}

export function VoteTracker({ gameState }: VoteTrackerProps) {
  const { voteHistory = [], nightVoteHistory = [], seerChecks = [] } = gameState;

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
      <CardHeader className="flex-shrink-0 pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="w-5 h-5" />
          投票与查验记录
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full px-4 pb-4">
          <div className="space-y-4">
            {/* Seer Checks */}
            {seerChecks.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-purple-400">
                  <Eye className="w-4 h-4" />
                  预言家查验记录
                </div>
                <div className="space-y-2">
                  {seerChecks.map((check, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg bg-purple-950/30 border border-purple-500/30 p-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            第 {check.round} 回合
                          </Badge>
                          <span className="text-sm text-foreground">{check.target}</span>
                        </div>
                        <Badge
                          className={cn(
                            'text-xs',
                            !check.isGood
                              ? 'bg-red-600 hover:bg-red-700'
                              : 'bg-blue-600 hover:bg-blue-700',
                          )}
                        >
                          {check.isGood ? '好人' : '狼人'}
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
              .map(([voteRound, roundVotes]) => {
                const voteCounts = calculateVoteCounts(roundVotes);
                return (
                  <div key={`night-${voteRound}`} className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-semibold text-red-400">
                      <Moon className="w-4 h-4" />
                      第 {voteRound} 回合 - 狼人击杀投票
                    </div>
                    <div className="space-y-2">
                      {/* Vote counts with bar chart */}
                      {voteCounts.length > 0 && (
                        <div className="rounded-lg bg-red-950/30 border border-red-500/30 p-3">
                          <div className="text-xs text-muted-foreground mb-3">票数统计</div>
                          <div className="space-y-2">
                            {voteCounts.map(({ target, count }) => {
                              const maxVotes = voteCounts[0].count;
                              const percentage = (count / maxVotes) * 100;
                              const isLeader = count === maxVotes;

                              return (
                                <div key={target} className="space-y-1">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-foreground font-medium">{target}</span>
                                    <Badge variant="destructive" className="text-xs">
                                      {count} 票
                                    </Badge>
                                  </div>
                                  {/* Progress bar */}
                                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                    <div
                                      className={cn(
                                        "h-full transition-all duration-500 rounded-full",
                                        isLeader
                                          ? "bg-gradient-to-r from-red-600 to-red-400"
                                          : "bg-gradient-to-r from-stone-600 to-stone-500"
                                      )}
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      {/* Individual votes */}
                      <div className="space-y-1">
                        {roundVotes.map((vote, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 text-xs text-muted-foreground"
                          >
                            <span>{vote.from}</span>
                            <ArrowRight className="w-3 h-3" />
                            <span>{vote.target}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}

            {/* Day Votes */}
            {Array.from(votesByRound.entries())
              .sort((a, b) => b[0] - a[0])
              .map(([voteRound, roundVotes]) => {
                const voteCounts = calculateVoteCounts(roundVotes);
                return (
                  <div key={`day-${voteRound}`} className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-semibold text-amber-400">
                      <Users className="w-4 h-4" />
                      第 {voteRound} 回合 - 白天投票
                    </div>
                    <div className="space-y-2">
                      {/* Vote counts with bar chart */}
                      {voteCounts.length > 0 && (
                        <div className="rounded-lg bg-amber-950/30 border border-amber-500/30 p-3">
                          <div className="text-xs text-muted-foreground mb-3">票数统计</div>
                          <div className="space-y-2">
                            {voteCounts.map(({ target, count }) => {
                              const maxVotes = voteCounts[0].count;
                              const percentage = (count / maxVotes) * 100;
                              const isLeader = count === maxVotes;

                              return (
                                <div key={target} className="space-y-1">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-foreground font-medium">{target}</span>
                                    <Badge
                                      className={cn(
                                        'text-xs',
                                        isLeader
                                          ? 'bg-orange-600 hover:bg-orange-700'
                                          : 'bg-stone-600 hover:bg-stone-700',
                                      )}
                                    >
                                      {count} 票
                                    </Badge>
                                  </div>
                                  {/* Progress bar */}
                                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                    <div
                                      className={cn(
                                        "h-full transition-all duration-500 rounded-full",
                                        isLeader
                                          ? "bg-gradient-to-r from-orange-600 to-orange-400"
                                          : "bg-gradient-to-r from-stone-600 to-stone-500"
                                      )}
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      {/* Individual votes */}
                      <div className="space-y-1">
                        {roundVotes.map((vote, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 text-xs text-muted-foreground"
                          >
                            <span>{vote.from}</span>
                            <ArrowRight className="w-3 h-3" />
                            <span>{vote.target}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}

            {/* Empty state */}
            {voteHistory.length === 0 && nightVoteHistory.length === 0 && seerChecks.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <p className="text-sm">暂无投票或查验记录</p>
                <p className="text-xs mt-1">游戏进行后会显示在这里</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
