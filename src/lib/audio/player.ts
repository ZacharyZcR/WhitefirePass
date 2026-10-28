/**
 * 播放：语音排队一条接一条（带字幕），音效即时，环境音按阶段交叉淡入淡出。
 * 文件和字幕表由 scripts/audio/gen.mjs 生成在 public/audio/ 下。
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { assetPath } from '@/lib/design-tokens';
import { OPENING_SHOTS } from '@/lib/opening-script';
import { DAY_SEVEN } from '@/lib/day-seven-script';
import type { Cutscene } from '@/types/game';
import type { Ambient, Cue } from './cues';

interface Line {
  f: string;
  ja: string;
  zh: string;
}

interface Manifest {
  speakers: Record<string, string>;
  lines: Record<string, Line[]>;
  sfx: Record<string, string[]>;
}

export interface Caption {
  id: number;
  speaker: string;
  ja: string;
  zh: string;
}

/** 三路音量（0 = 关），存在本机 */
export const useAudioMix = create<{ voice: number; sfx: number; ambient: number; set: (k: 'voice' | 'sfx' | 'ambient', v: number) => void }>()(
  persist((set) => ({ voice: 0.9, sfx: 0.7, ambient: 0.4, set: (k, v) => set({ [k]: v }) }), { name: 'whitefire-audio-mix' }),
);

/** 正在播的台词字幕 */
export const useCaption = create<{ caption: Caption | null }>(() => ({ caption: null }));

let manifest: Promise<Manifest> | null = null;
function loadManifest(): Promise<Manifest> {
  // 文件还没生成也照常运行，只是没声音
  const get = <T,>(p: string, empty: T): Promise<T> =>
    fetch(assetPath(p))
      .then((r) => (r.ok ? (r.json() as Promise<T>) : empty))
      .catch(() => empty);
  manifest ??= Promise.all([
    get('/audio/voice/manifest.json', { speakers: {}, lines: {} }),
    get<Manifest['sfx']>('/audio/sfx/manifest.json', {}),
  ]).then(([voice, sfx]) => ({ ...voice, sfx }));
  return manifest;
}

// 同一组里随机挑，尽量不和上一次重复
const lastPick = new Map<string, number>();
function pick<T>(key: string, list: T[]): T {
  let i = Math.floor(Math.random() * list.length);
  if (list.length > 1 && i === lastPick.get(key)) i = (i + 1) % list.length;
  lastPick.set(key, i);
  return list[i];
}

function play(src: string, volume: number): HTMLAudioElement {
  const a = new Audio(assetPath(src));
  a.volume = volume;
  void a.play().catch(() => {});
  return a;
}

const SPEAKER_KEY: Record<string, string> = { 山灵: 'spirit', 叙述者: 'narrator' };
const queue: { line: Line; speaker: string; sting?: string; delay?: number }[] = [];
let speaking = false;
let captionId = 0;

function nextVoice() {
  const item = queue.shift();
  if (!item) {
    speaking = false;
    useCaption.setState({ caption: null });
    return;
  }
  speaking = true;
  const start = () => {
    if (item.sting) void playSfx(item.sting);
    useCaption.setState({ caption: { id: ++captionId, speaker: item.speaker, ja: item.line.ja, zh: item.line.zh } });
    const a = play(`/audio/voice/${item.line.f}`, useAudioMix.getState().voice);
    const done = () => setTimeout(nextVoice, 350);
    a.onended = done;
    a.onerror = done;
  };
  if (item.delay) setTimeout(start, item.delay);
  else start();
}

async function playSfx(key: string, delay = 0): Promise<void> {
  const files = (await loadManifest()).sfx[key];
  const volume = useAudioMix.getState().sfx;
  if (!files?.length || volume <= 0) return;
  const src = `/audio/sfx/${pick(key, files)}`;
  if (delay) setTimeout(() => play(src, volume), delay);
  else play(src, volume);
}

/** 积压太多就丢掉旧的，免得点得快时语音一直追不上画面 */
const MAX_QUEUE = 4;

export async function playCues(cues: Cue[]): Promise<void> {
  if (!cues.length) return;
  const m = await loadManifest();
  const mix = useAudioMix.getState();
  for (const c of cues) {
    if (c.kind === 'sfx') {
      void playSfx(c.key, c.delay);
      continue;
    }
    const who = SPEAKER_KEY[c.speaker] ?? m.speakers[c.speaker];
    const key = `${who}/${c.event}`;
    const lines = m.lines[key];
    if (!lines?.length || mix.voice <= 0) continue;
    queue.push({ line: pick(key, lines), speaker: c.speaker, sting: c.sting, delay: c.delay });
    if (queue.length > MAX_QUEUE) queue.shift();
  }
  if (!speaking) nextVoice();
}

// —— 过场：开场 CG、第三夜、第七天 ——
// 过场组件在每个镜头（第七天是每句）开始时派发 whitefire:<场景>，这里把这一段的台词按顺序念完，换段就掐掉上一句。
// 不出字幕：过场画面自己有中文字幕。每句开口时派发 whitefire:<场景>-voice（detail: 段标识 + { line, seconds }），
// line 是这句在这一段里的序号，seconds 是语音长度，过场可以据此让字幕跟声音出、等语音念完再换段。语音关掉时不派发
export type Scene = 'opening' | Cutscene;

