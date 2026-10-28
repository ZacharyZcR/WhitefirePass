// 把生成的台词送回 Scribe 转写，和原文对照（检查读错、标签被念出来、静音）。用法：el-check.mjs <正则，比如 ^sophia/ 或 /(hatred|day7)$>
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
const key = readFileSync(`${homedir()}/.config/fallen-heroine/elevenlabs.key`, "utf8").trim();
const manifest = JSON.parse(readFileSync("public/audio/voice/manifest.json", "utf8")).lines;
const prefix = process.argv[2] ?? "";
for (const [k, list] of Object.entries(manifest)) {
  if (!new RegExp(prefix).test(k)) continue;
  for (const { f, ja } of list) {
    const form = new FormData();
    form.append("model_id", "scribe_v1");
    form.append("language_code", "ja");
    form.append("file", new Blob([readFileSync(`public/audio/voice/${f}`)]), "a.ogg");
    const r = await (await fetch("https://api.elevenlabs.io/v1/speech-to-text", { method: "POST", headers: { "xi-api-key": key }, body: form })).json();
    const dur = r.words?.at(-1)?.end?.toFixed(1);
    console.log(`${k}\n  原文 ${ja}\n  听到 ${r.text ?? JSON.stringify(r).slice(0, 200)}  (${dur}s)`);
  }
}
