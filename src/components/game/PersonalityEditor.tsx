/**
 * Personality editor dialog component
 */

'use client';

import { useState } from 'react';
import { useGameStore } from '@/stores/game-store';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  Sparkles,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PersonalityEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Default personality templates
 */
const DEFAULT_PERSONALITIES: Record<string, string> = {
  logical: '你是一个逻辑严谨的分析型玩家。你善于从细节中发现矛盾，通过理性推理来判断局势。你的发言总是有理有据，但有时过于冷静可能让人觉得不近人情。',
  emotional: '你是一个感性丰富的玩家。你擅长观察他人的情绪变化，通过直觉和感受来判断。你的发言充满热情，容易被情绪影响，但这也让你更容易获得他人的信任。',
  cautious: '你是一个谨慎保守的玩家。你不轻易表态，总是等待更多信息后再做判断。你的发言简洁克制，避免暴露过多信息，这让你不容易成为目标，但也可能被怀疑隐藏什么。',
  aggressive: '你是一个激进主动的玩家。你喜欢掌控局面，主动发起讨论和投票。你的发言直接果断，不怕得罪人，这让你容易成为焦点，但也容易被针对。',
  cooperative: '你是一个善于合作的玩家。你重视团队配合，愿意听取他人意见。你的发言温和友善，善于调解矛盾，这让你容易获得好感，但可能被认为缺乏主见。',
  mysterious: '你是一个神秘莫测的玩家。你说话总是留有余地，让人猜不透你的真实想法。你的发言暗示多于明示，这让你显得高深莫测，但也容易引起怀疑。',
};

const TEMPLATE_NAMES: Record<string, string> = {
  logical: '理性分析型',
  emotional: '感性直觉型',
  cautious: '谨慎保守型',
  aggressive: '激进主导型',
  cooperative: '合作友善型',
  mysterious: '神秘莫测型',
};

export function PersonalityEditor({ open, onOpenChange }: PersonalityEditorProps) {
  const gameState = useGameStore((state) => state.gameState);
  const updatePlayerPersonality = useGameStore((state) => state.updatePlayerPersonality);

  // Local state for editing
  const [editingPersonalities, setEditingPersonalities] = useState<Record<string, string>>({});
  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null);

  // Initialize editing state when dialog opens
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && gameState) {
      const initial: Record<string, string> = {};
      gameState.players.forEach((player) => {
        initial[player.id] = player.personality ?? '';
      });
      setEditingPersonalities(initial);
    }
    onOpenChange(newOpen);
  };

  const handleSave = (playerId: string) => {
    const personality = editingPersonalities[playerId] ?? '';
    updatePlayerPersonality(playerId, personality);
  };

  const handleSaveAll = () => {
    Object.entries(editingPersonalities).forEach(([playerId, personality]) => {
      updatePlayerPersonality(playerId, personality);
    });
    onOpenChange(false);
  };

  const handleApplyTemplate = (playerId: string, templateKey: string) => {
    setEditingPersonalities((prev) => ({
      ...prev,
      [playerId]: DEFAULT_PERSONALITIES[templateKey],
    }));
  };

  const handleClear = (playerId: string) => {
    setEditingPersonalities((prev) => ({
      ...prev,
      [playerId]: '',
    }));
  };

  const toggleExpand = (playerId: string) => {
    setExpandedPlayer(expandedPlayer === playerId ? null : playerId);
  };

  if (!gameState) return null;

  const roleNames: Record<string, string> = {
    werewolf: '狼人',
    villager: '村民',
    seer: '预言家',
    witch: '女巫',
    hunter: '猎人',
  };

  const roleColors: Record<string, string> = {
    werewolf: 'bg-red-600',
    villager: 'bg-blue-600',
    seer: 'bg-purple-600',
    witch: 'bg-green-600',
    hunter: 'bg-orange-600',
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            AI 人设编辑器
          </DialogTitle>
          <DialogDescription>
            为每个 AI 玩家设置独特的性格特征和行为风格
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {gameState.players.map((player) => {
              const isExpanded = expandedPlayer === player.id;
              const currentPersonality = editingPersonalities[player.id] ?? '';
              const hasChanges = currentPersonality !== (player.personality ?? '');

              return (
                <Card key={player.id} className={cn(
                  'transition-all',
                  isExpanded && 'ring-2 ring-primary'
                )}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{player.name}</CardTitle>
                        <Badge className={cn('text-xs', roleColors[player.role])}>
                          {roleNames[player.role]}
                        </Badge>
                        {!player.isAlive && (
                          <Badge variant="outline" className="text-xs">已淘汰</Badge>
                        )}
                        {hasChanges && (
                          <Badge variant="outline" className="text-xs text-amber-600">
                            未保存
                          </Badge>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleExpand(player.id)}
                      >
                        {isExpanded ? '收起' : '展开编辑'}
                      </Button>
                    </div>
                  </CardHeader>

                  {isExpanded && (
                    <CardContent className="space-y-4">
                      {/* Template buttons */}
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">
                          快速模板
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {Object.entries(TEMPLATE_NAMES).map(([key, name]) => (
                            <Button
                              key={key}
                              size="sm"
                              variant="outline"
                              onClick={() => handleApplyTemplate(player.id, key)}
                              className="text-xs"
                            >
                              {name}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Personality textarea */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">
                            性格设定
                          </label>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleClear(player.id)}
                              className="text-xs flex items-center gap-1"
                            >
                              <RotateCcw className="w-3 h-3" />
                              清空
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleSave(player.id)}
                              disabled={!hasChanges}
                              className="text-xs flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              保存
                            </Button>
                          </div>
                        </div>
                        <Textarea
                          value={currentPersonality}
                          onChange={(e) => {
                            setEditingPersonalities((prev) => ({
                              ...prev,
                              [player.id]: e.target.value,
                            }));
                          }}
                          placeholder="描述该玩家的性格特征、行为风格、说话方式等... 例如：你是一个谨慎保守的玩家，总是等待更多信息后再做判断..."
                          className="min-h-[120px] resize-none"
                        />
                        <p className="text-xs text-muted-foreground">
                          字符数：{currentPersonality.length}
                          {currentPersonality.length > 300 && (
                            <span className="text-amber-600 ml-2">
                              建议不超过 300 字
                            </span>
                          )}
                        </p>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </ScrollArea>

        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Users className="w-3 h-3" />
            共 {gameState.players.length} 名玩家
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
            <Button
              onClick={handleSaveAll}
              className="flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              保存全部
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
