// 列出可用日语音色 → voices-ja.json（挑音色用，不进游戏）
import { readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
const key = readFileSync(`${homedir()}/.config/fallen-heroine/elevenlabs.key`, "utf8").trim();
const get = async (u) => (await fetch(`https://api.elevenlabs.io${u}`, { headers: { "xi-api-key": key } })).json();
const own = await get("/v2/voices?page_size=100");
const shared = [];
for (const gender of ["female", "male"]) for (let page = 0; page < 4; page++) {
  const r = await get(`/v1/shared-voices?language=ja&gender=${gender}&page_size=100&page=${page}&sort=usage_character_count_1y`);
  shared.push(...(r.voices ?? []));
  if (!r.has_more) break;
}
writeFileSync(process.argv[2], JSON.stringify({
  own: own.voices?.map((v) => ({ id: v.voice_id, name: v.name, labels: v.labels, desc: v.description?.slice(0, 160) })),
  shared: shared.map((v) => ({ id: v.voice_id, owner: v.public_owner_id, name: v.name, gender: v.gender, age: v.age, accent: v.accent, use: v.use_case, desc: v.description?.slice(0, 200), uses: v.usage_character_count_1y, cloned: v.cloned_by_count, preview: v.preview_url })),
}, null, 1));
console.log(own.voices?.length, shared.length);