interface SceneDetail {
  shot?: string;
  speaker?: string;
  index?: number;
  direction?: string;
}

const keyOf = (m: Manifest, speaker: string) => SPEAKER_KEY[speaker] ?? m.speakers[speaker];

/** 一段过场要念的台词、开头的音效，和派发事件时带回去的段标识 */
const SCENES: Record<Scene, (d: SceneDetail, m: Manifest) => { lines: Line[]; sfx?: string; id: object }> = {
  // 有 who 的用那个人的音色念他名下的台词（<角色>/opening，可以不止一句），旁白整组念 narrator/op_<镜头>，条数和 shot.lines 一一对应
  opening: ({ shot }, m) => {
    const lines = OPENING_SHOTS.find((s) => s.id === shot)?.lines ?? [];
    const keys = [...new Set(lines.map((l) => (l.who ? `${m.speakers[l.who]}/opening` : `narrator/op_${shot}`)))];
    return { lines: keys.flatMap((k) => m.lines[k] ?? []), id: { shot } };
  },
  // 上帝视角下被选中的人自己念独白（<角色>/hatred，按段对字幕）；否则旁白念剪影那两句，不从音色上泄露是谁
  chosen: ({ shot = '', speaker }, m) => {
    const chosen = shot.startsWith('chosen-');
    const key = chosen ? (speaker ? `${keyOf(m, speaker)}/hatred` : 'narrator/chosen_hidden') : `narrator/chosen_${shot}`;
    return { lines: m.lines[key] ?? [], sfx: chosen ? 'fire_whisper' : shot === 'sworn' ? 'brand' : undefined, id: { shot } };
  },
  // 每人按出场顺序一组（<角色>/day7），第几次开口就念第几句
  dayseven: ({ index = 0, speaker = '', direction = '' }, m) => {
    const nth = DAY_SEVEN.slice(0, index).filter((l) => l.speaker === speaker).length;
    const line = m.lines[`${keyOf(m, speaker)}/day7`]?.[nth];
    const sfx = /拍桌/.test(direction) ? 'slam' : /椅|坐/.test(direction) ? 'chair' : undefined;
    return { lines: line ? [line] : [], sfx, id: { index } };
  },
};

let scene: HTMLAudioElement | null = null;
let sceneRun = 0;

export function stopScene(): void {
  sceneRun++;
  scene?.pause();
  scene = null;
}

export async function playScene(name: Scene, detail: SceneDetail): Promise<void> {
  stopScene();
  const run = sceneRun;
  const m = await loadManifest();
  if (run !== sceneRun) return;
  const { lines, sfx, id } = SCENES[name](detail, m);
  if (sfx) void playSfx(sfx);
  for (const [i, line] of lines.entries()) {
    const volume = useAudioMix.getState().voice;
    if (run !== sceneRun || volume <= 0) return;
    const a = play(`/audio/voice/${line.f}`, volume);
    scene = a;
    const ended = new Promise<void>((done) => {
      a.onended = () => done();
      a.onerror = () => done();
      a.onpause = () => done();
    });
    await new Promise<void>((ready) => {
      a.onloadedmetadata = () => ready();
      void ended.then(ready);
    });
    if (run !== sceneRun) return;
    window.dispatchEvent(new CustomEvent(`whitefire:${name}-voice`, { detail: { ...id, line: i, seconds: a.duration || 0 } }));
    await ended;
    await new Promise((r) => setTimeout(r, 300));
  }
}

// —— 环境音 ——
const ambients = new Map<string, HTMLAudioElement>();

function fade(a: HTMLAudioElement, to: number, ms: number, then?: () => void) {
  const from = a.volume;
  const t0 = performance.now();
  const step = (t: number) => {
    const k = Math.min(1, (t - t0) / ms);
    a.volume = from + (to - from) * k;
    if (k < 1) requestAnimationFrame(step);
    else then?.();
  };
  requestAnimationFrame(step);
}

// 火焰比风雪轻一些
const AMBIENT_GAIN: Record<Ambient, number> = { amb_blizzard: 1, amb_night: 1, amb_fire: 0.6 };

export async function setAmbient(keys: Ambient[]): Promise<void> {
  const m = await loadManifest();
  const level = useAudioMix.getState().ambient;
  for (const [key, a] of ambients) {
    if (keys.includes(key as Ambient) && level > 0) continue;
    ambients.delete(key);
    fade(a, 0, 1500, () => a.pause());
  }
  for (const key of keys) {
    const files = m.sfx[key];
    if (ambients.has(key) || !files?.length || level <= 0) continue;
    const a = new Audio(assetPath(`/audio/sfx/${files[0]}`));
    a.loop = true;
    a.volume = 0;
    ambients.set(key, a);
    void a.play().then(() => fade(a, level * AMBIENT_GAIN[key], 2000)).catch(() => ambients.delete(key));
  }
}

/** 拖动环境音滑条时即时生效 */
export function setAmbientLevel(level: number): void {
  for (const [key, a] of ambients) a.volume = level * AMBIENT_GAIN[key as Ambient];
}

export function stopAll(): void {
  stopScene();
  queue.length = 0;
  for (const a of ambients.values()) a.pause();
  ambients.clear();
  useCaption.setState({ caption: null });
}
