// 列出模型（能否说日语）和本月额度：bash scripts/audio/run.sh node scripts/audio/el-models.mjs
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
const key = readFileSync(`${homedir()}/.config/fallen-heroine/elevenlabs.key`, "utf8").trim();
const r = await (await fetch("https://api.elevenlabs.io/v1/models", { headers: { "xi-api-key": key } })).json();
for (const m of r) console.log(m.model_id, m.can_do_text_to_speech, (m.languages ?? []).some((l) => l.language_id === "ja"), m.token_cost_factor, m.maximum_text_length_per_request);
const s = await (await fetch("https://api.elevenlabs.io/v1/user/subscription", { headers: { "xi-api-key": key } })).json();
console.log("chars", s.character_count, "/", s.character_limit, "voice slots", s.voice_slots_used, "/", s.voice_limit);
