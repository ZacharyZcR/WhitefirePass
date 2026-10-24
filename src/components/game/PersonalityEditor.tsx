/**
 * Traveler Gallery - Tarot Card Style
 * Display all travelers as tarot cards
 */

'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/stores/game-store';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Portrait } from './Portrait';
import { roleInfo, toRoman } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';
import {
  Sparkles,
  Heart,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  BookOpen,
  Calendar,
  Cake,
  User as UserIcon,
  Briefcase,
  Sparkle,
  Ruler,
  Droplet,
} from 'lucide-react';
import type { Player } from '@/types/game';
import { getRelationshipsForCharacter, getRelationshipLabel } from '@/lib/relationships';
import { getStateChangeDescription } from '@/lib/emotional-prompts';
import { getCharacterAutobiographies } from '@/lib/character-autobiographies';

interface PersonalityEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Jump straight to this traveler's dossier when opening */
  focusPlayerId?: string | null;
}

/** Gallery card: portrait at the 832×1216 ratio with an engraved name strip */
function GalleryCard({ player, seat, onClick }: { player: Player; seat: number; onClick: () => void }) {
  const role = roleInfo(player.role);
  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-sm border border-brass/25 bg-ink-800 text-left transition-all duration-300 hover:-translate-y-1 hover:border-brass/70 hover:shadow-[0_10px_30px_rgba(0,0,0,0.6)]"
    >
      <Portrait name={player.name} dead={!player.isAlive} className="aspect-[832/1216] w-full" imgClassName="transition-transform duration-500 group-hover:scale-105" />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent px-3 pb-2 pt-8">
        <div className="font-cinzel text-[9px] tracking-[0.3em] text-brass/60">{toRoman(seat)}</div>
        <div className={cn('font-serif text-sm font-semibold text-parchment', !player.isAlive && 'line-through opacity-60')}>
          {player.name}
        </div>
        <div className="text-[10px]" style={{ color: role.color }}>{role.name}</div>
      </div>
    </button>
  );
}

