// 预生成声音（ElevenLabs）。在 WSL 里跑（ffmpeg 只装在那边）：
//   bash scripts/audio/run.sh node scripts/audio/gen.mjs [--sfx|--music] [--only <前缀>] [--force] [--dry]
//
//   台词（默认） scripts/audio/lines.json → public/audio/voice/<角色>/<事件>/<哈希>.ogg，字幕表 public/audio/voice/manifest.json
//   --sfx        scripts/audio/sfx.json   → public/audio/sfx/<key>/<哈希>.ogg，清单 public/audio/sfx/manifest.json
//   --music      scripts/audio/music.json → public/audio/music/<key>.ogg（无缝循环）
//   --only x     只跑 key（台词是「角色/事件」）以 x 开头的
//   --dry        只数要生成多少条、多少字符，不花额度
//   --recode     用缓存的原始音频重新转码（改了响度/裁剪之后），不花额度
//
// 音色在 scripts/audio/voice.json。台词里可以直接写 v3/v4 标签：[whispers] [sighs] [gasps] …
// 密钥从 ELEVENLABS_API_KEY 或 ~/.config/fallen-heroine/elevenlabs.key 读，不进仓库。
// 付费拿到的原始音频缓存在 ~/.cache/whitefire/raw，重新转码不再花钱。
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const args = process.argv.slice(2);
const force = args.includes("--force");
const dry = args.includes("--dry");
const recode = args.includes("--recode");
const only = args.includes("--only") ? args[args.indexOf("--only") + 1] : null;
const mode = args.includes("--sfx") ? "sfx" : args.includes("--music") ? "music" : "voice";
const SRC = "scripts/audio";
const OUT = "public/audio";
const json = (f) => JSON.parse(readFileSync(f, "utf8"));
const hash = (s) => createHash("sha1").update(s).digest("hex").slice(0, 10);

function elevenKey() {
  if (process.env.ELEVENLABS_API_KEY) return process.env.ELEVENLABS_API_KEY.trim();
  return readFileSync(join(homedir(), ".config/fallen-heroine/elevenlabs.key"), "utf8").trim();
}

// 429（并发超限）、409（库里的音色第一次用时被同时自动添加）退避重试
async function post(url, body) {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", "xi-api-key": elevenKey() }, body: JSON.stringify(body) });
    if (res.ok) return Buffer.from(await res.arrayBuffer());
    if ((res.status === 429 || res.status === 409) && attempt < 6) { await new Promise((r) => setTimeout(r, 2000 * 2 ** attempt)); continue; }
    throw new Error(`${res.status} ${(await res.text()).slice(0, 300)}`);
  }
}

const RAW = join(homedir(), ".cache/whitefire/raw");
async function cached(id, make) {
  mkdirSync(RAW, { recursive: true });
  const f = join(RAW, `${hash(id)}.mp3`);
  if (existsSync(f) && !force) return readFileSync(f);
  const buf = await make();
  writeFileSync(f, buf);
  return buf;
}

// mp3 → ogg(opus)，裁首尾静音。lufs：统一响度（台词里的耳语、生成的音效原样忽大忽小）。loop（秒）：开头交叉淡入到结尾，做成无缝循环
function toOgg(buf, out, { loop = 0, lufs = 0 } = {}) {
  const tmp = `${out}.tmp.mp3`;
  const mid = `${out}.trim.wav`;
  writeFileSync(tmp, buf);
  const trim = "silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse";
  const norm = lufs ? `,loudnorm=I=${lufs}:TP=-1.5:LRA=11` : "";
  const ff = (...a) => execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...a]);
  if (!loop) ff("-i", tmp, "-af", trim + norm, "-c:a", "libopus", "-b:a", "64k", out);
  else {
    ff("-i", tmp, "-af", trim + norm, mid);
    ff("-i", mid, "-t", String(loop), "-i", mid, "-filter_complex",
      `[0:a]atrim=start=${loop},asetpts=PTS-STARTPTS[body];[1:a]asetpts=PTS-STARTPTS[head];[body][head]acrossfade=d=${loop}:c1=tri:c2=tri[o]`,
      "-map", "[o]", "-c:a", "libopus", "-b:a", loop >= 2 ? "96k" : "64k", out);
    rmSync(mid);
  }
  rmSync(tmp);
  if (statSync(out).size < 1000) { rmSync(out); throw new Error("转码结果是空的"); }
}

