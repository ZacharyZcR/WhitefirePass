/**
 * Save game manager component
 */

'use client';

import { useState } from 'react';
import { useGameStore } from '@/stores/game-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Save,
  FolderOpen,
  Trash2,
  Clock,
  Users,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function SaveGameManager() {
  const [saveName, setSaveName] = useState('');
  const [saveError, setSaveError] = useState('');
  const gameState = useGameStore((state) => state.gameState);
  const saveGame = useGameStore((state) => state.saveGame);
  const loadGame = useGameStore((state) => state.loadGame);
  const deleteGame = useGameStore((state) => state.deleteGame);
  const getSavedGames = useGameStore((state) => state.getSavedGames);

  const savedGames = getSavedGames();

  const handleSave = () => {
    if (!saveName.trim()) {
      setSaveError('请输入存档名称');
      return;
    }

    if (!gameState) {
      setSaveError('没有正在进行的游戏');
      return;
    }

    try {
      saveGame(saveName.trim());
      setSaveName('');
      setSaveError('');
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : '保存失败');
    }
  };

  const handleLoad = (id: string) => {
    const success = loadGame(id);
    if (!success) {
      setSaveError('读取存档失败');
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个存档吗？')) {
      deleteGame(id);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Save className="w-5 h-5" />
          存档管理
        </CardTitle>
        <CardDescription>
          保存和加载游戏进度
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Save current game */}
        <div className="space-y-2">
          <label className="text-sm font-medium">保存当前游戏</label>
          <div className="flex gap-2">
            <Input
              placeholder="输入存档名称..."
              value={saveName}
              onChange={(e) => {
                setSaveName(e.target.value);
                setSaveError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSave();
                }
              }}
              disabled={!gameState}
            />
            <Button
              onClick={handleSave}
              disabled={!gameState || !saveName.trim()}
              className="flex items-center gap-2 flex-shrink-0"
              variant="default"
            >
              <Save className="w-4 h-4" />
              保存
            </Button>
          </div>
          {saveError && (
            <div className="flex items-center gap-2 text-xs text-red-600">
              <AlertCircle className="w-3 h-3" />
              {saveError}
            </div>
          )}
          {!gameState && (
            <p className="text-xs text-muted-foreground">
              开始游戏后才能保存
            </p>
          )}
        </div>

        {/* Saved games list */}
        <div className="space-y-2">
          <label className="text-sm font-medium">已保存的游戏</label>
          {savedGames.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">暂无存档</p>
              <p className="text-xs mt-1">保存游戏后会显示在这里</p>
            </div>
          ) : (
            <ScrollArea className="h-[300px] rounded-md border">
              <div className="p-4 space-y-2">
                {savedGames
                  .sort((a, b) => b.savedAt - a.savedAt)
                  .map((save) => {
                    const alivePlayers = save.state.players.filter((p) => p.isAlive).length;
                    const totalPlayers = save.state.players.length;

                    return (
                      <div
                        key={save.id}
                        className={cn(
                          'rounded-lg border p-3 space-y-2 transition-colors',
                          'hover:bg-accent/50',
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm">{save.name}</h3>
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {formatDate(save.savedAt)}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleLoad(save.id)}
                              className="flex items-center gap-1"
                            >
                              <FolderOpen className="w-3 h-3" />
                              读取
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(save.id)}
                              className="text-red-600 hover:bg-red-50 hover:border-red-300"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            第 {save.state.round} 回合
                          </Badge>
                          <Badge variant="outline" className="text-xs flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {alivePlayers}/{totalPlayers}
                          </Badge>
                          {save.state.winner && (
                            <Badge className="text-xs">
                              {save.state.winner === 'marked' ? '收割胜利' : '羔羊胜利'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </ScrollArea>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
