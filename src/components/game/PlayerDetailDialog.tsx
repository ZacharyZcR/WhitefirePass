/**
 * Player detail dialog with tabs for info and relationships
 */

'use client';

import { useState } from 'react';
import type { Player } from '@/types/game';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getRelationshipsForCharacter, getRelationshipLabel } from '@/lib/relationships';
import { getStateChangeDescription } from '@/lib/emotional-prompts';
import {
  User,
  Heart,
  HeartCrack,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  Sparkles,
  Skull,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlayerDetailDialogProps {
  player: Player | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Emotional state color mapping
 */
const emotionalStateColors: Record<string, string> = {
  normal: 'text-slate-400',
  virtue: 'text-blue-400',
  vice: 'text-red-400',
};

const emotionalStateIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  normal: Minus,
  virtue: Sparkles,
  vice: Skull,
};

const emotionalStateLabels: Record<string, string> = {
  normal: '正常',
  virtue: '美德',
  vice: '罪恶',
};

export function PlayerDetailDialog({ player, open, onOpenChange }: PlayerDetailDialogProps) {
  const [activeTab, setActiveTab] = useState('info');

  if (!player) return null;

  const relationships = getRelationshipsForCharacter(player.name);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-3">
            <User className="w-5 h-5" />
            {player.name}
            {player.englishName && (
              <span className="text-sm text-muted-foreground font-cinzel">
                {player.englishName}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="flex-shrink-0 w-full justify-start">
            <TabsTrigger value="info">基本信息</TabsTrigger>
            <TabsTrigger value="relationships" className="relative">
              关系图谱
              {relationships.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                  {relationships.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="info" className="flex-1 overflow-hidden m-0">
            <ScrollArea className="h-[calc(85vh-180px)] pr-4">
              <div className="space-y-4 p-4">
                {/* Current Emotional State */}
                {player.emotionalState && player.emotionalState !== 'normal' && (
                  <Card className="border-2 border-amber-500/40 bg-amber-500/5">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        当前情感状态
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        {(() => {
                          const StateIcon = emotionalStateIcons[player.emotionalState];
                          return (
                            <StateIcon
                              className={cn('w-5 h-5', emotionalStateColors[player.emotionalState])}
                            />
                          );
                        })()}
                        <span className={cn('font-bold', emotionalStateColors[player.emotionalState])}>
                          {emotionalStateLabels[player.emotionalState]}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Character Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">角色信息</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {player.gender && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">性别</span>
                        <span>{player.gender}</span>
                      </div>
                    )}
                    {player.occupation && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">职业</span>
                        <span>{player.occupation}</span>
                      </div>
                    )}
                    {player.trait && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">特质</span>
                        <span>{player.trait}</span>
                      </div>
                    )}
                    {player.height && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">身高</span>
                        <span>{player.height}</span>
                      </div>
                    )}
                    {player.bloodType && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">血型</span>
                        <span>{player.bloodType}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">状态</span>
                      <span className={player.isAlive ? 'text-green-400' : 'text-red-400'}>
                        {player.isAlive ? '存活' : '已死亡'}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Personality */}
                {player.personality && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">性格描述</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {player.personality}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Relationships Tab */}
          <TabsContent value="relationships" className="flex-1 overflow-hidden m-0">
            <ScrollArea className="h-[calc(85vh-180px)] pr-4">
              <div className="space-y-4 p-4">
                {relationships.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>此角色暂无特殊关系</p>
                  </div>
                ) : (
                  relationships.map((rel, index) => {
                    const virtueDesc = getStateChangeDescription(
                      player.name,
                      rel.target,
                      'virtue',
                      getRelationshipLabel(rel.type),
                    );
                    const viceDesc = getStateChangeDescription(
                      player.name,
                      rel.target,
                      'vice',
                      getRelationshipLabel(rel.type),
                    );

                    const normalChance = 1 - rel.virtueChance - rel.viceChance;

                    return (
                      <Card
                        key={index}
                        className="border-2 border-purple-500/30 bg-purple-500/5"
                      >
                        <CardHeader>
                          <CardTitle className="text-base flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Heart className="w-4 h-4 text-purple-400" />
                              <span>{rel.target}</span>
                            </div>
                            <Badge variant="outline" className="font-normal">
                              {getRelationshipLabel(rel.type)}
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Trigger Description */}
                          <div className="text-sm text-muted-foreground bg-slate-800/50 rounded-lg p-3">
                            <p>
                              当 <span className="text-foreground font-medium">{rel.target}</span>{' '}
                              死亡时，{player.name} 的情感状态可能发生变化：
                            </p>
                          </div>

                          {/* Virtue Chance */}
                          {rel.virtueChance > 0 && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <TrendingUp className="w-4 h-4 text-blue-400" />
                                  <span className="text-blue-400 font-medium">美德觉醒</span>
                                </div>
                                <span className="text-blue-400 font-mono">
                                  {(rel.virtueChance * 100).toFixed(0)}%
                                </span>
                              </div>
                              <Progress value={rel.virtueChance * 100} className="h-2 bg-slate-800">
                                <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full" />
                              </Progress>
                              <div className="text-xs bg-blue-950/30 border border-blue-800/30 rounded-lg p-3">
                                <div className="font-medium text-blue-400 mb-1">
                                  {virtueDesc.title}
                                </div>
                                <p className="text-muted-foreground">{virtueDesc.description}</p>
                              </div>
                            </div>
                          )}

                          {/* Vice Chance */}
                          {rel.viceChance > 0 && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <TrendingDown className="w-4 h-4 text-red-400" />
                                  <span className="text-red-400 font-medium">罪恶堕落</span>
                                </div>
                                <span className="text-red-400 font-mono">
                                  {(rel.viceChance * 100).toFixed(0)}%
                                </span>
                              </div>
                              <Progress value={rel.viceChance * 100} className="h-2 bg-slate-800">
                                <div className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full" />
                              </Progress>
                              <div className="text-xs bg-red-950/30 border border-red-800/30 rounded-lg p-3">
                                <div className="font-medium text-red-400 mb-1">
                                  {viceDesc.title}
                                </div>
                                <p className="text-muted-foreground">{viceDesc.description}</p>
                              </div>
                            </div>
                          )}

                          {/* Normal Chance */}
                          {normalChance > 0 && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <Minus className="w-4 h-4 text-slate-400" />
                                  <span className="text-slate-400 font-medium">保持正常</span>
                                </div>
                                <span className="text-slate-400 font-mono">
                                  {(normalChance * 100).toFixed(0)}%
                                </span>
                              </div>
                              <Progress value={normalChance * 100} className="h-2 bg-slate-800">
                                <div className="h-full bg-gradient-to-r from-slate-500 to-slate-400 rounded-full" />
                              </Progress>
                              <div className="text-xs text-muted-foreground">
                                情感状态不会发生变化，继续保持当前状态
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
