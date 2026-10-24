/**
 * ADV dialogue box: name plate, typewriter text, optional inner voice,
 * and a footer slot for the action buttons.
 */

'use client';

import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { Message, Player } from '@/types/game';
import { FrameCorners } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { PHASE_NAME, roleInfo, toHanzi } from '@/lib/design-tokens';

const TYPE_LABEL: Record<string, string> = {
  speech: '发言',
  vote: '投票',
  action: '行动',
  secret: '密会',
  death: '讣告',
  system: '叙述',
  event: '异事',
};

const NARRATION_TYPES = ['system', 'death', 'event'];

export const isNarration = (m: Message): boolean => NARRATION_TYPES.includes(m.type) || m.from === '叙述者';

function useTypewriter(text: string, key: string) {
  const [state, setState] = useState({ key, n: 0 });
  const n = state.key === key ? state.n : 0;

  useEffect(() => {
    if (n >= text.length) return;
    const t = setTimeout(() => setState({ key, n: Math.min(text.length, n + 2) }), 26);
    return () => clearTimeout(t);
  }, [key, n, text.length]);

  return { shown: text.slice(0, n), done: n >= text.length, skip: () => setState({ key, n: text.length }) };
}

function NamePlate({ message, player }: { message: Message; player?: Player }) {
  const role = player ? roleInfo(player.role) : null;
  return (
    <div className="absolute -top-4 left-8 z-10 flex items-stretch">
      <div className="brass-frame panel-ink flex items-baseline gap-3 px-5 py-1.5">
        <span className="font-serif text-lg font-semibold tracking-[0.2em] text-brass-light text-engraved">{message.from}</span>
        {role && (
          <span className="text-xs tracking-wider text-frost-dim">
            <span style={{ color: role.color }}>{role.name}</span>
            {player?.occupation && <span> · {player.occupation}</span>}
          </span>
        )}
      </div>
      <span className="ml-2 self-center rounded-sm border border-brass/30 bg-ink/80 px-2 py-0.5 text-[10px] tracking-[0.3em] text-brass/80">
        {TYPE_LABEL[message.type] ?? message.type}
      </span>
    </div>
  );
}

function InnerVoice({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-2 flex-shrink-0">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className="flex items-center gap-1 text-[11px] tracking-[0.3em] text-pyre-soft/80 transition-colors hover:text-pyre"
      >
        <ChevronDown className={cn('h-3 w-3 transition-transform', open && 'rotate-180')} />
        心声
      </button>
      {open && (
        <p className="mt-1 max-h-24 overflow-y-auto whitespace-pre-line border-l border-pyre/30 pl-3 font-serif text-sm italic leading-relaxed text-pyre/80">
          {text}
        </p>
      )}
    </div>
  );
}

interface ADVDialogBoxProps {
  message?: Message;
  player?: Player;
  thinking?: string;
  children?: React.ReactNode;
  className?: string;
}

export function ADVDialogBox({ message, player, thinking, children, className }: ADVDialogBoxProps) {
  const { shown, done, skip } = useTypewriter(message?.content ?? '', message?.id ?? 'empty');
  const narration = message ? isNarration(message) : false;

  return (
    <div className={cn('relative', className)}>
      {message && !narration && <NamePlate message={message} player={player} />}

      <div className="brass-frame panel-ink relative flex h-full flex-col px-10 pb-3 pt-7">
        <FrameCorners />
        <div className="grain absolute inset-0" />

        {!message ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
            <div className="font-cinzel text-sm tracking-[0.5em] text-brass/60">WHITEFIRE PASS</div>
            <div className="font-serif text-sm tracking-widest text-frost-dim">按下「下一步」，故事将会开始……</div>
          </div>
        ) : (
          <>
            {narration && (
              <div className="mb-2 flex flex-shrink-0 items-center justify-center gap-3 text-[11px] tracking-[0.5em] text-brass/60">
                <span className="rule-brass w-16" />叙 述<span className="rule-brass w-16" />
              </div>
            )}
            {thinking && !narration && <InnerVoice key={message.id} text={thinking} />}
            <div onClick={skip} className="relative min-h-0 flex-1 cursor-pointer overflow-y-auto pr-2">
              <p
                className={cn(
                  'whitespace-pre-line font-serif leading-[1.9] tracking-wide',
                  narration ? 'text-center text-[15px] italic text-frost' : 'text-[16px] text-parchment',
                )}
              >
                {shown}
                {!done && <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-pulse bg-brass-light" />}
              </p>
            </div>
          </>
        )}

        <footer className="relative mt-2 flex flex-shrink-0 items-center justify-between gap-4 border-t border-brass/10 pt-2">
          <span className="font-serif text-[11px] tracking-widest text-frost-dim/70">
            {message?.round ? `第${toHanzi(message.round)}回 · ` : ''}
            {message?.phase ? PHASE_NAME[message.phase] : '寂静山庄'}
            {message && done && <span className="ml-3 animate-pulse text-brass/70">▼</span>}
          </span>
          <div className="flex items-center gap-2">{children}</div>
        </footer>
      </div>
    </div>
  );
}
