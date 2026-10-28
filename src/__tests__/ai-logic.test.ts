import { describe, expect, it } from 'vitest';
import { createGame, processVoting, sacrificeQuorum } from '@/lib/game-engine';
import { getActingPlayers, getLegalTargets, mentions, segmentKey } from '@/lib/actors';
import { buildPrompt } from '@/lib/deepseek';
import { buildSession, opening, parseUtterance } from '@/lib/ai/session';
import { VOICES } from '@/lib/voices';
import type { GameState, Message, Role } from '@/types/game';

const ROLES: Role[] = [
  'marked', 'marked', 'marked', 'heretic', 'listener', 'coroner', 'twin', 'twin', 'guard',
  'innocent', 'innocent', 'innocent', 'innocent', 'innocent', 'innocent',
];

const game = (patch: Partial<GameState> = {}): GameState => ({
  ...createGame({ playerCount: 15, roles: ROLES, enableWitch: false, enableHunter: false }),
  round: 2,
  phase: 'day',
  ...patch,
});
const byRole = (s: GameState, role: Role) => s.players.find((p) => p.role === role)!;
const say = (s: GameState, from: string, content: string): Message => ({
  id: `${Math.random()}`, type: 'speech', from, content, timestamp: 0, round: s.round, phase: 'day', visibility: 'all', segment: segmentKey(s),
});

describe('行动顺序', () => {
  it('白天发言按回合轮转', () => {
    const s = game({ round: 3 });
    expect(getActingPlayers(s)[0].name).toBe(s.players[2].name);
  });

  it('被点名的人提前回应，不额外占一次', () => {
    const s = game({ round: 1 });
    const order = getActingPlayers(s).map((p) => p.name);
    s.messages.push(say(s, order[0], `我觉得${order[6]}在撒谎。`));
    const next = getActingPlayers(s).map((p) => p.name);
    expect(next[1]).toBe(order[6]);
    expect(next).toHaveLength(order.length);
  });

  it('已经说过话的人被点名，会多一次回应，但每人最多三次', () => {
    const s = game({ round: 1 });
    const [a, b] = getActingPlayers(s).map((p) => p.name);
    for (let i = 0; i < 6; i++) s.messages.push(say(s, i % 2 ? b : a, `${i % 2 ? a : b}，你在撒谎。`));
    const queue = getActingPlayers(s).map((p) => p.name);
    expect(queue.slice(0, 6)).toEqual([a, b, a, b, a, b]);
    expect(queue.filter((n) => n === a)).toHaveLength(3);
    expect(queue[6]).not.toBe(a);
  });

  it('只叫姓时，同姓的两个人都不算被点名', () => {
    const names = ['托马斯·克劳利', '莉迪亚·克劳利', '诺拉·格雷'];
    expect(mentions('克劳利先生昨晚去哪了？格雷小姐也在。', names)).toEqual(['诺拉·格雷']);
    expect(mentions('莉迪亚，还有托马斯', names)).toEqual(['莉迪亚·克劳利', '托马斯·克劳利']);
  });

  it('临终：被献祭的人先开口，点了谁谁回话，没点名就由投他石头的人接，一来一回最多八轮', () => {
    const s = game({ phase: 'voting', ballot: true });
    const [c, a, b, v] = s.players.map((p) => p.name);
    s.lastWords = c;
    s.votes = [{ from: v, target: c }];
    const turn = (from: string, text: string) => s.messages.push(say(s, from, text));
    expect(getActingPlayers(s)[0].name).toBe(c);
    turn(c, `${a}，你会后悔的。`);
    expect(getActingPlayers(s)[1].name).toBe(a);
    turn(a, '……');
    expect(getActingPlayers(s)[2].name).toBe(c);
    turn(c, '你们都会下地狱。');
    expect(getActingPlayers(s)[3].name).toBe(v);
    for (let i = 0; i < 5; i++) turn(getActingPlayers(s)[s.messages.filter((m) => m.segment).length].name, '……');
    expect(getActingPlayers(s)).toHaveLength(8);
    expect(getLegalTargets(s, s.players[1])).toBeNull();
  });

  it('聆心者先选人，听完结果再说一句', () => {
    const s = game({ phase: 'night', nightPhase: 'listener' });
    const listener = byRole(s, 'listener');
    expect(getActingPlayers(s)).toEqual([listener, listener]);
    expect(getLegalTargets(s, listener)).not.toBeNull();
    s.listenerChecks.push({ round: s.round, target: s.players[0].name, isClean: true });
    expect(getLegalTargets(s, listener)).toBeNull();
  });

  it('烙印者密谋至少轮两圈', () => {
    const s = game({ phase: 'night', nightPhase: 'marked-discuss' });
    const order = getActingPlayers(s).map((p) => p.name);
    expect(order).toHaveLength(6);
    expect(order.slice(3)).toEqual(order.slice(0, 3));
  });

  it('食灰者尝到了今夜的灰才开口', () => {
    const s = game({ phase: 'night', nightPhase: 'coroner' });
    s.coronerReports.push({ round: s.round, target: s.players[0].name, isClean: true });
    expect(getActingPlayers(s).map((p) => p.role)).toEqual(['coroner']);
  });

  it('设闩者死后夜里没有守门这一步，食灰者不会让全员行动', () => {
    const s = game({ phase: 'night', nightPhase: 'coroner' });
    expect(getActingPlayers(s)).toHaveLength(0);
  });
});

