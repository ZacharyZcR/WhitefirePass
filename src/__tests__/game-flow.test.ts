import { describe, expect, it, vi } from 'vitest';
import type { GameState, Player, Role } from '@/types/game';

// AI 随机做合法决定，只测流程推进
vi.mock('@/lib/deepseek', async () => {
  const { getLegalTargets } = await import('@/lib/actors');
  return {
    DEFAULT_API_URL: 'http://mock',
    buildPrompt: () => 'prompt',
    getBatchChoices: async (players: Player[], state: GameState) =>
      players.map((player) => {
        const targets = getLegalTargets(state, player);
        const target = targets ? targets[Math.floor(Math.random() * targets.length)].name : null;
        return { thinking: '…', speech: '就是你了。', target, trace: '', suspicion: [] };
      }),
    getAIResponse: async (player: Player, state: GameState) => {
      const targets = getLegalTargets(state, player);
      const target = targets ? targets[Math.floor(Math.random() * targets.length)].name : null;
      const others = state.players.filter((p) => p.isAlive && p !== player);
      const pick = others[Math.floor(Math.random() * others.length)];
      // 一半的发言会点名别人，走到插队回应
      const words = Math.random() < 0.5 ? `我怀疑${pick.name}。` : '我再听听。';
      return { thinking: '…', speech: target ? '' : words, target, trace: '', suspicion: [{ name: others[0].name, p: 60, why: '测试' }] };
    },
  };
});

const { useGameStore } = await import('@/stores/game-store');

const ROLES: Role[] = ['marked', 'marked', 'marked', 'heretic', 'listener', 'coroner', 'twin', 'twin', 'guard',
  'innocent', 'innocent', 'innocent', 'innocent', 'innocent', 'innocent'];

async function playOnce(setup: (s: GameState) => void = () => {}): Promise<GameState> {
  const store = useGameStore;
  store.getState().resetGame();
  store.getState().startGame({ playerCount: 15, roles: ROLES, enableWitch: false, enableHunter: false });
  setup(store.getState().gameState!);
  for (let step = 0; step < 2000; step++) {
    const s = store.getState().gameState!;
    if (s.phase === 'end') return s;
    while (store.getState().gameState?.cutscenes?.length) store.getState().finishCutscene(); // 固定过场
    if (store.getState().gameState?.pendingStateChanges?.length) store.getState().clearPendingStateChanges(); // 美德/堕落看完了
    await store.getState().executeNextStep();
    expect(store.getState().lastError).toBeNull();
  }
  throw new Error(`2000 步内没有结束，卡在 ${store.getState().gameState!.phase}/${store.getState().gameState!.nightPhase}`);
}

describe('整局流程', () => {
  it('随机决策下 20 局都能走到结局，并经过献祭后的事件', async () => {
    for (let i = 0; i < 20; i++) {
      const s = await playOnce();
      expect(s.winner).toBeDefined();
      expect(s.gameEvents.length).toBeGreaterThan(0);
      expect(s.messages.every((m) => m.round !== undefined)).toBe(true);
      // 第一日先开交流会再议事：白天至少两轮发言，交流会结束后才投票
      const day1 = s.messages.filter((m) => m.round === 1 && m.phase === 'day' && m.type === 'speech');
      expect(day1.length).toBeGreaterThanOrEqual(30);
      expect(s.isGathering).toBeFalsy();
      // 每天黄昏先讨论再投票：第一日傍晚有发言，而且都在第一张献祭石之前
      const dusk = s.messages.findIndex((m) => m.round === 1 && m.phase === 'voting' && m.type === 'speech');
      const stone = s.messages.findIndex((m) => m.round === 1 && m.type === 'vote');
      expect(dusk).toBeGreaterThanOrEqual(0);
      expect(dusk).toBeLessThan(stone);
      // 被点名的人会多开口：总有人在同一段议事里说了不止一次
      const turns = s.messages.filter((m) => m.segment).map((m) => `${m.segment}/${m.from}`);
      expect(new Set(turns).size).toBeLessThan(turns.length);
      // 献祭前留临终的话：被献祭的人先开口，一来一回，不超过八轮
      const farewell = s.messages.filter((m) => m.segment?.includes('|临终'));
      if (s.deathLog?.some((d) => d.cause === 'sacrifice')) expect(farewell.length).toBeGreaterThan(0);
      for (const seg of new Set(farewell.map((m) => m.segment))) expect(farewell.filter((m) => m.segment === seg).length).toBeLessThanOrEqual(8);
      // 聆心者听完还要对着结果说一句（第一天就被献祭了的话，一夜都没活到）
      if (s.listenerChecks.length) expect(s.messages.some((m) => m.visibility === 'listener' && m.type === 'speech' && !s.players.some((p) => p.name === m.content.trim()))).toBe(true);
    }
  }, 120000);

  it('设闩者死后夜晚照常结束', async () => {
    const s = await playOnce((g) => { g.players.find((p) => p.role === 'guard')!.isAlive = false; });
    expect(s.phase).toBe('end');
  }, 60000);
});
