/**
 * 游戏声音：盯着游戏状态的变化出语音、音效和环境音，并显示日语台词的字幕。
 * 挂在 GameBoard 里，要排在各个过场组件前面（先挂好监听，过场第一段的事件才不会漏）：<GameAudio state={gameState} />
 */

'use client';

import { useEffect, useRef } from 'react';
import type { GameState } from '@/types/game';
import { useGodView } from '@/hooks/useGodView';
import { ambientFor, cuesFor, snapshot, type Seen } from '@/lib/audio/cues';
import { playCues, playScene, setAmbient, stopAll, stopScene, useAudioMix, useCaption, type Scene } from '@/lib/audio/player';

export function GameAudio({ state }: { state: GameState | null }) {
  const godView = useGodView((s) => s.godView);
  const ambientOn = useAudioMix((s) => s.ambient > 0);
  const caption = useCaption((s) => s.caption);
  const prev = useRef<Seen | null>(null);

  useEffect(() => {
    if (!state) return;
    void playCues(cuesFor(prev.current, state, godView));
    prev.current = snapshot(state);
  }, [state, godView]);

  const ambientKey = ambientFor(state).join(',');
  useEffect(() => {
    void setAmbient(ambientKey ? (ambientKey.split(',') as ReturnType<typeof ambientFor>) : []);
  }, [ambientKey, ambientOn]);

  // 过场（开场 CG、第三夜、第七天）：组件每段开始时派发 whitefire:<场景>，场景结束就停
  const scene: Scene | undefined = state?.phase === 'prologue' ? 'opening' : state?.cutscenes?.[0];
  useEffect(() => {
    if (!scene) return;
    const onShot = (e: Event) => void playScene(scene, (e as CustomEvent).detail);
    window.addEventListener(`whitefire:${scene}`, onShot);
    return () => {
      window.removeEventListener(`whitefire:${scene}`, onShot);
      stopScene();
    };
  }, [scene]);

  useEffect(() => stopAll, []);

  if (!caption) return null;
  return (
    <div
      key={caption.id}
      className="pointer-events-none fixed inset-x-0 bottom-[calc(clamp(170px,27vh,260px)+4.5rem)] z-40 flex justify-center px-6 animate-in fade-in duration-500"
    >
      <div className="max-w-2xl rounded-sm bg-ink/60 px-5 py-2 text-center backdrop-blur-[2px]">
        <div className="font-serif text-[15px] tracking-wide text-parchment [text-shadow:0_1px_6px_rgba(0,0,0,0.9)]">
          <span className="mr-2 text-[11px] tracking-[0.3em] text-brass/80">{caption.speaker}</span>
          「{caption.ja}」
        </div>
        <div className="mt-0.5 font-serif text-xs tracking-wider text-frost-dim">{caption.zh}</div>
      </div>
    </div>
  );
}