// 整体响度（LUFS）和峰值，loudnorm 的测量结果打在 stderr
function measure(file) {
  const err = spawnSync("ffmpeg", ["-i", file, "-af", "loudnorm=print_format=json", "-f", "null", "-"]).stderr.toString();
  const m = JSON.parse(err.match(/\{[^{}]*"input_i"[^{}]*\}/)[0]);
  return { lufs: Number(m.input_i), peak: Number(m.input_tp) };
}

// 分段配乐（开场 CG）：每段单独生成、各自调到自己的响度，在 at 秒处交叉淡入（提前 fade 秒），
// 上一段在这里淡出切掉——生成时多要几秒，各段自带的收尾和静音就不会留在接缝里。起伏由各段的 lufs 决定
function stitch(bufs, parts, fade, out) {
  const files = bufs.map((b, i) => { const f = `${out}.part${i}.mp3`; writeFileSync(f, b); return f; });
  const graph = files.map((f, i) => {
    const { lufs } = measure(f);
    const start = i ? parts[i].at - fade : 0;
    // 后面几段去掉自带的弱起，切进来就有声音
    // 增益按响度给足，瞬态峰值交给限幅器压住（混音后再压到 -2 dB，给 opus 编码的过冲留余量），不然高潮段被峰值卡住推不上去
    const chain = [...(i ? ["silenceremove=start_periods=1:start_threshold=-35dB"] : []), `volume=${(parts[i].lufs - lufs).toFixed(2)}dB`, "alimiter=limit=0.89:level=false"];
    if (i < parts.length - 1) {
      const dur = parts[i + 1].at - start;
      chain.push(`atrim=0:${dur}`, `afade=t=out:st=${dur - fade}:d=${fade}`);
    }
    if (i) chain.push(`afade=t=in:d=${fade}`, `adelay=${start * 1000}:all=1`);
    return `[${i}:a]${chain.join(",")}[p${i}]`;
  });
  const mix = `${files.map((_, i) => `[p${i}]`).join("")}amix=inputs=${files.length}:normalize=0:duration=longest,alimiter=limit=0.79:level=false[o]`;
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...files.flatMap((f) => ["-i", f]), "-filter_complex", `${graph.join(";")};${mix}`, "-map", "[o]", "-c:a", "libopus", "-b:a", "96k", out]);
  files.forEach((f) => rmSync(f));
}

// 目录里不在 keep 里的旧 ogg 删掉（台词改了、条数减了）
function prune(dir, keep) {
  for (const f of existsSync(dir) ? readdirSync(dir) : []) if (f.endsWith(".ogg") && !keep.has(f) && !dry) rmSync(join(dir, f));
}

const jobs = [];
let made = 0, kept = 0, failed = 0, chars = 0;
const run = (label, fn) => jobs.push(async () => {
  try { await fn(); made++; console.log(`[生成] ${label}`); } catch (e) { failed++; console.log(`[失败] ${label}\n        ${e.message}`); }
});

