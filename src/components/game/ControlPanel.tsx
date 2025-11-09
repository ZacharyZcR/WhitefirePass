/**
 * Game control panel component
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGameStore } from '@/stores/game-store';
import { testGeminiKey } from '@/lib/gemini';
import type { GameConfig, GameState } from '@/types/game';

const DEFAULT_CONFIG: GameConfig = {
  playerCount: 6,
  roles: ['werewolf', 'werewolf', 'villager', 'villager', 'villager', 'seer'],
  enableWitch: false,
  enableHunter: false,
};

function ApiKeyInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Gemini API 密钥</label>
      <Input
        type="password"
        placeholder="请输入你的 API 密钥"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <p className="text-xs text-muted-foreground">
        从{' '}
        <a
          href="https://aistudio.google.com/app/apikey"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          Google AI Studio
        </a>
        {' '}获取你的 API 密钥
      </p>
      <p className="text-xs text-amber-600">
        ⚠️ 确保 API 密钥有效且已启用 Gemini API
      </p>
      <p className="text-xs text-green-600">
        ✓ 已配置代理：127.0.0.1:7897
      </p>
    </div>
  );
}

const phaseNames: Record<string, string> = {
  setup: '准备中',
  night: '夜晚',
  day: '白天',
  voting: '投票',
  end: '结束',
};

function CurrentPlayerDisplay({ gameState }: { gameState: GameState }) {
  const alivePlayers = gameState.players
    .filter((p) => p.isAlive)
    .filter((p) => gameState.phase !== 'night' || p.role === 'werewolf');
  const currentPlayer = alivePlayers[gameState.currentPlayerIndex];

  return (
    <div className="rounded-lg bg-blue-50 p-3">
      <p className="text-sm font-medium text-blue-900">
        当前操作玩家：{currentPlayer ? currentPlayer.name : '阶段结束'}
      </p>
    </div>
  );
}

function ControlButtons({
  gameState,
  isValidating,
  isProcessing,
  canExecuteNext,
  onStart,
  onNextStep,
  onReset,
}: {
  gameState: GameState | null;
  isValidating: boolean;
  isProcessing: boolean;
  canExecuteNext: boolean;
  onStart: () => void;
  onNextStep: () => void;
  onReset: () => void;
}) {
  if (!gameState) {
    return (
      <Button
        onClick={onStart}
        className="w-full"
        disabled={isValidating}
      >
        {isValidating ? '⏳ 验证 API 密钥...' : '🎮 开始新游戏'}
      </Button>
    );
  }

  return (
    <>
      <Button
        onClick={onNextStep}
        className="w-full"
        disabled={!canExecuteNext}
      >
        {isProcessing ? '⏳ 处理中...' : '➡️ 下一步'}
      </Button>
      <Button
        onClick={onReset}
        className="w-full bg-red-600 hover:bg-red-700 text-white"
      >
        🔄 重置游戏
      </Button>
    </>
  );
}

function GameStatus({
  isRunning,
  phase,
  round,
  winner,
}: {
  isRunning: boolean;
  phase: string;
  round: number;
  winner?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">状态：</span>
        <Badge>{isRunning ? '🎮 运行中' : '⏸️ 已暂停'}</Badge>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">阶段：</span>
        <Badge>{phaseNames[phase] || phase}</Badge>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">回合：</span>
        <Badge>{round}</Badge>
      </div>
      {winner && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">胜利者：</span>
          <Badge className="bg-green-600">
            {winner === 'werewolf' ? '🐺 狼人阵营' : '👥 村民阵营'}
          </Badge>
        </div>
      )}
    </div>
  );
}

export function ControlPanel() {
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const { gameState, isProcessing, setApiKey: saveApiKey, startGame, resetGame, executeNextStep } = useGameStore();

  const handleStart = async () => {
    const trimmedKey = apiKey.trim();
    if (!trimmedKey) {
      alert('请输入你的 Gemini API 密钥');
      return;
    }

    setIsValidating(true);
    const isValid = await testGeminiKey(trimmedKey);
    setIsValidating(false);

    if (isValid) {
      saveApiKey(trimmedKey);
      startGame(DEFAULT_CONFIG);
    } else {
      alert(
        'API 密钥验证失败！\n\n请检查：\n1. API 密钥是否正确\n2. 是否已启用 Gemini API\n3. 网络连接是否正常\n\n获取 API 密钥：https://aistudio.google.com/app/apikey',
      );
    }
  };

  const canExecuteNext = Boolean(gameState && !isProcessing && gameState.phase !== 'end');

  return (
    <Card>
      <CardHeader>
        <CardTitle>游戏控制</CardTitle>
        <CardDescription>
          配置并控制 AI 狼人杀游戏
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!gameState && <ApiKeyInput value={apiKey} onChange={setApiKey} />}

        {gameState && (
          <>
            <GameStatus
              isRunning={isProcessing}
              phase={gameState.phase}
              round={gameState.round}
              winner={gameState.winner}
            />
            {gameState.phase !== 'end' && gameState.phase !== 'setup' && (
              <CurrentPlayerDisplay gameState={gameState} />
            )}
          </>
        )}

        <div className="space-y-2">
          <ControlButtons
            gameState={gameState}
            isValidating={isValidating}
            isProcessing={isProcessing}
            canExecuteNext={canExecuteNext}
            onStart={() => void handleStart()}
            onNextStep={() => void executeNextStep()}
            onReset={resetGame}
          />
        </div>

        {!gameState && (
          <div className="rounded-lg bg-muted p-3 space-y-2">
            <p className="text-sm font-medium">默认配置：</p>
            <ul className="text-xs space-y-1 text-muted-foreground">
              <li>• 6 名玩家（全部为 AI）</li>
              <li>• 2 名狼人 🐺</li>
              <li>• 3 名村民 👤</li>
              <li>• 1 名预言家 🔮</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