export function PersonalityEditor({ open, onOpenChange, focusPlayerId }: PersonalityEditorProps) {
  const { gameState } = useGameStore();
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    if (open) {
      setSelectedPlayerId(focusPlayerId ?? null);
      setShowDetail(Boolean(focusPlayerId));
    }
  }, [open, focusPlayerId]);

  if (!gameState) {
    return null;
  }

  const handleCardClick = (playerId: string) => {
    setSelectedPlayerId(playerId);
    setShowDetail(true);
  };

  const handleClose = () => {
    setShowDetail(false);
    setSelectedPlayerId(null);
  };

  const selectedPlayer = selectedPlayerId
    ? gameState.players.find((p) => p.id === selectedPlayerId)
    : null;

  const handleDialogChange = (newOpen: boolean) => {
    if (!newOpen) {
      // If closing dialog, reset all states
      setShowDetail(false);
      setSelectedPlayerId(null);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent
        className="max-w-5xl max-h-[88vh] overflow-hidden flex flex-col"
        onInteractOutside={(e) => {
          // If detail panel is open, close it instead of the dialog
          if (showDetail) {
            e.preventDefault();
            handleClose();
          }
        }}
      >
        <DialogHeader className="flex-shrink-0 border-b border-brass/20 pb-4">
          <DialogTitle className="flex items-center gap-2 text-parchment">
            <Sparkles className="w-5 h-5 text-brass" />
            {selectedPlayer ? '旅者档案' : '旅者画廊'}
          </DialogTitle>
          <DialogDescription className="text-frost-dim">
            {selectedPlayer ? (
              <button
                onClick={handleClose}
                className="text-brass hover:text-brass-light transition-colors"
              >
                ← 返回画廊
              </button>
            ) : (
              '点击卡片查看旅者详情'
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto relative">
          {!showDetail ? (
            /* Gallery View - responsive grid */
            <div className="py-5 px-2">
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                {gameState.players.map((player, i) => (
                  <GalleryCard key={player.id} player={player} seat={i + 1} onClick={() => handleCardClick(player.id)} />
                ))}
              </div>
            </div>
          ) : (
            /* Detail View - full container */
            selectedPlayer && (
              <div className="min-h-full animate-in fade-in duration-500">
                <div className="max-w-6xl mx-auto p-6 sm:p-8 space-y-8">
                  {/* Top Section: Portrait + Basic Profile */}
                  <div className="flex flex-col lg:flex-row gap-6 items-start">
                    {/* Portrait - designed for 832×1216 */}
                    <div className="flex-shrink-0">
                      <Portrait
                        name={selectedPlayer.name}
                        dead={!selectedPlayer.isAlive}
                        className="w-[300px] aspect-[832/1216] rounded-sm brass-frame"
                      />
                    </div>

                    {/* Basic Profile */}
                    <div className="flex-1">
                      <CharacterBasicInfo player={selectedPlayer} />
                    </div>
                  </div>

                  {/* Bottom Section: Name + Details */}
                  <div className="border-t border-brass/20 pt-8">
                    <TravelerDetail player={selectedPlayer} />
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Character basic info card - below tarot card
 */
function CharacterBasicInfo({ player }: { player: Player }) {
  // Calculate birth date based on age (game year is 1913)
  const birthYear = player.age ? 1913 - player.age : null;
  const birthDate = birthYear ? `${birthYear}年` : '未知';

  const infoItems = [
    { label: '年龄', value: player.age ? `${player.age}岁` : '未知', Icon: Calendar },
    { label: '出生', value: birthDate, Icon: Cake },
    { label: '性别', value: player.gender || '未知', Icon: UserIcon },
    { label: '职业', value: player.occupation || '未知', Icon: Briefcase },
    { label: '性格', value: player.trait || '未知', Icon: Sparkle },
    { label: '身高', value: player.height || '未知', Icon: Ruler },
    { label: '血型', value: player.bloodType || '未知', Icon: Droplet },
  ];

  return (
    <div className="border border-brass/25 rounded-lg p-5 bg-black/30 backdrop-blur-sm">
      <h4 className="text-sm font-semibold text-brass-light mb-4 font-cinzel tracking-wider text-center border-b border-brass/20 pb-3">
        BASIC PROFILE
      </h4>
      <div className="space-y-3">
        {infoItems.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between text-sm group py-0.5"
          >
            <span className="flex items-center gap-2 text-frost-dim">
              <item.Icon className="w-3.5 h-3.5 text-brass/60" />
              {item.label}
            </span>
            <span className="text-parchment font-medium">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Traveler detail panel - right side content
 */
function TravelerDetail({ player }: { player: Player }) {
  const roleNames: Record<string, { name: string; subtitle: string }> = {
    marked: { name: '烙印者', subtitle: 'The Marked' },
    heretic: { name: '背誓者', subtitle: 'The Heretic' },
    listener: { name: '聆心者', subtitle: 'The Listener' },
    coroner: { name: '食灰者', subtitle: 'Ash-Walker' },
    twin: { name: '共誓者', subtitle: 'The Twin' },
    guard: { name: '设闩者', subtitle: 'Guardian' },
    innocent: { name: '无知者', subtitle: 'The Innocent' },
  };

  const relationships = getRelationshipsForCharacter(player.name);
  const autobiographies = getCharacterAutobiographies(player.name);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-brass/20 pb-5">
        {/* Name - Chinese */}
        <h3 className="text-4xl font-bold text-parchment mb-2 tracking-wide">
          {player.name}
        </h3>
        {/* Name - English Gothic */}
        {player.englishName && (
          <div className="mb-4">
            <p className="text-2xl font-cinzel text-brass tracking-widest uppercase" style={{ letterSpacing: '0.15em' }}>
              {player.englishName}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-brass/30 to-transparent"></div>
              <span className="text-brass-dim text-xs">✦</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-brass/30 to-transparent"></div>
            </div>
          </div>
        )}
        {/* Role */}
        <div className="flex items-center gap-3">
          <span className="text-lg text-brass font-cinzel tracking-wider">
            {roleNames[player.role]?.name}
          </span>
          <span className="text-brass-dim">•</span>
          <span className="text-sm text-frost-dim/70 font-cinzel tracking-wide">
            {roleNames[player.role]?.subtitle}
          </span>
        </div>
      </div>

      {/* Basic info */}
      <div className="border border-brass/20 rounded-lg p-5 bg-black/25">
        <h4 className="text-sm font-semibold text-brass-light mb-3 font-cinzel tracking-wider">
          基本信息
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-frost-dim">编号</span>
            <span className="text-parchment font-mono">
              {player.id.slice(-6).toUpperCase()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-frost-dim">状态</span>
            <span
              className={player.isAlive ? 'text-pyre-soft' : 'text-seal-light'}
            >
              {player.isAlive ? '存活' : '已死亡'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs: Personality, Relationships & Autobiographies */}
      <Tabs defaultValue="personality" className="w-full">
        <TabsList className="w-full grid grid-cols-3 bg-black/25 border border-brass/20">
          <TabsTrigger value="personality" className="data-[state=active]:bg-brass/15 data-[state=active]:text-parchment">
            旅者自述
          </TabsTrigger>
          <TabsTrigger value="relationships" className="data-[state=active]:bg-brass/15 data-[state=active]:text-parchment relative">
            关系图谱
            {relationships.length > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs bg-brass/25 text-parchment border-brass/50">
                {relationships.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="autobiographies" className="data-[state=active]:bg-brass/15 data-[state=active]:text-parchment relative">
            人物自传
            {autobiographies.length > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs bg-brass/25 text-parchment border-brass/50">
                {autobiographies.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Personality Tab */}
        <TabsContent value="personality" className="mt-4">
          <div className="border border-brass/20 rounded-lg p-5 bg-black/25">
            <div className="text-sm text-parchment/85 leading-relaxed font-serif space-y-3">
              {player.personality ? (
                <p className="whitespace-pre-line">{player.personality}</p>
              ) : (
                <p className="text-frost-dim italic">暂无人设描述</p>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Relationships Tab */}
        <TabsContent value="relationships" className="mt-4">
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {relationships.length === 0 ? (
              <div className="text-center py-12 text-frost-dim border border-brass/20 rounded-lg bg-black/25">
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
                          <span className="text-parchment">{rel.target}</span>
                        </div>
                        <Badge variant="outline" className="font-normal border-brass/50 text-brass-light">
                          {getRelationshipLabel(rel.type)}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Trigger Description */}
                      <div className="text-sm text-parchment/85 bg-black/20 rounded-lg p-3 border border-brass/15">
                        <p>
                          当 <span className="text-parchment font-medium">{rel.target}</span>{' '}
                          死亡时，{player.name} 的情感状态可能发生变化：
                        </p>
                      </div>

                      {/* Virtue Chance */}
                      {rel.virtueChance > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-pyre" />
                              <span className="text-pyre font-medium">美德觉醒</span>
                            </div>
                            <span className="text-pyre font-mono">
                              {(rel.virtueChance * 100).toFixed(0)}%
                            </span>
                          </div>
                          <Progress value={rel.virtueChance * 100} className="h-2 bg-ink-600">
                            <div className="h-full bg-gradient-to-r from-pyre-dim to-pyre-soft rounded-full" />
                          </Progress>
                          <div className="text-xs bg-pyre/5 border border-pyre/20 rounded-lg p-3">
                            <div className="font-medium text-pyre mb-1">
                              {virtueDesc.title}
                            </div>
                            <p className="text-parchment/85">{virtueDesc.description}</p>
                          </div>
                        </div>
                      )}

                      {/* Vice Chance */}
                      {rel.viceChance > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <TrendingDown className="w-4 h-4 text-seal-light" />
                              <span className="text-seal-light font-medium">罪恶堕落</span>
                            </div>
                            <span className="text-seal-light font-mono">
                              {(rel.viceChance * 100).toFixed(0)}%
                            </span>
                          </div>
                          <Progress value={rel.viceChance * 100} className="h-2 bg-ink-600">
                            <div className="h-full bg-gradient-to-r from-seal to-seal-light rounded-full" />
                          </Progress>
                          <div className="text-xs bg-seal/10 border border-seal/40 rounded-lg p-3">
                            <div className="font-medium text-seal-light mb-1">
                              {viceDesc.title}
                            </div>
                            <p className="text-parchment/85">{viceDesc.description}</p>
                          </div>
                        </div>
                      )}

                      {/* Normal Chance */}
                      {normalChance > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <Minus className="w-4 h-4 text-frost-dim" />
                              <span className="text-frost-dim font-medium">保持正常</span>
                            </div>
                            <span className="text-frost-dim font-mono">
                              {(normalChance * 100).toFixed(0)}%
                            </span>
                          </div>
                          <Progress value={normalChance * 100} className="h-2 bg-ink-600">
                            <div className="h-full bg-gradient-to-r from-slate-500 to-slate-400 rounded-full" />
                          </Progress>
                          <div className="text-xs text-frost-dim">
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
        </TabsContent>

        {/* Autobiographies Tab */}
        <TabsContent value="autobiographies" className="mt-4">
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {autobiographies.length === 0 ? (
              <div className="text-center py-12 text-frost-dim border border-brass/20 rounded-lg bg-black/25">
                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>此角色暂无自传记录</p>
              </div>
            ) : (
              autobiographies.map((autobiography, index) => (
                <Card
                  key={index}
                  className="border-2 border-brass/30 bg-brass/5"
                >
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-brass-light" />
                      <span className="text-parchment">{autobiography.title}</span>
                      <Badge variant="outline" className="ml-auto font-normal border-brass/50 text-brass-light">
                        第 {index + 1} 章
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-parchment/85 leading-relaxed font-serif whitespace-pre-line bg-black/25 rounded-lg p-4 border border-brass/15">
                      {autobiography.content}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
