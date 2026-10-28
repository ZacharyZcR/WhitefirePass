/**
 * 第三夜过场：困在山庄的第三天夜里，白火选中三个人，告诉他们真相。序章之后、自我介绍之前播一次。
 * 上帝视角下露出三人的收割之相、名字和红字独白；否则只是剪影，不泄露是谁。
 * 点击进入下一个镜头，空格同上，Esc 跳过整段。
 * 每个镜头开始时派发 `whitefire:chosen`（detail: { shot, seconds, speaker?, lines }），speaker 只在上帝视角下有。
 */

'use client';

import { useEffect, useState } from 'react';
import { ChevronsRight } from 'lucide-react';
import type { Player } from '@/types/game';
import { artSrc } from '@/lib/design-tokens';
import { HATRED, HATRED_TITLE } from '@/lib/hatred';
import { Portrait } from './Portrait';

interface Shot {
  id: string;
  art: string;
  lines: string[];
  chosen?: Player;
  /** 上帝视角：用他自己的第三夜 CG 铺满画面 */
  cg?: boolean;
}

/** 一行字停留多久：按字数算，一秒读七八个字，短句也至少三秒 */
const lineSeconds = (line: string) => Math.max(3, line.length / 7.5);

function shotsFor(marked: Player[], godView: boolean): Shot[] {
  return [
    {
      id: 'night',
      art: 'scenes/cellar',
      lines: ['困在山庄的第三天夜里。', '地窖里找到遗书的那一夜，所有人都睡下了。', '壁炉里的白火没有熄。它在等三个人。'],
    },
    ...marked.map((p, i) => ({
      id: `chosen-${i}`,
      art: godView ? `chosen/${encodeURIComponent(p.name)}` : 'scenes/pyre',
      chosen: p,
      cg: godView,
      lines: godView
        ? (HATRED[p.name] ?? '').split('\n').filter(Boolean)
        : ['白火叫醒了一个人。', '它贴在那人耳边，把欠他的人，一个一个念了出来。'],
    })),
    {
      id: 'sworn',
      art: 'scenes/hall_night',
      lines: ['三个人站在火边，对上了彼此的眼神。', '手背上，是同样的印记。', '从那一夜起，他们不再是人。', '——四天之后，献祭开始。'],
    },
  ];
}

export function ChosenCinematic({ marked, godView, onDone }: { marked: Player[]; godView: boolean; onDone: () => void }) {
  const [shots] = useState(() => shotsFor(marked, godView));
  const [index, setIndex] = useState(0);
  const [shownLines, setShownLines] = useState(0);
  const shot = shots[index];
  const starts = shot.lines.map((_, i) => shot.lines.slice(0, i).reduce((t, l) => t + lineSeconds(l), 0));
  const seconds = shot.lines.reduce((t, l) => t + lineSeconds(l), 0) + 1.5;

  const next = () => (index + 1 < shots.length ? setIndex(index + 1) : onDone());

  useEffect(() => {
    setShownLines(0);
    // 没有语音（静音或加载失败）时按字数出字、切镜头；一有语音就跟着语音走：开口一句揭一行，最后一句念完再切
    let timers = starts.map((at, i) => setTimeout(() => setShownLines(i + 1), 700 + at * 1000));
    timers.push(setTimeout(next, seconds * 1000));
    const onVoice = (e: Event) => {
      const d = (e as CustomEvent<{ shot: string; line: number; seconds: number }>).detail;
      if (d.shot !== shot.id) return;
      timers.forEach(clearTimeout);
      timers = d.line === shot.lines.length - 1 ? [setTimeout(next, (d.seconds + 1.2) * 1000)] : [];
      setShownLines((n) => Math.max(n, d.line + 1));
    };
    window.addEventListener('whitefire:chosen-voice', onVoice); // 先挂监听再通知音频，免得漏掉第一句
    // 上帝视角下带上被选中者的名字和台词，好让他自己开口；否则只有镜头号，不从声音上泄露是谁
    const speaker = shot.cg ? shot.chosen?.name : undefined;
    window.dispatchEvent(new CustomEvent('whitefire:chosen', { detail: { shot: shot.id, seconds, speaker, lines: shot.lines } }));
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener('whitefire:chosen-voice', onVoice);
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
      <div key={shot.id} className="absolute inset-0 duration-1000 animate-in fade-in">
        <div
          className="absolute inset-0 bg-cover bg-[center_20%]"
          style={{
            backgroundImage: `url(${artSrc(shot.art)})`,
            filter: shot.cg ? 'brightness(0.9)' : shot.chosen ? 'brightness(0.35) saturate(0.6) blur(2px)' : 'brightness(0.55)',
            animation: `ken-burns-in ${seconds + 1}s linear forwards`,
            transformOrigin: '50% 20%', // 人脸在画面上部，从上方推近，不裁头
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/90" />
        {shot.chosen && !shot.cg && <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_60%,rgba(140,20,20,0.35),transparent_60%)]" />}
      </div>

      {shot.cg && shot.chosen && (
        <div key={`${shot.id}-cg`} className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/85 to-transparent px-[12vw] pb-[7vh] pt-[18vh]">
          <div className="mb-4 flex items-baseline gap-4 duration-1000 animate-in fade-in">
            <span className="font-serif text-2xl tracking-[0.3em] text-parchment">{shot.chosen.name}</span>
            <span className="font-cinzel text-xs tracking-[0.4em] text-seal-light/80">{HATRED_TITLE}</span>
          </div>
          <div className="space-y-2">
            {shot.lines.slice(0, shownLines).map((line, i) => (
              <p key={i} className="font-serif text-[17px] leading-[1.9] tracking-wide text-[#e0645a] drop-shadow-[0_0_12px_rgba(180,30,30,0.7)] duration-1000 animate-in fade-in">
                {line}
              </p>
            ))}
          </div>
        </div>
      )}

      <div key={`${shot.id}-body`} className={shot.cg ? 'hidden' : 'absolute inset-0 flex items-center justify-center gap-12 px-[8vw]'}>
        {shot.chosen && (
          <div className="relative h-[72vh] w-[22vw] min-w-[220px] shrink-0 duration-1000 animate-in fade-in slide-in-from-bottom-4">
            <Portrait
              name={shot.chosen.name}
              harvest={godView}
              className="h-full w-full rounded-sm border border-seal/50 shadow-[0_0_60px_rgba(160,30,30,0.45)]"
              imgClassName={godView ? undefined : 'brightness-[0.12] grayscale blur-[10px] scale-110'}
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 to-transparent px-3 pb-3 pt-10 text-center">
              <div className="font-serif text-lg tracking-[0.3em] text-parchment">{godView ? shot.chosen.name : '？？？'}</div>
              <div className="mt-1 font-cinzel text-[10px] tracking-[0.4em] text-seal-light/80">{HATRED_TITLE}</div>
            </div>
          </div>
        )}

        <div className={shot.chosen ? 'max-w-[46vw] space-y-4 text-left' : 'max-w-[60vw] space-y-5 text-center'}>
          {shot.lines.slice(0, shownLines).map((line, i) => (
            <p
              key={i}
              className={
                shot.chosen && godView
                  ? 'font-serif text-[17px] leading-[2] tracking-wide text-[#e0645a] drop-shadow-[0_0_12px_rgba(180,30,30,0.6)] duration-1000 animate-in fade-in'
                  : 'font-serif text-xl leading-[2] tracking-[0.15em] text-parchment/90 duration-1000 animate-in fade-in'
              }
            >
              {line}
            </p>
          ))}
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
