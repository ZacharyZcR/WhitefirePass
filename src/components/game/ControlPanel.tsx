/**
 * Game control panel component
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGameStore } from '@/stores/game-store';
import { testGeminiKey } from '@/lib/gemini';
import { SaveGameManager } from '@/components/game/SaveGameManager';
import { PersonalityEditor } from '@/components/game/PersonalityEditor';
import type { GameConfig, GameState } from '@/types/game';
import {
  Gamepad2,
  Loader2,
  Pause,
  Dog,
  Users,
  Eye,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  RotateCw,
  Save,
  Sparkles,
} from 'lucide-react';

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
      <p className="text-xs text-amber-600 flex items-center gap-1">
        <AlertTriangle className="w-3 h-3" />
        确保 API 密钥有效且已启用 Gemini API
      </p>
      <p className="text-xs text-green-600 flex items-center gap-1">
        <CheckCircle2 className="w-3 h-3" />
        已配置代理：127.0.0.1:7897
      </p>
    </div>
  );
}

function ErrorDisplay({
  error,
  onClear,
}: {
  error: string;
  onClear: () => void;
}) {
  return (
    <div className="rounded-lg bg-red-50 border border-red-200 p-3">
      <div className="flex items-start gap-2">
        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-red-900">请求失败</p>
          <p className="text-xs text-red-700 mt-1">{error}</p>
        </div>
        <button
          onClick={onClear}
          className="text-red-400 hover:text-red-600"
          aria-label="关闭错误提示"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

function DefaultConfigInfo() {
  return (
    <div className="rounded-lg bg-muted p-3 space-y-2">
      <p className="text-sm font-medium">默认配置：</p>
      <ul className="text-xs space-y-1 text-muted-foreground">
        <li>• 6 名玩家（全部为 AI）</li>
        <li className="flex items-center gap-1">
          • 2 名狼人 <Dog className="w-3 h-3" />
        </li>
        <li className="flex items-center gap-1">
          • 3 名村民 <Users className="w-3 h-3" />
        </li>
        <li className="flex items-center gap-1">
          • 1 名预言家 <Eye className="w-3 h-3" />
        </li>
      </ul>
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

function ControlTabContent({
  hasActiveGame,
  gameState,
  isGameEnded,
  apiKey,
  isValidating,
  isProcessing,
  canExecuteNext,
  lastError,
  onApiKeyChange,
  onStart,
  onNextStep,
  onRetry,
  onReset,
  onClearError,
  onOpenPersonalityEditor,
}: {
  hasActiveGame: boolean;
  gameState: GameState | null;
  isGameEnded: boolean;
  apiKey: string;
  isValidating: boolean;
  isProcessing: boolean;
  canExecuteNext: boolean;
  lastError: string | null;
  onApiKeyChange: (value: string) => void;
  onStart: () => void;
  onNextStep: () => void;
  onRetry: () => void;
  onReset: () => void;
  onClearError: () => void;
  onOpenPersonalityEditor: () => void;
}) {
  return (
    <>
      {!hasActiveGame && <ApiKeyInput value={apiKey} onChange={onApiKeyChange} />}

      {hasActiveGame && gameState && (
        <>
          <GameStatus
            isRunning={isProcessing}
            phase={gameState.phase}
            round={gameState.round}
            winner={gameState.winner}
          />
          {!isGameEnded && <CurrentPlayerDisplay gameState={gameState} />}
          {lastError && <ErrorDisplay error={lastError} onClear={onClearError} />}
        </>
      )}

      <div className="space-y-2">
        <ControlButtons
          gameState={gameState}
          isValidating={isValidating}
          isProcessing={isProcessing}
          canExecuteNext={canExecuteNext}
          hasError={Boolean(lastError)}
          onStart={onStart}
          onNextStep={onNextStep}
          onRetry={onRetry}
          onReset={onReset}
        />
      </div>

      {hasActiveGame && (
        <Button
          onClick={onOpenPersonalityEditor}
          variant="outline"
          className="w-full flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          编辑 AI 人设
        </Button>
      )}

      {!hasActiveGame && <DefaultConfigInfo />}
    </>
  );
}

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
  hasError,
  onStart,
  onNextStep,
  onRetry,
  onReset,
}: {
  gameState: GameState | null;
  isValidating: boolean;
  isProcessing: boolean;
  canExecuteNext: boolean;
  hasError: boolean;
  onStart: () => void;
  onNextStep: () => void;
  onRetry: () => void;
  onReset: () => void;
}) {
  if (!gameState) {
    return (
      <Button
        onClick={onStart}
        className="w-full"
        disabled={isValidating}
      >
        {isValidating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            验证 API 密钥...
          </>
        ) : (
          <>
            <Gamepad2 className="w-4 h-4 mr-2" />
            开始新游戏
          </>
        )}
      </Button>
    );
  }

  return (
    <>
      {hasError ? (
        <Button
          onClick={onRetry}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white"
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              重试中...
            </>
          ) : (
            <>
              <RotateCw className="w-4 h-4 mr-2" />
              重试当前步骤
            </>
          )}
        </Button>
      ) : (
        <Button
          onClick={onNextStep}
          className="w-full"
          disabled={!canExecuteNext}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              处理中...
            </>
          ) : (
            <>
              <ArrowRight className="w-4 h-4 mr-2" />
              下一步
            </>
          )}
        </Button>
      )}
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
        <Badge className="flex items-center gap-1">
          {isRunning ? (
            <>
              <Gamepad2 className="w-3 h-3" />
              运行中
            </>
          ) : (
            <>
              <Pause className="w-3 h-3" />
              已暂停
            </>
          )}
        </Badge>
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
          <Badge className="bg-green-600 flex items-center gap-1">
            {winner === 'werewolf' ? (
              <>
                <Dog className="w-3 h-3" />
                狼人阵营
              </>
            ) : (
              <>
                <Users className="w-3 h-3" />
                村民阵营
              </>
            )}
          </Badge>
        </div>
      )}
    </div>
  );
}

export function ControlPanel() {
  const {
    gameState,
    isProcessing,
    lastError,
    apiKey: storedApiKey,
    setApiKey: saveApiKey,
    startGame,
    resetGame,
    executeNextStep,
    retryCurrentStep,
    clearError,
  } = useGameStore();
  const [apiKey, setApiKey] = useState(storedApiKey);
  const [isValidating, setIsValidating] = useState(false);
  const [personalityEditorOpen, setPersonalityEditorOpen] = useState(false);

  // Sync local state with persisted apiKey from store
  useEffect(() => {
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, [storedApiKey]);

  const handleStart = async () => {
    const trimmedKey = apiKey.trim();
    if (!trimmedKey) {
      alert('请输入你的 Gemini API 密钥');
      return;
    }

    setIsValidating(true);
    const isValid = await testGeminiKey(trimmedKey);
    setIsValidating(false);

    if (!isValid) {
      alert(
        'API 密钥验证失败！\n\n请检查：\n1. API 密钥是否正确\n2. 是否已启用 Gemini API\n3. 网络连接是否正常\n\n获取 API 密钥：https://aistudio.google.com/app/apikey',
      );
      return;
    }

    saveApiKey(trimmedKey);
    startGame(DEFAULT_CONFIG);
  };

  const canExecuteNext = Boolean(gameState && !isProcessing && gameState.phase !== 'end' && !lastError);
  const hasActiveGame = Boolean(gameState);
  const isGameEnded = gameState?.phase === 'end' || gameState?.phase === 'setup';

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>游戏控制</CardTitle>
        <CardDescription>
          配置并控制 AI 狼人杀游戏
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="control" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="control" className="flex items-center gap-2">
              <Gamepad2 className="w-4 h-4" />
              游戏控制
            </TabsTrigger>
            <TabsTrigger value="saves" className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              存档管理
            </TabsTrigger>
          </TabsList>

          <TabsContent value="control" className="space-y-4 mt-4">
            <ControlTabContent
              hasActiveGame={hasActiveGame}
              gameState={gameState}
              isGameEnded={isGameEnded}
              apiKey={apiKey}
              isValidating={isValidating}
              isProcessing={isProcessing}
              canExecuteNext={canExecuteNext}
              lastError={lastError}
              onApiKeyChange={setApiKey}
              onStart={() => void handleStart()}
              onNextStep={() => void executeNextStep()}
              onRetry={() => void retryCurrentStep()}
              onReset={resetGame}
              onClearError={clearError}
              onOpenPersonalityEditor={() => setPersonalityEditorOpen(true)}
            />
          </TabsContent>

          <TabsContent value="saves" className="mt-4">
            <SaveGameManager />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>

    {/* Personality Editor Dialog */}
    <PersonalityEditor
      open={personalityEditorOpen}
      onOpenChange={setPersonalityEditorOpen}
    />
  </>
  );
}
