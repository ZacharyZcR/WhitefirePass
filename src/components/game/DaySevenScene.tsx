/**
 * 第七天清晨：众人在大厅里吵到决定举行献祭。第三夜过场之后、自我介绍之前固定演出一次。
 * 一句一句出：说话人的立绘站在台上，台词在对话框里；按字数自动往下走，点击 / 空格进入下一句，Esc 跳过整段。
 * 每句开始时派发 `whitefire:dayseven`（detail: { index, speaker, line, direction, seconds }），音频那边据此配音。
 */

'use client';

import { useEffect, useState } from 'react';
import { ChevronsRight } from 'lucide-react';
import { artSrc } from '@/lib/design-tokens';
import { DAY_SEVEN } from '@/lib/day-seven-script';
import { Portrait } from './Portrait';

/** 一句话停留多久：按字数算，一秒读七八个字，短句也至少两秒半 */
const lineSeconds = (line: string) => Math.max(2.5, line.length / 7.5) + 0.8;

export function DaySevenScene({ onDone }: { onDone: () => void }) {
  const [index, setIndex] = useState(0);
  const cur = DAY_SEVEN[index];
  const narration = cur.speaker === '叙述者';

  const next = () => (index + 1 < DAY_SEVEN.length ? setIndex(index + 1) : onDone());

  useEffect(() => {
    const seconds = lineSeconds(cur.line);
    // 没有语音时按字数推进；有语音就等这句念完再往下
    let timer = setTimeout(next, seconds * 1000);
    const onVoice = (e: Event) => {
      const d = (e as CustomEvent<{ index: number; seconds: number }>).detail;
      if (d.index !== index) return;
      clearTimeout(timer);
      timer = setTimeout(next, (d.seconds + 0.6) * 1000);
    };
    window.addEventListener('whitefire:dayseven-voice', onVoice); // 先挂监听再通知音频
    window.dispatchEvent(
      new CustomEvent('whitefire:dayseven', { detail: { index, speaker: cur.speaker, line: cur.line, direction: cur.direction, seconds } })
    );
    return () => {
      clearTimeout(timer);
      window.removeEventListener('whitefire:dayseven-voice', onVoice);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Escape') onDone();
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div className="fixed inset-0 z-[70] cursor-pointer select-none overflow-hidden bg-black" onClick={next}>
      <div
        className="absolute inset-0 bg-cover bg-center duration-1000 animate-in fade-in"
        style={{ backgroundImage: `url(${artSrc('scenes/hall_night')})`, filter: 'brightness(0.5) saturate(0.7)' }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />

      {!narration && (
        <div key={cur.speaker} className="absolute bottom-0 left-1/2 h-[82vh] w-[min(46vh,40vw)] -translate-x-1/2 duration-500 animate-in fade-in slide-in-from-bottom-2">
          <Portrait name={cur.speaker} className="stage-mask h-full w-full" />
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 px-[10vw] pb-[6vh]">
        <div key={index} className="mx-auto max-w-4xl rounded-sm border border-brass/30 bg-ink/85 px-8 py-5 shadow-[0_10px_40px_rgba(0,0,0,0.7)] backdrop-blur-sm duration-500 animate-in fade-in">
          {narration ? (
            <p className="text-center font-serif text-lg italic leading-[1.9] tracking-wider text-parchment/85">{cur.line}</p>
          ) : (
            <>
              <div className="mb-2 font-serif text-base tracking-[0.3em] text-brass-light">{cur.speaker}</div>
              <p className="font-serif text-lg leading-[1.9] tracking-wide text-parchment">{cur.line}</p>
            </>
          )}
        </div>
        <div className="mt-2 text-center font-cinzel text-[10px] tracking-[0.4em] text-frost-dim/50">
          第七天 · 清晨　{index + 1} / {DAY_SEVEN.length}
        </div>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDone();
        }}
        className="absolute bottom-6 right-8 flex items-center gap-1 font-serif text-xs tracking-[0.3em] text-frost-dim/60 transition-colors hover:text-parchment"
      >
        跳过 <ChevronsRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
