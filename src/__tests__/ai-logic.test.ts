import { describe, expect, it } from 'vitest';
import { createGame } from '@/lib/game-engine';
import { getActingPlayers, getLegalTargets } from '@/lib/actors';
import { buildPrompt } from '@/lib/deepseek';
import type { GameState, Role } from '@/types/game';

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

describe('行动顺序', () => {
  it('白天发言按回合轮转', () => {
    const s = game({ round: 3 });
    expect(getActingPlayers(s)[0].name).toBe(s.players[2].name);
  });

  it('设闩者死后夜里没有守门这一步，食灰者不会让全员行动', () => {
    const s = game({ phase: 'night', nightPhase: 'coroner' });
    expect(getActingPlayers(s)).toHaveLength(0);
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
    const s = game({ phase: 'voting', isRevote: true });
    s.tiedPlayers = [s.players[0].name, s.players[1].name];
    expect(getLegalTargets(s, s.players[5])!.map((p) => p.name)).toEqual(s.tiedPlayers);
  });

  it('白天发言不需要选人', () => {
    expect(getLegalTargets(game(), game().players[0])).toBeNull();
  });
});

describe('prompt', () => {
  it('聆心者在投票阶段也能看到自己的倾听结果', () => {
    const s = game({ phase: 'voting' });
    const target = byRole(s, 'marked');
    s.listenerChecks = [{ round: 1, target: target.name, isClean: false }];
    expect(buildPrompt(byRole(s, 'listener'), s)).toContain(`${target.name} —— 污秽`);
  });

  it('背誓者第 1 天以为自己是无知者，第 2 天才知道堕落', () => {
    const s = game({ round: 1 });
    expect(buildPrompt(byRole(s, 'heretic'), s)).toContain('你的真实身份：无知者');
    expect(buildPrompt(byRole(s, 'heretic'), { ...s, round: 2 })).toContain('你的真实身份：背誓者');
  });

  it('别人的私密消息和心里话不会出现在 prompt 里', () => {
    const s = game();
    const a = s.players.find((p) => p.role === 'innocent')!;
    const b = s.players.find((p) => p !== a)!;
    s.messages.push(
      { id: '1', type: 'thinking', from: b.name, content: 'B的秘密心声', timestamp: 0, round: 2, phase: 'day', visibility: { player: b.name } },
      { id: '2', type: 'speech', from: '某烙印者', content: '今晚杀谁', timestamp: 0, round: 2, phase: 'night', visibility: 'marked' },
    );
    const prompt = buildPrompt(a, s);
    expect(prompt).not.toContain('B的秘密心声');
    expect(prompt).not.toContain('今晚杀谁');
  });
});
