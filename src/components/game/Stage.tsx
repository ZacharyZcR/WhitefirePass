/**
 * Main stage: current speaker's portrait over the lodge, the dialogue box
 * beneath, voting progress and errors floating above it.
 */

'use client';

import type { GameState, Message } from '@/types/game';
import { cn } from '@/lib/utils';
import { artSrc, isHarvestNow, isNightScene } from '@/lib/design-tokens';
import { ADVDialogBox, isNarration } from './ADVDialogBox';
import { ActionBar, ErrorBanner } from './ActionBar';
import { Portrait } from './Portrait';
import { VoteBoard, VoteStrip } from './VoteStrip';
import { asSeen, useGodView } from '@/hooks/useGodView';

const STAGE_TYPES = [
  'speech',
  'action',
  'vote',
  'system',
  'death',
  'event',
];

/** Latest stage-worthy message and the inner monologue logged right before it */
export function pickStageMessage(messages: Message[]): {
  message?: Message;
  thinking?: string;
} {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (!STAGE_TYPES.includes(m.type)) continue;
    const prev = messages[i - 1];
    const inline = (m as Message & { thinking?: string }).thinking;
    const logged =
      prev?.type === 'thinking' && prev.from === m.from
        ? prev.content
        : undefined;
    return { message: m, thinking: inline ?? logged };
  }
  return {};
}

export function Stage({ state }: { state: GameState }) {
  const godView = useGodView((s) => s.godView);
  const picked = pickStageMessage(state.messages);
  const message = picked.message && asSeen(picked.message, godView);
  const thinking = message === picked.message ? picked.thinking : undefined;
  const speaker =
    message && !isNarration(message)
      ? state.players.find((p) => p.name === message.from)
      : undefined;
  const night = isNightScene(state.phase);
  const eventArt =
    message?.type === 'event' ? state.gameEvents.at(-1)?.eventId : undefined;

  return (
    <section className="relative min-h-0 min-w-0">
      {eventArt && (
        <div
          key={eventArt}
          className="brass-frame absolute left-1/2 top-[6%] w-[min(78%,900px)] -translate-x-1/2 overflow-hidden duration-700 animate-in fade-in zoom-in-95"
          style={{ aspectRatio: '1216 / 832' }}
        >
          <img
            src={artSrc(`events/${eventArt}`)}
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="vignette pointer-events-none absolute inset-0" />
        </div>
      )}
      {speaker && (
        <div
          key={speaker.name}
          className="absolute bottom-[4%] left-1/2 h-[96%] max-w-full -translate-x-1/2 duration-700 animate-in fade-in slide-in-from-bottom-3"
          style={{ aspectRatio: '832 / 1216' }}
        >
          <Portrait
            name={speaker.name}
            dead={!speaker.isAlive}
            harvest={godView && night && isHarvestNow(speaker.role, state.round)}
            className="stage-mask h-full w-full"
            imgClassName={cn(
              night && speaker.isAlive && 'brightness-[0.8] saturate-[0.7]'
            )}
          />
          {/* night: moonlit blue wash; day: cold snow light from the window */}
          <div
            className="stage-mask pointer-events-none absolute inset-0 transition-opacity duration-1000"
            style={{
              background: night
                ? 'rgba(20,45,90,0.45)'
                : 'linear-gradient(180deg, rgba(225,236,246,0.14), transparent 45%)',
              mixBlendMode: night ? 'multiply' : 'screen',
            }}
          />
          {night && (
            <div
              className="stage-mask pointer-events-none absolute inset-0 animate-hearth mix-blend-screen"
              style={{
                background:
                  'linear-gradient(0deg, rgba(124,199,214,0.25), transparent 50%)',
              }}
            />
          )}
        </div>
      )}

      <div className="absolute inset-x-0 top-3 z-10 flex justify-center px-6">
        <ErrorBanner />
      </div>

      <VoteBoard state={state} />

      <div className="absolute inset-x-0 bottom-0 z-10 mx-auto flex max-w-5xl flex-col items-end gap-3">
        <VoteStrip state={state} />
        <ADVDialogBox
          message={message}
          player={speaker}
          thinking={thinking}
          names={state.players.map((p) => p.name)}
          reveal={godView}
          className="h-[clamp(170px,27vh,260px)] w-full"
        >
          <ActionBar />
        </ADVDialogBox>
      </div>
    </section>
  );
}