describe('献祭门槛', () => {
  const cast = (s: GameState, targets: number[]) => {
    s.votes = targets.map((t, i) => ({ from: s.players[i].name, target: s.players[t].name }));
  };

  it('15 人要 5 块石头，石头太散就谁也不献祭，也不重议', () => {
    const s = game({ phase: 'voting', ballot: true });
    expect(sacrificeQuorum(s)).toBe(5);
    cast(s, [1, 1, 1, 1, 2, 2, 3]);
    const r = processVoting(s);
    expect(r.eliminated).toBeNull();
    expect(r.isTied).toBe(false);
  });

  it('够了门槛就献祭；门槛以上的平票照常重议', () => {
    const s = game({ phase: 'voting', ballot: true });
    cast(s, [1, 1, 1, 1, 1]);
    expect(processVoting(s).eliminated?.name).toBe(s.players[1].name);
    cast(s, [1, 1, 1, 1, 1, 2, 2, 2, 2, 2]);
    expect(processVoting(s).isTied).toBe(true);
  });

  it('死人越多门槛越低', () => {
    const s = game();
    s.players.slice(0, 6).forEach((p) => { p.isAlive = false; });
    expect(sacrificeQuorum(s)).toBe(3);
  });
});

describe('合法目标', () => {
  it('设闩者不能锁自己，也不能连续锁同一人', () => {
    const s = game({ phase: 'night', nightPhase: 'guard' });
    const guard = byRole(s, 'guard');
    s.lastGuardedPlayer = s.players.find((p) => p !== guard)!.name;
    const names = getLegalTargets(s, guard)!.map((p) => p.name);
    expect(names).not.toContain(guard.name);
    expect(names).not.toContain(s.lastGuardedPlayer);
  });

  it('烙印者不能把同类当猎物', () => {
    const s = game({ phase: 'night', nightPhase: 'marked-vote' });
    expect(getLegalTargets(s, byRole(s, 'marked'))!.every((p) => p.role !== 'marked')).toBe(true);
  });

  it('重投只能投平票者', () => {
    const s = game({ phase: 'voting', isRevote: true, ballot: true });
    s.tiedPlayers = [s.players[0].name, s.players[1].name];
    expect(getLegalTargets(s, s.players[5])!.map((p) => p.name)).toEqual(s.tiedPlayers);
  });

  it('白天发言不需要选人', () => {
    expect(getLegalTargets(game(), game().players[0])).toBeNull();
  });
});

