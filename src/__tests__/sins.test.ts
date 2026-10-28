import { describe, expect, it } from 'vitest';
import { createGame, handleDeathTriggers } from '@/lib/game-engine';
import { buildPrompt } from '@/lib/deepseek';
import { buildSession } from '@/lib/ai/session';
import { SINS, debtsOf, hasBlood, shanlingWhisper, sinsAgainst, sinsBy } from '@/lib/sins';
import { DEBT_TIES, HATRED } from '@/lib/hatred';
import { DAY_SEVEN } from '@/lib/day-seven-script';
import type { GameState, Role } from '@/types/game';

const ROLES: Role[] = ['marked', 'marked', 'marked', 'heretic', 'listener', 'coroner', 'twin', 'twin', 'guard',
  'innocent', 'innocent', 'innocent', 'innocent', 'innocent', 'innocent'];
const game = (): GameState => ({ ...createGame({ playerCount: 15, roles: ROLES, enableWitch: false, enableHunter: false }), round: 1, phase: 'day' });

describe('罪孽之网', () => {
  const names = game().players.map((p) => p.name);

  it('人名都是在场的十五人，没有人害自己', () => {
    for (const s of SINS) {
      expect(names).toContain(s.by);
      for (const v of s.against) {
        expect(names).toContain(v);
        expect(v).not.toBe(s.by);
      }
    }
  });

  it('核心之罪都有终局揭晓用的一句话', () => {
    for (const s of SINS.filter((x) => x.core)) expect(s.reveal).toBeTruthy();
  });

  it('每个人都有一桩亲手犯下的核心之罪', () => {
    for (const n of names) expect(SINS.some((s) => s.by === n && s.core)).toBe(true);
  });

  it('每个人至少被另外两个人伤害过——谁抽到烙印者，山灵都有真相可说', () => {
    for (const n of names) expect(new Set(sinsAgainst(n).map((s) => s.by)).size).toBeGreaterThanOrEqual(2);
  });

  it('不知道自己伤害过谁的罪，不会出现在加害者心里', () => {
    for (const n of names) expect(sinsBy(n).every((s) => s.knows !== 'none')).toBe(true);
  });

  it('烙印者被告知真相；羔羊只记得自己做过的事', () => {
    const s = game();
    const marked = s.players.find((p) => p.role === 'marked')!;
    const lamb = s.players.find((p) => p.role === 'innocent')!;
    expect(buildPrompt(marked, s)).toContain(sinsAgainst(marked.name)[0].truth);
    expect(buildPrompt(marked, s)).toContain(HATRED[marked.name]);
    expect(buildPrompt(lamb, s)).not.toContain(HATRED[lamb.name]);
    const lambPrompt = buildPrompt(lamb, s);
    expect(sinsAgainst(lamb.name).some((x) => lambPrompt.includes(x.truth))).toBe(false);
    for (const d of sinsBy(lamb.name)) expect(lambPrompt).toContain(d.deed);
  });

  it('第三夜之后牵连翻过来：每个债主都有新看法，其余心如磐石，谁死都不动摇', () => {
    for (const name of new Set(SINS.flatMap((s) => s.against))) {
      for (const d of debtsOf(name)) expect(DEBT_TIES[name]?.[d.target]?.line.length).toBeGreaterThan(20);
    }
    const s = game();
    const marked = s.players.find((p) => p.role === 'marked' && debtsOf(p.name).length)!;
    const prompt = buildPrompt(marked, s);
    for (const d of debtsOf(marked.name)) expect(prompt).toContain(DEBT_TIES[marked.name][d.target].line);
    expect(prompt).toContain('心像石头一样硬了');
    expect(buildPrompt(s.players.find((p) => p.role === 'innocent')!, s)).not.toContain('心像石头一样硬了');

    // 烙印者的每个牵连对象都死一遍，也不会有情绪变化
    for (const p of s.players) if (p !== marked) handleDeathTriggers(s, p.name);
    expect(s.pendingStateChanges.some((c) => c.character === marked.name)).toBe(false);
  });

  it('收割阵营内部没有血债：开两百局，烙印者和背誓者之间谁也不欠谁', () => {
    for (let i = 0; i < 200; i++) {
      const harvest = game().players.filter((p) => p.role === 'marked' || p.role === 'heretic').map((p) => p.name);
      expect(harvest).toHaveLength(4);
      for (const a of harvest) for (const b of harvest) if (a !== b) expect(hasBlood(a, b)).toBe(false);
    }
  });

  it('血债按债主归拢，一条真相不漏', () => {
    for (const name of new Set(SINS.flatMap((s) => s.against))) {
      const debts = debtsOf(name);
      expect(new Set(debts.map((d) => d.target)).size).toBe(debts.length);
      expect(debts.flatMap((d) => d.truths).sort()).toEqual(sinsAgainst(name).map((s) => s.truth).sort());
    }
  });

  it('十五个人谁被白火选中都有第三夜的独白；背誓者开场里没有', () => {
    const s = game();
    for (const p of s.players) expect(HATRED[p.name]?.length).toBeGreaterThan(50);
    const heretic = s.players.find((p) => p.role === 'heretic')!;
    expect(buildPrompt(heretic, s)).not.toContain(HATRED[heretic.name]);
  });

  it('背誓者开场不知道真相，堕落那天山灵的私语才把真相带进他的会话', () => {
    const s = game();
    const heretic = s.players.find((p) => p.role === 'heretic')!;
    const truth = sinsAgainst(heretic.name)[0].truth;
    expect(buildPrompt(heretic, s)).not.toContain(truth);
    s.messages.push({ id: 'w', type: 'system', from: '山灵', content: shanlingWhisper(heretic.name, false), timestamp: 0, round: 2, phase: 'day', visibility: { player: heretic.name } });
    expect(buildPrompt(heretic, s)).toContain(truth);
  });
});

describe('第七天清晨', () => {
  it('说话的都是在场的人或叙述者，十五个人都开口，台词不暴露任何人的秘密', () => {
    const names = createGame({ playerCount: 15, roles: ROLES, enableWitch: false, enableHunter: false }).players.map((p) => p.name);
    expect(DAY_SEVEN.every((l) => l.speaker === '叙述者' || names.includes(l.speaker))).toBe(true);
    expect(new Set(DAY_SEVEN.map((l) => l.speaker)).size).toBe(16);
    const text = DAY_SEVEN.map((l) => `${l.line}${l.direction ?? ''}`).join('');
    for (const secret of ['不规整', '假神父', '通缉', '烙印', '背誓']) expect(text).not.toContain(secret);
  });

  it('每个人的会话都从这场争吵开始：别人的话是听到的，自己的话是说过的', () => {
    const s = game();
    for (const p of s.players) {
      const session = buildSession(p, s);
      const mine = DAY_SEVEN.find((l) => l.speaker === p.name)!;
      const other = DAY_SEVEN.find((l) => l.speaker !== p.name && l.speaker !== '叙述者')!;
      expect(session[1].role).toBe('user');
      expect(session.some((m) => m.role === 'assistant' && m.content.includes(mine.line))).toBe(true);
      expect(session.some((m) => m.role === 'user' && m.content.includes(`${other.speaker}：${other.line}`))).toBe(true);
    }
  });
});
