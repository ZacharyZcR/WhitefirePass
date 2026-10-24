/**
 * Step controls that live in the dialogue box footer, plus the error banner.
 * Same behaviour as the old control panel: next / auto / retry / secret meeting.
 */

'use client';

import { AlertTriangle, ChevronRight, FastForward, Loader2, RotateCw, Square, Users, X } from 'lucide-react';
import { useGameStore } from '@/stores/game-store';
import { cn } from '@/lib/utils';

function BarButton({
  children,
  primary,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { primary?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        'flex h-8 items-center gap-1.5 rounded-sm border px-3 font-serif text-xs tracking-[0.25em] transition-all disabled:pointer-events-none disabled:opacity-40',
        primary
          ? 'border-brass-light/70 bg-gradient-to-b from-[#4a3820] to-[#2a1f12] text-brass-light shadow-[inset_0_1px_0_rgba(255,230,180,0.25)] hover:from-[#5a4428] hover:text-parchment'
          : 'border-brass/30 bg-ink/60 text-brass hover:border-brass/60 hover:text-brass-light',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function ActionBar() {
  const {
    gameState,
    isProcessing,
    isAutoExecuting,
    lastError,
    executeNextStep,
    executePhaseAuto,
    stopAutoExecution,
    retryCurrentStep,
    openSecretMeetingSelector,
  } = useGameStore();
  if (!gameState) return null;

  const canNext = !isProcessing && gameState.phase !== 'end' && !lastError;

  if (lastError) {
    return (
      <BarButton primary onClick={() => void retryCurrentStep()} disabled={isProcessing}>
        {isProcessing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCw className="h-3.5 w-3.5" />}
        重试此步
      </BarButton>
    );
  }

  if (gameState.phase === 'secret_meeting') {
    const pending = gameState.pendingSecretMeeting;
    const inProgress = Boolean(pending?.selectedParticipants && isProcessing);
    const canStart = Boolean(pending && !pending.selectedParticipants && !isProcessing);
    return (
      <BarButton primary onClick={openSecretMeetingSelector} disabled={!canStart || inProgress}>
        {inProgress ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Users className="h-3.5 w-3.5" />}
        {inProgress ? '密会进行中' : '发起密会'}
      </BarButton>
    );
  }

  return (
    <>
      <span className="mr-1 hidden text-[10px] tracking-widest text-frost-dim/50 md:inline">Space</span>
      {isAutoExecuting ? (
        <BarButton onClick={stopAutoExecution} className="border-seal-light/50 text-seal-light">
          <Square className="h-3 w-3" />
          停止
        </BarButton>
      ) : (
        <BarButton onClick={() => void executePhaseAuto()} disabled={!canNext} title="自动执行本阶段">
          <FastForward className="h-3.5 w-3.5" />
          自动
        </BarButton>
      )}
      <BarButton primary onClick={() => void executeNextStep()} disabled={!canNext || isAutoExecuting}>
        {isProcessing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
        {isProcessing ? '思索中' : '下一步'}
        {!isProcessing && <ChevronRight className="h-3.5 w-3.5" />}
      </BarButton>
    </>
  );
}

/** Request failures and exponential-backoff progress */
export function ErrorBanner() {
  const { lastError, clearError } = useGameStore();
  if (!lastError) return null;

  const retry = lastError.includes('正在重试') ? lastError.match(/\((\d+)\/(\d+)\)/) : null;
  const lines = lastError.split('\n');
  const reason = lines.find((l) => l.startsWith('原因:'))?.replace('原因:', '').trim();
  const delay = lines.find((l) => l.includes('等待'))?.match(/(\d+\.?\d*)秒/)?.[1];

  return (
    <div
      className={cn(
        'brass-frame panel-ink flex max-w-xl items-start gap-3 px-4 py-3 text-sm animate-in fade-in slide-in-from-top-2',
        retry ? 'border-brass/60' : 'border-seal-light/60',
      )}
    >
      {retry ? (
        <Loader2 className="mt-0.5 h-4 w-4 flex-shrink-0 animate-spin text-brass" />
      ) : (
        <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-seal-light" />
      )}
      <div className="min-w-0 flex-1 space-y-1">
        <p className="font-serif tracking-widest text-parchment">{retry ? '指数退避重试中' : '请求失败'}</p>
        {retry ? (
          <>
            <div className="h-1 overflow-hidden rounded-full bg-ink-600">
              <div className="h-full bg-brass transition-all" style={{ width: `${(Number(retry[1]) / Number(retry[2])) * 100}%` }} />
            </div>
            <p className="text-xs text-frost-dim">
              尝试 {retry[1]}/{retry[2]}
              {reason && <> · {reason}</>}
              {delay && <> · 等待 {delay} 秒</>}
            </p>
          </>
        ) : (
          <p className="whitespace-pre-line text-xs text-frost-dim">{lastError}</p>
        )}
      </div>
      {!retry && (
        <button onClick={clearError} className="text-frost-dim hover:text-parchment" aria-label="关闭错误提示">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
