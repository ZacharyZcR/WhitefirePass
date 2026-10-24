import { afterEach, describe, expect, it, vi } from 'vitest';
import { createGame } from '@/lib/game-engine';
import { runCli } from '@/lib/ai/cli';
import { getAIResponse } from '@/lib/deepseek';
import type { GameState, Role } from '@/types/game';

const ROLES: Role[] = [
  'marked', 'marked', 'marked', 'heretic', 'listener', 'coroner', 'twin', 'twin', 'guard',
  'innocent', 'innocent', 'innocent', 'innocent', 'innocent', 'innocent',
];

function game(): GameState {
  const s = createGame({ playerCount: 15, roles: ROLES, enableWitch: false, enableHunter: false });
  s.round = 2;
  s.phase = 'voting';
  const say = (from: string, content: string, round: number, visibility: GameState['messages'][number]['visibility'] = 'all') =>
    s.messages.push({ id: `${s.messages.length}`, type: 'speech', from, content, timestamp: s.messages.length, round, phase: 'day', visibility });
  say(s.players[0].name, '我是聆心者，昨夜听到马库斯是污秽的。', 1);
  say(s.players[1].name, '胡说，她在撒谎。', 1);
  say('某烙印者', '今晚杀诺拉', 1, 'marked');
  s.voteHistory = [{ from: s.players[1].name, target: s.players[0].name, round: 1 }];
  return s;
}
const innocent = (s: GameState) => s.players.find((p) => p.role === 'innocent')!;

describe('山庄档案 CLI', () => {
  it('log -g 能按关键词找到自称能力的话', () => {
    const s = game();
    expect(runCli('log -g 聆心者', innocent(s), s)).toContain('我是聆心者');
  });

  it('players 某人 列出他的发言和投票', () => {
    const s = game();
    const out = runCli(`players ${s.players[1].name.split('·')[0]}`, innocent(s), s);
    expect(out).toContain('胡说，她在撒谎。');
    expect(out).toContain(`第 1 回合投 ${s.players[0].name}`);
  });

  it('羔羊查不到烙印者的夜谈，烙印者能查到', () => {
    const s = game();
    expect(runCli('log -n all', innocent(s), s)).not.toContain('今晚杀诺拉');
    expect(runCli('private', s.players.find((p) => p.role === 'marked')!, s)).toContain('今晚杀诺拉');
  });

  it('未知命令返回帮助', () => {
    const s = game();
    expect(runCli('rm -rf /', innocent(s), s)).toContain('可用命令');
  });
});

describe('工具调用循环', () => {
  afterEach(() => vi.unstubAllGlobals());

  const respond = (message: object) => ({ ok: true, json: async () => ({ choices: [{ message }] }) });
  const call = (id: string, name: string, args: object) => ({ id, type: 'function', function: { name, arguments: JSON.stringify(args) } });

  it('先查档案，非法目标被打回，重交合法目标后返回', async () => {
    const s = game();
    const me = innocent(s);
    const legal = s.players.find((p) => p.isAlive && p !== me)!.name;
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(respond({ content: '', tool_calls: [call('a', 'cli', { command: 'votes' })] }))
      .mockResolvedValueOnce(respond({ content: '', tool_calls: [call('b', 'submit', { thinking: '想想', speech: '', target: me.name })] }))
      .mockResolvedValueOnce(respond({ content: '', tool_calls: [call('c', 'submit', { thinking: '想好了', speech: '', target: legal })] }));
    vi.stubGlobal('fetch', fetchMock);

    const reply = await getAIResponse(me, s, { apiKey: 'test' });
    expect(reply.target).toBe(legal);
    expect(reply.trace).toContain('$ votes');
    const third = JSON.parse(fetchMock.mock.calls[2][1].body as string) as { messages: { role: string; content: string }[] };
    expect(third.messages.at(-1)!.content).toContain('不合法');
  });
});
