/**
 * Traveler Gallery - Tarot Card Style
 * Display all travelers as tarot cards
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';
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
import { TarotCard } from './TarotCard';
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
}

export function PersonalityEditor({ open, onOpenChange }: PersonalityEditorProps) {
  const { gameState } = useGameStore();
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [flippingCardId, setFlippingCardId] = useState<string | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  if (!gameState) {
    return null;
  }

  const handleCardClick = (playerId: string) => {
    // Start flip animation
    setFlippingCardId(playerId);
    setSelectedPlayerId(playerId);

    // After flip animation completes, show detail panel
    setTimeout(() => {
      setShowDetail(true);
    }, 600); // Flip animation duration
  };

  const handleClose = () => {
    setShowDetail(false);
    setFlippingCardId(null);
    // Delay clearing selection to allow animation
    setTimeout(() => {
      setSelectedPlayerId(null);
    }, 300);
  };

  const selectedPlayer = selectedPlayerId
    ? gameState.players.find((p) => p.id === selectedPlayerId)
    : null;

  const handleDialogChange = (newOpen: boolean) => {
    if (!newOpen) {
      // If closing dialog, reset all states
      setShowDetail(false);
      setFlippingCardId(null);
      setSelectedPlayerId(null);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent
        className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
        onInteractOutside={(e) => {
          // If detail panel is open, close it instead of the dialog
          if (showDetail) {
            e.preventDefault();
            handleClose();
          }
        }}
      >
        <DialogHeader className="flex-shrink-0 border-b border-amber-900/30 pb-4">
          <DialogTitle className="flex items-center gap-2 text-amber-100">
            <Sparkles className="w-5 h-5 text-amber-500" />
            {selectedPlayer ? '旅者档案' : '旅者画廊'}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {selectedPlayer ? (
              <button
                onClick={handleClose}
                className="text-amber-500 hover:text-amber-400 transition-colors"
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
            <div
              className={`py-6 px-4 ${
                flippingCardId ? 'pointer-events-none' : ''
              }`}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-w-2xl mx-auto">
                {gameState.players.map((player) => (
                  <div
                    key={player.id}
                    className="perspective-1000 flex justify-center cursor-pointer"
                    onClick={() => handleCardClick(player.id)}
                  >
                    <TarotCard
                      player={player}
                      isFlipped={flippingCardId === player.id}
                      size="small"
                      className="hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Detail View - full container */
            selectedPlayer && (
              <div className="min-h-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 animate-in fade-in duration-500">
                <div className="max-w-6xl mx-auto p-6 sm:p-8">
                  <div className="flex flex-col lg:flex-row gap-8 items-start">
                    {/* Left: Full Portrait */}
                    <div className="flex-shrink-0 w-full lg:w-auto">
                      <div className="relative w-full lg:w-[400px] h-[500px] rounded-lg overflow-hidden border-4 border-amber-600/40 shadow-2xl">
                        <Image
                          src={`/portraits/${selectedPlayer.name}.png`}
                          alt={selectedPlayer.name}
                          fill
                          className="object-cover"
                          sizes="400px"
                          priority
                        />
                        {/* Gradient overlay at bottom */}
                        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
                        {/* Character name overlay */}
                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="text-2xl font-bold text-white drop-shadow-lg font-cinzel">
                            {selectedPlayer.name}
                          </h3>
                        </div>
                      </div>
                    </div>

                    {/* Right: Basic Info and Detail panel */}
                    <div className="flex-1 min-w-0 space-y-6">
                      {/* Basic Profile */}
                      <CharacterBasicInfo player={selectedPlayer} />

                      {/* Detail Content */}
                      <TravelerDetail player={selectedPlayer} />
                    </div>
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
    <div className="border border-amber-900/40 rounded-lg p-5 bg-slate-950/70 backdrop-blur-sm">
      <h4 className="text-sm font-semibold text-amber-400 mb-4 font-cinzel tracking-wider text-center border-b border-amber-900/30 pb-3">
        BASIC PROFILE
      </h4>
      <div className="space-y-3">
        {infoItems.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between text-sm group py-0.5"
          >
            <span className="flex items-center gap-2 text-slate-400">
              <item.Icon className="w-3.5 h-3.5 text-amber-600/60" />
              {item.label}
            </span>
            <span className="text-slate-200 font-medium">{item.value}</span>
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
      <div className="border-b border-amber-900/30 pb-5">
        {/* Name - Chinese */}
        <h3 className="text-4xl font-bold text-amber-100 mb-2 tracking-wide">
          {player.name}
        </h3>
        {/* Name - English Gothic */}
        {player.englishName && (
          <div className="mb-4">
            <p className="text-2xl font-cinzel text-amber-500/90 tracking-widest uppercase" style={{ letterSpacing: '0.15em' }}>
              {player.englishName}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-900/40 to-transparent"></div>
              <span className="text-amber-800/60 text-xs">✦</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-900/40 to-transparent"></div>
            </div>
          </div>
        )}
        {/* Role */}
        <div className="flex items-center gap-3">
          <span className="text-lg text-amber-500 font-cinzel tracking-wider">
            {roleNames[player.role]?.name}
          </span>
          <span className="text-amber-800/60">•</span>
          <span className="text-sm text-slate-500 font-cinzel tracking-wide">
            {roleNames[player.role]?.subtitle}
          </span>
        </div>
      </div>

      {/* Basic info */}
      <div className="border border-amber-900/30 rounded-lg p-5 bg-slate-950/50">
        <h4 className="text-sm font-semibold text-amber-400 mb-3 font-cinzel tracking-wider">
          基本信息
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">编号</span>
            <span className="text-slate-200 font-mono">
              {player.id.slice(-6).toUpperCase()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">状态</span>
            <span
              className={player.isAlive ? 'text-green-400' : 'text-red-400'}
            >
              {player.isAlive ? '存活' : '已死亡'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs: Personality, Relationships & Autobiographies */}
      <Tabs defaultValue="personality" className="w-full">
        <TabsList className="w-full grid grid-cols-3 bg-slate-950/50 border border-amber-900/30">
          <TabsTrigger value="personality" className="data-[state=active]:bg-amber-900/30 data-[state=active]:text-amber-100">
            旅者自述
          </TabsTrigger>
          <TabsTrigger value="relationships" className="data-[state=active]:bg-amber-900/30 data-[state=active]:text-amber-100 relative">
            关系图谱
            {relationships.length > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs bg-amber-500/30 text-amber-100 border-amber-500/50">
                {relationships.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="autobiographies" className="data-[state=active]:bg-amber-900/30 data-[state=active]:text-amber-100 relative">
            人物自传
            {autobiographies.length > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs bg-amber-500/30 text-amber-100 border-amber-500/50">
                {autobiographies.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Personality Tab */}
        <TabsContent value="personality" className="mt-4">
          <div className="border border-amber-900/30 rounded-lg p-5 bg-slate-950/50">
            <div className="text-sm text-slate-300 leading-relaxed font-serif space-y-3">
              {player.personality ? (
                <p className="whitespace-pre-line">{player.personality}</p>
              ) : (
                <p className="text-slate-400 italic">暂无人设描述</p>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Relationships Tab */}
        <TabsContent value="relationships" className="mt-4">
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {relationships.length === 0 ? (
              <div className="text-center py-12 text-slate-400 border border-amber-900/30 rounded-lg bg-slate-950/50">
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
                          <span className="text-amber-100">{rel.target}</span>
                        </div>
                        <Badge variant="outline" className="font-normal border-amber-500/50 text-amber-300">
                          {getRelationshipLabel(rel.type)}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Trigger Description */}
                      <div className="text-sm text-slate-300 bg-slate-800/50 rounded-lg p-3 border border-amber-900/20">
                        <p>
                          当 <span className="text-amber-100 font-medium">{rel.target}</span>{' '}
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
                            <p className="text-slate-300">{virtueDesc.description}</p>
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
                            <p className="text-slate-300">{viceDesc.description}</p>
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
                          <div className="text-xs text-slate-400">
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
              <div className="text-center py-12 text-slate-400 border border-amber-900/30 rounded-lg bg-slate-950/50">
                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>此角色暂无自传记录</p>
              </div>
            ) : (
              autobiographies.map((autobiography, index) => (
                <Card
                  key={index}
                  className="border-2 border-amber-500/30 bg-amber-500/5"
                >
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-amber-400" />
                      <span className="text-amber-100">{autobiography.title}</span>
                      <Badge variant="outline" className="ml-auto font-normal border-amber-500/50 text-amber-300">
                        第 {index + 1} 章
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-slate-300 leading-relaxed font-serif whitespace-pre-line bg-slate-900/50 rounded-lg p-4 border border-amber-900/20">
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
