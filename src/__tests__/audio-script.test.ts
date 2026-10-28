import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { HATRED } from '@/lib/hatred';
import { DAY_SEVEN } from '@/lib/day-seven-script';

// 过场的配音按条数和中文原文对齐；剧本一改，这里就报哪段要重新配
const { speakers, lines } = JSON.parse(readFileSync('public/audio/voice/manifest.json', 'utf8')) as {
  speakers: Record<string, string>;
  lines: Record<string, { zh: string }[]>;
};
const keyOf = (name: string) => (name === '叙述者' ? 'narrator' : speakers[name]);

describe('过场配音和剧本对齐', () => {
  it('第三夜：每人的独白逐段都有配音', () => {
    for (const [name, text] of Object.entries(HATRED)) {
      expect(lines[`${keyOf(name)}/hatred`]?.map((l) => l.zh), name).toEqual(text.split('\n').filter(Boolean));
    }
  });

  it('第七天：每句都有配音', () => {
    const voiced = DAY_SEVEN.map(({ speaker }, i) => {
      const nth = DAY_SEVEN.slice(0, i).filter((l) => l.speaker === speaker).length;
      return lines[`${keyOf(speaker)}/day7`]?.[nth]?.zh;
    });
    expect(voiced).toEqual(DAY_SEVEN.map((l) => l.line));
  });
});
