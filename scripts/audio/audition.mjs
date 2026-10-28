// 试音：几个候选音色念同几句台词，存到指定目录，再量每条的基频（判断声线高低）
// 用法：node scripts/audio/audition.mjs <输出目录> <名字=音色id>... -- <台词>...
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
const key = readFileSync(`${homedir()}/.config/fallen-heroine/elevenlabs.key`, "utf8").trim();
const [dir, ...rest] = process.argv.slice(2);
const sep = rest.indexOf("--");
const voices = rest.slice(0, sep).map((s) => s.split("="));
const lines = rest.slice(sep + 1);
mkdirSync(dir, { recursive: true });
for (const [name, id] of voices) {
  for (const [i, text] of lines.entries()) {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${id}?output_format=mp3_44100_128`, {
      method: "POST", headers: { "Content-Type": "application/json", "xi-api-key": key },
      body: JSON.stringify({ text, model_id: "eleven_v4", language_code: "ja" }),
    });
    if (!res.ok) { console.log(name, res.status, (await res.text()).slice(0, 200)); continue; }
    const f = `${dir}/${name}-${i + 1}.mp3`;
    writeFileSync(f, Buffer.from(await res.arrayBuffer()));
    console.log(name, i + 1, execFileSync("python3", ["scripts/audio/pitch.py", f]).toString().trim());
  }
}