describe('角色会话', () => {
  const msg = (patch: Partial<Message>): Message => ({ id: `${Math.random()}`, type: 'speech', from: '叙述者', content: '', timestamp: 0, round: 1, phase: 'day', visibility: 'all', ...patch });

  it('聆心者从对话里听到自己的倾听结果，别人听不到', () => {
    const s = game({ phase: 'voting' });
    const listener = byRole(s, 'listener');
    s.messages.push(msg({ type: 'system', content: '倾听结果：某人的灵魂是 污秽 的', phase: 'night', visibility: 'listener' }));
    expect(buildPrompt(listener, s)).toContain('倾听结果：某人的灵魂是 污秽 的');
    expect(buildPrompt(byRole(s, 'innocent'), s)).not.toContain('倾听结果');
  });

  it('烙印者开场就知道同类是谁，羔羊不知道任何人的身份', () => {
    const s = game({ round: 1 });
    const [a, b, c] = s.players.filter((p) => p.role === 'marked');
    expect(opening(a, s)).toContain(b.name);
    expect(opening(a, s)).toContain(c.name);
    expect(opening(byRole(s, 'innocent'), s)).not.toContain('你们就是那三个非人者');
    expect(opening(byRole(s, 'innocent'), s)).toContain('你身上没有任何印记');
  });

  it('每个人都有自己的说话方式，写在开场里', () => {
    const s = game();
    for (const p of s.players) expect(opening(p, s)).toContain(`你说话的样子：\n${VOICES[p.name]}`);
  });

  it('别人的私密消息和心里话不会出现在会话里', () => {
    const s = game();
    const a = s.players.find((p) => p.role === 'innocent')!;
    const b = s.players.find((p) => p !== a)!;
    s.messages.push(
      msg({ type: 'thinking', from: b.name, content: 'B的秘密心声', round: 2, visibility: { player: b.name } }),
      msg({ from: '某烙印者', content: '今晚杀谁', round: 2, phase: 'night', visibility: 'marked' }),
    );
    const prompt = buildPrompt(a, s);
    expect(prompt).not.toContain('B的秘密心声');
    expect(prompt).not.toContain('今晚杀谁');
  });

  it('自己说过的话回到"他说过的"一侧，心里话放回括号里', () => {
    const s = game();
    const me = byRole(s, 'innocent');
    s.messages.push(
      msg({ type: 'thinking', from: me.name, content: '我不信她', visibility: { player: me.name } }),
      msg({ from: me.name, content: '你在撒谎。' }),
    );
    const session = buildSession(me, s);
    expect(session.some((m) => m.role === 'assistant' && m.content === '（我不信她）你在撒谎。')).toBe(true);
    expect(session.at(-1)!.role).toBe('user');
  });

  it('回复拆成心里话和说出口的话', () => {
    expect(parseUtterance('（她在撒谎。）……我不这么觉得。')).toEqual({ thinking: '她在撒谎。', speech: '……我不这么觉得。' });
    expect(parseUtterance('我不知道。')).toEqual({ thinking: '', speech: '我不知道。' });
    // 台词中间插的动作括号也挪回心里
    expect(parseUtterance('（想好了。）我选你。（把石头放下）就这样。')).toEqual({ thinking: '想好了。\n把石头放下', speech: '我选你。就这样。' });
    // 模型换成方括号写心里话
    expect(parseUtterance('[谁先说话谁先暴露。]\n\n诸位，我同意。\n\n[手心在冒汗。]')).toEqual({ thinking: '谁先说话谁先暴露。\n手心在冒汗。', speech: '诸位，我同意。' });
    expect(parseUtterance('【她在撒谎】不。')).toEqual({ thinking: '她在撒谎', speech: '不。' });
    expect(parseUtterance('〔那个女人刚才说了米德兰。别提切尔西……〕\n\n我、我是奥利弗·佩恩。')).toEqual({ thinking: '那个女人刚才说了米德兰。别提切尔西……', speech: '我、我是奥利弗·佩恩。' });
    expect(parseUtterance('［别抖］我没事。').speech).toBe('我没事。');
    expect(parseUtterance('父亲咳在《西塞罗全集》上。').speech).toBe('父亲咳在《西塞罗全集》上。');
    // 开头的括号没合上，到换行为止算心里话
    expect(parseUtterance('（掌心全是汗，这算什么\n不、不投。')).toEqual({ thinking: '掌心全是汗，这算什么', speech: '不、不投。' });
    // 整句套引号的去掉引号，句中引用保留
    expect(parseUtterance('（嗯）“我没下过地窖。”\n\n“你说‘人写的’？”').speech).toBe('我没下过地窖。\n\n你说‘人写的’？');
    expect(parseUtterance('他说"背弃"这个词。').speech).toBe('他说"背弃"这个词。');
  });
});
