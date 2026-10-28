/**
 * Message flow - the ledger's entries, grouped by round and phase.
 */

'use client';

import { useEffect, useRef } from 'react';
import { RotateCcw } from 'lucide-react';
import type { Message, Player } from '@/types/game';
import { cn } from '@/lib/utils';
import { PHASE_LABELS } from '@/lib/latin-text';
import { PHASE_NAME, roleInfo, toHanzi } from '@/lib/design-tokens';
import { useGameStore } from '@/stores/game-store';

interface MessageFlowProps {
  messages: Message[];
  players?: Player[];
  filterTypes?: string[];
}

const TYPE_MARK: Record<string, { label: string; tone: string }> = {
  system: { label: '叙述', tone: 'text-frost-dim border-frost-dim/30' },
  speech: { label: '发言', tone: 'text-brass border-brass/30' },
  vote: { label: '投票', tone: 'text-seal-light border-seal/40' },
  death: { label: '讣告', tone: 'text-seal-light border-seal/50' },
  action: { label: '行动', tone: 'text-pyre-soft border-pyre/30' },
  prompt: { label: '神谕', tone: 'text-pyre-soft border-pyre/30' },
  thinking: { label: '独白', tone: 'text-pyre border-pyre/30' },
};

const isAIMessage = (m: Message) => ['speech', 'vote', 'thinking'].includes(m.type) && m.from !== '叙述者';

const formatTime = (t: number) =>
  new Date(t).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

function PhaseDivider({ round, phase }: { round?: number; phase?: Message['phase'] }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <span className="rule-brass flex-1" />
      <div className="text-center leading-tight">
        <div className="font-serif text-xs tracking-[0.3em] text-brass-light">
          {round ? `第${toHanzi(round)}回` : ''}
          {round && phase ? ' · ' : ''}
          {phase ? PHASE_NAME[phase] : ''}
        </div>
        {phase && <div className="font-latin text-[10px] italic text-brass/50">{PHASE_LABELS[phase]?.latin}</div>}
      </div>
      <span className="rule-brass flex-1" />
    </div>
  );
}

function MessageContent({ message }: { message: Message }) {
  if (message.type === 'prompt') {
    return (
      <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-sm border border-pyre/20 bg-black/40 p-3 font-mono text-[11px] leading-relaxed text-pyre-soft">
        {message.content}
      </pre>
    );
  }
  return (
    <p
      className={cn(
        'whitespace-pre-line leading-relaxed',
        message.type === 'thinking' && 'italic text-pyre/85',
        message.type === 'system' && 'italic text-frost',
        message.type === 'death' && 'text-seal-light',
      )}
    >
      {message.content}
    </p>
  );
}

function MessageItem({ message, players, showRetry }: { message: Message; players?: Player[]; showRetry: boolean }) {
  const { retryLastAIResponse, isProcessing } = useGameStore();
  const player = players?.find((p) => p.name === message.from.replace(/\s*\(神谕\)\s*$/, ''));
  const mark = TYPE_MARK[message.type] ?? TYPE_MARK.system;

  return (
    <article className="group border-b border-brass/10 py-2.5 font-serif text-sm text-parchment animate-in fade-in slide-in-from-bottom-1 duration-300">
      <header className="mb-1 flex items-center gap-2">
        <span className="font-semibold tracking-wider text-brass-light">{message.from}</span>
        {player && (
          <span className="text-[10px]" style={{ color: roleInfo(player.role).color }}>
            {roleInfo(player.role).name}
          </span>
        )}
        <span className={cn('rounded-[2px] border px-1 text-[9px] tracking-widest', mark.tone)}>{mark.label}</span>
        <span className="ml-auto flex items-center gap-2">
          {showRetry && (
            <button
              onClick={() => void retryLastAIResponse()}
              disabled={isProcessing}
              className="flex items-center gap-1 rounded-sm border border-brass/30 px-1.5 py-0.5 text-[10px] text-brass hover:border-brass/70 hover:text-brass-light disabled:opacity-40"
            >
              <RotateCcw className="h-3 w-3" />
              重试
            </button>
          )}
          <span className="font-mono text-[10px] text-frost-dim/50">{formatTime(message.timestamp)}</span>
        </span>
      </header>
      <MessageContent message={message} />
    </article>
  );
}

export function MessageFlow({ messages, players, filterTypes }: MessageFlowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const list = filterTypes ? messages.filter((m) => filterTypes.includes(m.type)) : messages;

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [list]);

  let lastAI = -1;
  for (let i = list.length - 1; i >= 0; i--) {
    if (isAIMessage(list[i])) {
      lastAI = i;
      break;
    }
  }

  return (
    <div ref={scrollRef} className="h-full w-full overflow-y-auto px-6 pb-6">
      {list.length === 0 ? (
        <div className="flex h-full items-center justify-center font-serif text-sm tracking-widest text-frost-dim">
          此页尚无记载
        </div>
      ) : (
        list.map((m, i) => {
          const prev = list[i - 1];
          const roundChanged = m.round !== undefined && m.round !== prev?.round;
          const phaseChanged = m.phase !== undefined && m.phase !== prev?.phase;
          return (
            <div key={m.id}>
              {(roundChanged || phaseChanged) && (m.round || m.phase) && (
                <PhaseDivider round={roundChanged ? m.round : undefined} phase={m.phase} />
              )}
              <MessageItem message={m} players={players} showRetry={i === lastAI} />
            </div>
          );
        })
      )}
    </div>
  );
}
