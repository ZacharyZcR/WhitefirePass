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
  const { votes, nightVotes, seerChecks = [], round } = gameState;

  // Group votes by round
  const votesByRound = new Map<number, typeof votes>();
  votes.forEach((vote) => {
    const msg = gameState.messages.find((m) => m.type === 'vote' && m.from === vote.from);
    const voteRound = msg?.round || round;
    if (!votesByRound.has(voteRound)) {
      votesByRound.set(voteRound, []);
    }
    votesByRound.get(voteRound)?.push(vote);
  });

  // Group night votes by round
  const nightVotesByRound = new Map<number, typeof nightVotes>();
  nightVotes.forEach((vote) => {
    const msg = gameState.messages.find((m) => m.from === vote.from && m.visibility === 'werewolf');
    const voteRound = msg?.round || round;
    if (!nightVotesByRound.has(voteRound)) {
      nightVotesByRound.set(voteRound, []);
    }
    nightVotesByRound.get(voteRound)?.push(vote);
  });

  // Calculate vote counts
  const calculateVoteCounts = (voteList: typeof votes) => {
    const counts = new Map<string, number>();
    voteList.forEach((vote) => {
      counts.set(vote.target, (counts.get(vote.target) || 0) + 1);
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([target, count]) => ({ target, count }));
  };

  const roleNames: Record<string, string> = {
    werewolf: '狼人',
    villager: '村民',
    seer: '预言家',
    witch: '女巫',
    hunter: '猎人',
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
                            check.role === 'werewolf'
                              ? 'bg-red-600 hover:bg-red-700'
                              : 'bg-blue-600 hover:bg-blue-700',
                          )}
                        >
                          {roleNames[check.role]}
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
                      {/* Vote counts */}
                      {voteCounts.length > 0 && (
                        <div className="rounded-lg bg-red-950/30 border border-red-500/30 p-3">
                          <div className="text-xs text-muted-foreground mb-2">票数统计</div>
                          <div className="space-y-1">
                            {voteCounts.map(({ target, count }) => (
                              <div
                                key={target}
                                className="flex items-center justify-between text-sm"
                              >
                                <span className="text-foreground">{target}</span>
                                <Badge variant="destructive" className="text-xs">
                                  {count} 票
                                </Badge>
                              </div>
                            ))}
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
                      {/* Vote counts */}
                      {voteCounts.length > 0 && (
                        <div className="rounded-lg bg-amber-950/30 border border-amber-500/30 p-3">
                          <div className="text-xs text-muted-foreground mb-2">票数统计</div>
                          <div className="space-y-1">
                            {voteCounts.map(({ target, count }) => (
                              <div
                                key={target}
                                className="flex items-center justify-between text-sm"
                              >
                                <span className="text-foreground">{target}</span>
                                <Badge
                                  className={cn(
                                    'text-xs',
                                    count === voteCounts[0].count
                                      ? 'bg-orange-600 hover:bg-orange-700'
                                      : 'bg-stone-600 hover:bg-stone-700',
                                  )}
                                >
                                  {count} 票
                                </Badge>
                              </div>
                            ))}
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
            {votes.length === 0 && nightVotes.length === 0 && seerChecks.length === 0 && (
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