if (mode === "voice") {
  const voice = json(`${SRC}/voice.json`);
  const lines = json(`${SRC}/lines.json`);
  const manifestFile = `${OUT}/voice/manifest.json`;
  // 字幕表：speakers 是游戏里的名字 → 角色 key；lines 是「角色/事件」→ 台词。只换掉这次跑到的，其余照旧
  const manifest = { speakers: {}, lines: (existsSync(manifestFile) && json(manifestFile).lines) || {} };
  for (const [who, v] of Object.entries(voice.voices)) manifest.speakers[v.name] = who;
  for (const [who, events] of Object.entries(lines)) {
    if (who.startsWith("_")) continue;
    const { id: voiceId, settings } = voice.voices[who] ?? {};
    if (!voiceId) { console.log(`[跳过] ${who} 没有配音色`); continue; }
    for (const [event, list] of Object.entries(events)) {
      const key = `${who}/${event}`;
      if (only && !key.startsWith(only)) continue;
      const dir = join(OUT, "voice", who, event);
      mkdirSync(dir, { recursive: true });
      const keep = new Set();
      manifest.lines[key] = [];
      for (const { ja, zh, lufs } of list) {
        const id = `${ja}|${voiceId}|${voice.model}|${JSON.stringify(settings ?? null)}`;
        const file = `${hash(lufs ? `${id}|${lufs}` : id)}.ogg`;
        keep.add(file);
        manifest.lines[key].push({ f: `${who}/${event}/${file}`, ja: ja.replace(/\[[^\]]*\]\s*/g, "").trim(), zh });
        const out = join(dir, file);
        if (existsSync(out) && !force && !recode) { kept++; continue; }
        chars += ja.length;
        if (dry) { made++; continue; }
        run(`${key}  ${ja}`, async () => {
          const buf = await cached(`voice|${id}`, () => post(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
            { text: ja, model_id: voice.model, language_code: voice.lang, ...(settings ? { voice_settings: settings } : {}) }));
          toOgg(buf, out, { lufs: lufs ?? -16 }); // lufs：个别台词要更轻或更响（比如三句递进）
        });
      }
      prune(dir, keep);
    }
  }
  // 清单先写：中途停掉，已生成的语音也有字幕
  if (!dry) writeFileSync(manifestFile, `${JSON.stringify(manifest, null, 1)}\n`);
} else if (mode === "sfx") {
  const list = json(`${SRC}/sfx.json`);
  const manifestFile = `${OUT}/sfx/manifest.json`;
  const manifest = existsSync(manifestFile) ? json(manifestFile) : {};
  for (const [key, s] of Object.entries(list)) {
    if (key.startsWith("_") || (only && !key.startsWith(only))) continue;
    const dir = join(OUT, "sfx", key);
    mkdirSync(dir, { recursive: true });
    const keep = new Set();
    manifest[key] = [];
    for (let i = 1; i <= s.n; i++) {
      const id = `${s.text}|${s.d}|${i}`;
      const file = `${hash(id)}.ogg`;
      keep.add(file);
      manifest[key].push(`${key}/${file}`);
      const out = join(dir, file);
      if (existsSync(out) && !force && !recode) { kept++; continue; }
      if (dry) { made++; continue; }
      run(`${key} #${i}`, async () => {
        const buf = await cached(`sfx|${id}`, () => post("https://api.elevenlabs.io/v1/sound-generation", { text: s.text, duration_seconds: s.d, prompt_influence: 0.5 }));
        toOgg(buf, out, { loop: s.loop ? (s.d >= 10 ? 1.5 : 0.4) : 0, lufs: s.loop ? -26 : -18 });
      });
    }
    prune(dir, keep);
  }
  if (!dry) writeFileSync(manifestFile, `${JSON.stringify(manifest, null, 1)}\n`);
} else {
  const list = json(`${SRC}/music.json`);
  mkdirSync(`${OUT}/music`, { recursive: true });
  for (const [key, m] of Object.entries(list)) {
    if (key.startsWith("_") || (only && !key.startsWith(only))) continue;
    const out = join(OUT, "music", `${key}.ogg`);
    if (existsSync(out) && !force && !recode) { kept++; continue; }
    if (dry) { made++; continue; }
    const make = ({ prompt, seconds }) => cached(`music|${prompt}|${seconds}`, () =>
      post("https://api.elevenlabs.io/v1/music", { prompt, music_length_ms: seconds * 1000, force_instrumental: true }));
    run(`music ${key}`, async () => {
      if (m.parts) stitch(await Promise.all(m.parts.map(make)), m.parts, m.fade ?? 2, out);
      else toOgg(await make(m), out, { loop: m.loop ?? 3, lufs: -12 }); // 和其他几首差不多响
    });
  }
}

const lanes = mode === "voice" ? json(`${SRC}/voice.json`).concurrency ?? 1 : 2;
await Promise.all(Array.from({ length: lanes }, async () => { while (jobs.length) await jobs.shift()(); }));
console.log(`\n${dry ? "（试算）要" : ""}新生成 ${made} 条${mode === "voice" ? `（${chars} 字符）` : ""}，已有 ${kept} 条，失败 ${failed} 条`);
