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
import { Kbd } from '@/components/ui/kbd';
import { useGameStore } from '@/stores/game-store';
import { testGeminiKey } from '@/lib/gemini';
import { SaveGameManager } from '@/components/game/SaveGameManager';
import { PersonalityEditor } from '@/components/game/PersonalityEditor';
import { GameGuide } from '@/components/game/GameGuide';
import { PromptViewer } from '@/components/game/PromptViewer';
import type { GameConfig, GameState } from '@/types/game';
import {
  Gamepad2,
  Loader2,
  Pause,
  Mountain,
  Users,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  RotateCw,
  Save,
  Sparkles,
  HelpCircle,
  Settings,
  PlayCircle,
  XCircle,
  Brain,
} from 'lucide-react';

const DEFAULT_CONFIG: GameConfig = {
  playerCount: 15,
  roles: [
    // 收割阵营 (4人)
    'marked', 'marked', 'marked',  // 烙印者 x3
    'heretic',  // 背誓者 x1
    // 羔羊阵营 (11人)
    'listener',  // 聆心者 x1
    'coroner',   // 食灰者 x1
    'twin', 'twin',  // 共誓者 x2
    'guard',  // 设闩者 x1
    'innocent', 'innocent', 'innocent', 'innocent', 'innocent', 'innocent',  // 无知者 x6
  ],
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

function ApiUrlInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">API 基础 URL</label>
      <Input
        type="text"
        placeholder="https://generativelanguage.googleapis.com"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <p className="text-xs text-muted-foreground">
        默认使用 Google 官方 API，也可以填写自定义代理地址
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
  // Check if this is a retry message
  const isRetrying = error.includes('正在重试');

  // Parse retry information if available
  const retryMatch = error.match(/\((\d+)\/(\d+)\)/);
  const attempt = retryMatch ? parseInt(retryMatch[1]) : null;
  const maxRetries = retryMatch ? parseInt(retryMatch[2]) : null;

  // Extract reason and delay
  const lines = error.split('\n');
  const mainMessage = lines[0];
  const reason = lines.find(line => line.startsWith('原因:'))?.replace('原因:', '').trim();
  const delay = lines.find(line => line.includes('等待'))?.match(/(\d+\.?\d*)秒/)?.[1];

  if (isRetrying && attempt && maxRetries) {
    // Retry progress UI
    const progress = (attempt / maxRetries) * 100;

    return (
      <div className="rounded-lg bg-amber-50 border border-amber-300 p-3">
        <div className="flex items-start gap-2">
          <Loader2 className="w-5 h-5 text-amber-600 flex-shrink-0 animate-spin" />
          <div className="flex-1 space-y-2">
            <div>
              <p className="text-sm font-medium text-amber-900">指数退避重试中</p>
              <p className="text-xs text-amber-700 mt-1">{mainMessage}</p>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-amber-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-amber-600 h-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Details */}
            <div className="text-xs text-amber-700 space-y-0.5">
              <div className="flex items-center gap-1">
                <span className="font-medium">尝试:</span>
                <span>{attempt} / {maxRetries}</span>
              </div>
              {reason && (
                <div className="flex items-center gap-1">
                  <span className="font-medium">原因:</span>
                  <span className="truncate">{reason}</span>
                </div>
              )}
              {delay && (
                <div className="flex items-center gap-1">
                  <span className="font-medium">等待:</span>
                  <span>{delay}秒</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Regular error UI
  return (
    <div className="rounded-lg bg-red-50 border border-red-200 p-3">
      <div className="flex items-start gap-2">
        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-red-900">请求失败</p>
          <p className="text-xs text-red-700 mt-1 whitespace-pre-line">{error}</p>
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
      <p className="text-sm font-medium">白烬山口 - 寂静山庄</p>
      <p className="text-xs text-muted-foreground">15 名旅人被暴风雪困于山庄，山灵的契约已成...</p>
      <ul className="text-xs space-y-1 text-muted-foreground mt-2">
        <li className="font-semibold">收割阵营 (4人):</li>
        <li className="pl-2">• 3 名烙印者 (The Marked)</li>
        <li className="pl-2">• 1 名背誓者 (The Heretic)</li>
        <li className="font-semibold mt-2">羔羊阵营 (11人):</li>
        <li className="pl-2">• 1 名聆心者 (The Heart-Listener)</li>
        <li className="pl-2">• 1 名食灰者 (The Ash-Walker)</li>
        <li className="pl-2">• 2 名共誓者 (The Co-Sworn)</li>
        <li className="pl-2">• 1 名设闩者 (The Bar-Setter)</li>
        <li className="pl-2">• 6 名无知者 (The Unknowing)</li>
      </ul>
    </div>
  );
}

const phaseNames: Record<string, string> = {
  prologue: '序章',
  setup: '序章',
  night: '夜晚',
  day: '白天',
  voting: '投票',
  secret_meeting: '密会',
  event: '事件',
  end: '结束',
};

function SettingsTabContent({
  apiKey,
  apiUrl,
  isValidating,
  onApiKeyChange,
  onApiUrlChange,
  onSave,
}: {
  apiKey: string;
  apiUrl: string;
  isValidating: boolean;
  onApiKeyChange: (value: string) => void;
  onApiUrlChange: (value: string) => void;
  onSave: () => void;
}) {
  return (
    <div className="space-y-4">
      <ApiKeyInput value={apiKey} onChange={onApiKeyChange} />
      <ApiUrlInput value={apiUrl} onChange={onApiUrlChange} />

      <Button
        onClick={onSave}
        className="w-full"
        disabled={isValidating || !apiKey.trim()}
      >
        {isValidating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            验证中...
          </>
        ) : (
          <>
            <CheckCircle2 className="w-4 h-4 mr-2" />
            验证并保存设置
          </>
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        保存前会先验证 API 密钥是否有效
      </p>
    </div>
  );
}

function ControlTabContent({
  hasActiveGame,
  gameState,
  isGameEnded,
  isValidating,
  isProcessing,
  isAutoExecuting,
  canExecuteNext,
  lastError,
  onStart,
  onNextStep,
  onAutoExecute,
  onStopAuto,
  onRetry,
  onReset,
  onClearError,
  onOpenPersonalityEditor,
  onOpenGameGuide,
  onOpenPromptViewer,
  onOpenSecretMeeting,
}: {
  hasActiveGame: boolean;
  gameState: GameState | null;
  isGameEnded: boolean;
  isValidating: boolean;
  isProcessing: boolean;
  isAutoExecuting: boolean;
  canExecuteNext: boolean;
  lastError: string | null;
  onStart: () => void;
  onNextStep: () => void;
  onAutoExecute: () => void;
  onStopAuto: () => void;
  onRetry: () => void;
  onReset: () => void;
  onClearError: () => void;
  onOpenPersonalityEditor: () => void;
  onOpenGameGuide: () => void;
  onOpenPromptViewer: () => void;
  onOpenSecretMeeting: () => void;
}) {
  return (
    <>

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
          isAutoExecuting={isAutoExecuting}
          onStart={onStart}
          onNextStep={onNextStep}
          onAutoExecute={onAutoExecute}
          onStopAuto={onStopAuto}
          onRetry={onRetry}
          onReset={onReset}
          onOpenSecretMeeting={onOpenSecretMeeting}
        />
      </div>

      {hasActiveGame && (
        <Button
          onClick={onOpenPersonalityEditor}
          variant="outline"
          className="w-full flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          旅者详情
        </Button>
      )}

      {hasActiveGame && (
        <Button
          onClick={onOpenPromptViewer}
          variant="outline"
          className="w-full flex items-center gap-2"
        >
          <Brain className="w-4 h-4" />
          神谕指引
        </Button>
      )}

      <Button
        onClick={onOpenGameGuide}
        variant="outline"
        className="w-full flex items-center gap-2"
      >
        <HelpCircle className="w-4 h-4" />
        游戏说明
      </Button>

      {!hasActiveGame && <DefaultConfigInfo />}
    </>
  );
}

// Phase display name mapping
const PHASE_DISPLAY_MAP: Record<string, string> = {
  'prologue': '序章',
  'setup': '序章',
  'day': '白天讨论',
  'voting': '献祭投票',
  'secret_meeting': '密会阶段',
  'event': '事件阶段',
  'end': '游戏结束',
  'night-listener': '夜晚 - 聆心者查验',
  'night-marked-discuss': '夜晚 - 烙印者讨论',
  'night-marked-vote': '夜晚 - 烙印者投票',
  'night-guard': '夜晚 - 设闩者守护',
  'night-coroner': '夜晚 - 食灰者验尸',
  'night': '夜晚',
};

function CurrentPlayerDisplay({ gameState }: { gameState: GameState }) {
  // Get phase display name
  const getPhaseDisplay = () => {
    const { phase, nightPhase } = gameState;
    if (phase === 'night' && nightPhase) {
      return PHASE_DISPLAY_MAP[`night-${nightPhase}`] || PHASE_DISPLAY_MAP['night'];
    }
    return PHASE_DISPLAY_MAP[phase] || '未知阶段';
  };

  // Get role display name
  const getRoleDisplay = (role: string) => {
    const roleNames: Record<string, string> = {
      marked: '烙印者',
      heretic: '背誓者',
      listener: '聆心者',
      coroner: '食灰者',
      twin: '共誓者',
      guard: '设闩者',
      innocent: '无知者',
    };
    return roleNames[role] || role;
  };

  const phaseDisplay = getPhaseDisplay();

  // Don't show current player during prologue/setup
  if (gameState.phase === 'prologue' || gameState.phase === 'setup') {
    return (
      <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" />
          <p className="text-sm font-medium text-slate-900">{phaseDisplay}</p>
        </div>
      </div>
    );
  }

  // Special handling for secret meeting
  if (gameState.phase === 'secret_meeting') {
    if (gameState.pendingSecretMeeting?.selectedParticipants) {
      const [p1, p2] = gameState.pendingSecretMeeting.selectedParticipants;
      return (
        <div className="rounded-lg bg-purple-50 border border-purple-200 p-3 space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            <p className="text-sm font-medium text-purple-900">{phaseDisplay}</p>
          </div>
          <p className="text-xs text-purple-700 pl-4">
            参与者: {p1} 和 {p2}
          </p>
        </div>
      );
    }
    return (
      <div className="rounded-lg bg-purple-50 border border-purple-200 p-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-purple-500" />
          <p className="text-sm font-medium text-purple-900">{phaseDisplay}</p>
        </div>
        <p className="text-xs text-purple-700 pl-4 mt-1">等待选择密会参与者...</p>
      </div>
    );
  }

  // Special handling for event phase
  if (gameState.phase === 'event') {
    return (
      <div className="rounded-lg bg-teal-50 border border-teal-200 p-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
          <p className="text-sm font-medium text-teal-900">{phaseDisplay}</p>
        </div>
      </div>
    );
  }

  const alivePlayers = gameState.players
    .filter((p) => p.isAlive)
    .filter((p) => gameState.phase !== 'night' || p.role === 'marked');
  const currentPlayer = alivePlayers[gameState.currentPlayerIndex];

  if (!currentPlayer) {
    return (
      <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          <p className="text-sm font-medium text-amber-900">{phaseDisplay}</p>
        </div>
        <p className="text-xs text-amber-700 pl-4 mt-1">等待进入下一阶段...</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 space-y-1">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
        <p className="text-sm font-medium text-blue-900">{phaseDisplay}</p>
      </div>
      <div className="text-xs text-blue-700 pl-4 space-y-0.5">
        <div className="flex items-center gap-1">
          <span className="font-medium">当前角色:</span>
          <span>{currentPlayer.name}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-medium">身份:</span>
          <span>{getRoleDisplay(currentPlayer.role)}</span>
          {currentPlayer.occupation && (
            <>
              <span className="text-blue-400">·</span>
              <span className="text-blue-600">{currentPlayer.occupation}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1">
          <span className="font-medium">进度:</span>
          <span>{gameState.currentPlayerIndex + 1} / {alivePlayers.length}</span>
        </div>
      </div>
    </div>
  );
}

function RetryButton({ isProcessing, onRetry }: { isProcessing: boolean; onRetry: () => void }) {
  return (
    <Button onClick={onRetry} className="w-full bg-orange-600 hover:bg-orange-700 text-white" disabled={isProcessing}>
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
  );
}

function SecretMeetingButton({ canStart, inProgress, onClick }: { canStart: boolean; inProgress: boolean; onClick: () => void }) {
  return (
    <Button onClick={onClick} className="w-full bg-purple-600 hover:bg-purple-700 text-white" disabled={!canStart || inProgress}>
      {inProgress ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          密会进行中...
        </>
      ) : (
        <>
          <Users className="w-4 h-4 mr-2" />
          发起密会
        </>
      )}
    </Button>
  );
}

function NormalPhaseButtons({
  canExecuteNext,
  isAutoExecuting,
  isProcessing,
  onAutoExecute,
  onStopAuto,
  onNextStep
}: {
  canExecuteNext: boolean;
  isAutoExecuting: boolean;
  isProcessing: boolean;
  onAutoExecute: () => void;
  onStopAuto: () => void;
  onNextStep: () => void;
}) {
  return (
    <>
      {isAutoExecuting ? (
        <Button onClick={onStopAuto} className="w-full bg-red-600 hover:bg-red-700 text-white">
          <XCircle className="w-4 h-4 mr-2" />
          停止自动执行
        </Button>
      ) : (
        <Button onClick={onAutoExecute} className="w-full bg-green-600 hover:bg-green-700 text-white" disabled={!canExecuteNext}>
          <PlayCircle className="w-4 h-4 mr-2" />
          自动执行阶段
        </Button>
      )}
      <Button onClick={onNextStep} className="w-full" disabled={!canExecuteNext || isAutoExecuting}>
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
    </>
  );
}

function ControlButtons({
  gameState,
  isValidating,
  isProcessing,
  canExecuteNext,
  hasError,
  isAutoExecuting,
  onStart,
  onNextStep,
  onAutoExecute,
  onStopAuto,
  onRetry,
  onReset,
  onOpenSecretMeeting,
}: {
  gameState: GameState | null;
  isValidating: boolean;
  isProcessing: boolean;
  canExecuteNext: boolean;
  hasError: boolean;
  isAutoExecuting: boolean;
  onStart: () => void;
  onNextStep: () => void;
  onAutoExecute: () => void;
  onStopAuto: () => void;
  onRetry: () => void;
  onReset: () => void;
  onOpenSecretMeeting: () => void;
}) {
  if (!gameState) {
    return (
      <Button onClick={onStart} className="w-full" disabled={isValidating}>
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

  const isSecretMeetingPhase = gameState.phase === 'secret_meeting';

  // Extract complex conditions
  const getSecretMeetingState = (): { canStart: boolean; inProgress: boolean } => {
    const hasPending = Boolean(gameState.pendingSecretMeeting && !gameState.pendingSecretMeeting.selectedParticipants);
    const hasSelected = Boolean(gameState.pendingSecretMeeting?.selectedParticipants);
    return {
      canStart: Boolean(hasPending && !isProcessing && !hasError),
      inProgress: Boolean(hasSelected && isProcessing && !hasError)
    };
  };

  const secretMeetingState = getSecretMeetingState();

  // Select button component
  const ButtonComponent = hasError ? (
    <RetryButton isProcessing={isProcessing} onRetry={onRetry} />
  ) : isSecretMeetingPhase ? (
    <SecretMeetingButton canStart={secretMeetingState.canStart} inProgress={secretMeetingState.inProgress} onClick={onOpenSecretMeeting} />
  ) : (
    <NormalPhaseButtons
      canExecuteNext={canExecuteNext}
      isAutoExecuting={isAutoExecuting}
      isProcessing={isProcessing}
      onAutoExecute={onAutoExecute}
      onStopAuto={onStopAuto}
      onNextStep={onNextStep}
    />
  );

  return (
    <>
      {ButtonComponent}
      <Button
        onClick={onReset}
        className="w-full bg-red-600 hover:bg-red-700 text-white"
      >
        <RotateCw className="w-4 h-4 mr-2" />
        重置游戏
      </Button>

      {/* Keyboard shortcuts hint */}
      <div className="mt-2 p-2 rounded-lg bg-muted/50 text-xs text-muted-foreground">
        <div className="flex items-center justify-center gap-2">
          <span>快捷键：</span>
          <Kbd>Space</Kbd>
          <span>或</span>
          <Kbd>Enter</Kbd>
          <span>下一步</span>
        </div>
      </div>
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
            {winner === 'marked' ? (
              <>
                <Mountain className="w-3 h-3" />
                收割阵营
              </>
            ) : (
              <>
                <Users className="w-3 h-3" />
                羔羊阵营
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
    isAutoExecuting,
    lastError,
    apiKey: storedApiKey,
    apiUrl: storedApiUrl,
    setApiKey: saveApiKey,
    setApiUrl: saveApiUrl,
    startGame,
    resetGame,
    executeNextStep,
    executePhaseAuto,
    stopAutoExecution,
    retryCurrentStep,
    clearError,
    openSecretMeetingSelector,
  } = useGameStore();
  const [apiKey, setApiKey] = useState(storedApiKey);
  const [apiUrl, setApiUrl] = useState(storedApiUrl);
  const [isValidating, setIsValidating] = useState(false);
  const [personalityEditorOpen, setPersonalityEditorOpen] = useState(false);
  const [gameGuideOpen, setGameGuideOpen] = useState(false);
  const [promptViewerOpen, setPromptViewerOpen] = useState(false);

  // Sync local state with persisted apiKey from store
  useEffect(() => {
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, [storedApiKey]);

  // Sync local state with persisted apiUrl from store
  useEffect(() => {
    if (storedApiUrl) {
      setApiUrl(storedApiUrl);
    }
  }, [storedApiUrl]);

  const handleSaveSettings = async () => {
    const trimmedKey = apiKey.trim();
    if (!trimmedKey) {
      alert('请输入你的 Gemini API 密钥');
      return;
    }

    const trimmedUrl = apiUrl.trim();

    setIsValidating(true);
    const isValid = await testGeminiKey(trimmedKey, trimmedUrl);
    setIsValidating(false);

    if (!isValid) {
      alert(
        'API 密钥验证失败！\n\n请检查：\n1. API 密钥是否正确\n2. 是否已启用 Gemini API\n3. 网络连接是否正常\n4. API URL 是否正确\n\n获取 API 密钥：https://aistudio.google.com/app/apikey',
      );
      return;
    }

    saveApiKey(trimmedKey);
    if (trimmedUrl) {
      saveApiUrl(trimmedUrl);
    }

    alert('设置已保存！');
  };

  const handleStart = async () => {
    const trimmedKey = apiKey.trim();
    if (!trimmedKey) {
      alert('请输入你的 Gemini API 密钥');
      return;
    }

    const trimmedUrl = apiUrl.trim();

    setIsValidating(true);
    const isValid = await testGeminiKey(trimmedKey, trimmedUrl);
    setIsValidating(false);

    if (!isValid) {
      alert(
        'API 密钥验证失败！\n\n请检查：\n1. API 密钥是否正确\n2. 是否已启用 Gemini API\n3. 网络连接是否正常\n4. API URL 是否正确\n\n获取 API 密钥：https://aistudio.google.com/app/apikey',
      );
      return;
    }

    saveApiKey(trimmedKey);
    if (trimmedUrl) {
      saveApiUrl(trimmedUrl);
    }
    startGame(DEFAULT_CONFIG);
  };

  const canExecuteNext = Boolean(gameState && !isProcessing && gameState.phase !== 'end' && !lastError);
  const hasActiveGame = Boolean(gameState);
  const isGameEnded = gameState?.phase === 'end' || gameState?.phase === 'setup';

  return (
    <>
    <Card className="shadow-inner-glow">
      <CardHeader className="bg-gradient-to-r from-card via-card/50 to-card border-b border-border">
        <CardTitle className="font-cinzel tracking-wide">
          游戏控制
          <span className="block text-[10px] text-muted-foreground font-normal tracking-widest opacity-60 mt-1">
            GAME CONTROL
          </span>
        </CardTitle>
        <CardDescription className="font-serif">
          配置并控制狼人杀游戏
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="control" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="control" className="flex items-center gap-2">
              <Gamepad2 className="w-4 h-4" />
              控制
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              设置
            </TabsTrigger>
            <TabsTrigger value="saves" className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              存档
            </TabsTrigger>
          </TabsList>

          <TabsContent value="control" className="space-y-4 mt-4">
            <ControlTabContent
              hasActiveGame={hasActiveGame}
              gameState={gameState}
              isGameEnded={isGameEnded}
              isValidating={isValidating}
              isProcessing={isProcessing}
              isAutoExecuting={isAutoExecuting}
              canExecuteNext={canExecuteNext}
              lastError={lastError}
              onStart={() => void handleStart()}
              onNextStep={() => void executeNextStep()}
              onAutoExecute={() => void executePhaseAuto()}
              onStopAuto={stopAutoExecution}
              onRetry={() => void retryCurrentStep()}
              onReset={resetGame}
              onClearError={clearError}
              onOpenPersonalityEditor={() => setPersonalityEditorOpen(true)}
              onOpenGameGuide={() => setGameGuideOpen(true)}
              onOpenPromptViewer={() => setPromptViewerOpen(true)}
              onOpenSecretMeeting={openSecretMeetingSelector}
            />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4 mt-4">
            <SettingsTabContent
              apiKey={apiKey}
              apiUrl={apiUrl}
              isValidating={isValidating}
              onApiKeyChange={setApiKey}
              onApiUrlChange={setApiUrl}
              onSave={() => void handleSaveSettings()}
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

    {/* Game Guide Dialog */}
    <GameGuide
      open={gameGuideOpen}
      onOpenChange={setGameGuideOpen}
    />

    {/* Prompt Viewer Dialog */}
    <PromptViewer
      open={promptViewerOpen}
      onOpenChange={setPromptViewerOpen}
    />
  </>
  );
}
