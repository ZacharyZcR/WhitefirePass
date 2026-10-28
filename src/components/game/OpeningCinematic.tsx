/**
 * 开场 CG：电影画幅的静帧，缓慢推拉，旁白与人物的话逐行浮现。
 * 点击进入下一个镜头，空格同上，Esc 或右下角跳过整段。
 * 每个镜头开始时派发 `whitefire:opening`（detail: { shot, seconds }），音频那边据此放旁白和配乐。
 */

'use client';

import { useEffect, useState } from 'react';
import { ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { artSrc } from '@/lib/design-tokens';
import { OPENING_SHOTS } from '@/lib/opening-script';

export function OpeningCinematic({ onDone }: { onDone: () => void }) {
  const [index, setIndex] = useState(0);
  const [shownLines, setShownLines] = useState(0);
  const shot = OPENING_SHOTS[index];

  const next = () =>
    index + 1 < OPENING_SHOTS.length ? setIndex(index + 1) : onDone();

  // 镜头开始：通知音频，按时长逐行放出字幕，到点进入下一个镜头
  useEffect(() => {
    setShownLines(0);
    const reveal = (n: number) => setShownLines((shown) => Math.max(shown, n));
    // 字幕跟着语音开口出现；没有语音（静音或加载失败）时按时长平均出，两者取先到的
    const onVoice = (e: Event) => {
      const { shot: id, line } = (e as CustomEvent<{ shot: string; line: number }>).detail;
      if (id === shot.id) reveal(line + 1);
    };
    window.addEventListener('whitefire:opening-voice', onVoice); // 先挂监听再通知音频，免得漏掉第一句
    window.dispatchEvent(
      new CustomEvent('whitefire:opening', {
        detail: { shot: shot.id, seconds: shot.seconds },
      })
    );
    const gap = (shot.seconds * 1000) / (shot.lines.length + 0.5);
    const timers = shot.lines.map((_, i) =>
      setTimeout(() => reveal(i + 1), 600 + i * gap)
    );
    timers.push(setTimeout(next, shot.seconds * 1000));
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener('whitefire:opening-voice', onVoice);
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
    <div
      className="fixed inset-0 z-[70] cursor-pointer select-none overflow-hidden bg-black"
      onClick={next}
    >
      {shot.art && (
        <div
          key={shot.id}
          className="absolute inset-0 duration-1000 animate-in fade-in"
        >
          <div
            className="absolute inset-0 bg-cover bg-[center_15%]"
            style={{
              backgroundImage: `url(${artSrc(shot.art)})`,
              animation: `${index % 2 ? 'ken-burns-out' : 'ken-burns-in'} ${shot.seconds + 1}s linear forwards`,
              transformOrigin: '50% 20%', // 人脸多在画面上部，从上方推近，不裁头
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80" />
        </div>
      )}
      <div className="grain pointer-events-none absolute inset-0" />

      {/* 电影画幅的上下黑边 */}
      <div className="absolute inset-x-0 top-0 h-[6vh] bg-black" />
      <div className="absolute inset-x-0 bottom-0 h-[6vh] bg-black" />

      {shot.title && (
        <div className="duration-[2000ms] absolute inset-0 flex flex-col items-center justify-center animate-in fade-in">
          <div className="font-latin text-lg italic tracking-[0.5em] text-brass/70">
            Mons Ignis Albi
          </div>
          <h1 className="text-brass-gradient mt-3 font-serif text-8xl font-black tracking-[0.35em]">
            白烬山口
          </h1>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-[9vh] flex flex-col items-center gap-4 px-[12vw] text-center">
        {shot.lines.slice(0, shownLines).map((line, i) => (
          <div
            key={`${shot.id}-${i}`}
            className="duration-1000 animate-in fade-in slide-in-from-bottom-1"
          >
            {line.who && line.who !== shot.lines[i - 1]?.who && (
              <div className="mb-1.5 font-serif text-xs tracking-[0.5em] text-brass-light/80">
                {line.who}
              </div>
            )}
            <p
              className={cn(
                'font-serif leading-relaxed tracking-[0.15em] [text-shadow:0_2px_14px_rgba(0,0,0,0.95)]',
                line.who
                  ? 'text-xl text-parchment'
                  : 'text-lg italic text-frost'
              )}
            >
              {line.zh}
            </p>
          </div>
        ))}
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDone();
        }}
        className="absolute bottom-[1.5vh] right-8 flex items-center gap-1 font-serif text-xs tracking-[0.4em] text-frost-dim/60 transition-colors hover:text-parchment"
      >
        跳过
        <ChevronsRight className="h-3.5 w-3.5" />
      </button>
      <div className="absolute bottom-[2vh] left-8 font-cinzel text-[10px] tracking-[0.4em] text-brass/40">
        {index + 1} / {OPENING_SHOTS.length}
      </div>
    </div>
  );
}
