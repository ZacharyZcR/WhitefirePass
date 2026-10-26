import { describe, expect, it, vi } from 'vitest';
import type { GameState, Player, Role } from '@/types/game';

// AI 随机做合法决定，只测流程推进
vi.mock('@/lib/deepseek', async () => {
  const { getLegalTargets } = await import('@/lib/actors');
  return {
    DEFAULT_API_URL: 'http://mock',
    buildPrompt: () => 'prompt',
    getAIResponse: async (player: Player, state: GameState) => {
      const targets = getLegalTargets(state, player);
      const target = targets ? targets[Math.floor(Math.random() * targets.length)].name : null;
      const others = state.players.filter((p) => p.isAlive && p !== player);
      return { thinking: '…', speech: target ? '' : `${player.name}的发言`, target, trace: '', suspicion: [{ name: others[0].name, p: 60, why: '测试' }] };
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
    if (s.phase === 'secret_meeting') {
      const [a, b] = s.players.filter((p) => p.isAlive);
      store.getState().setSecretMeetingParticipants([a.name, b.name]);
      await store.getState().executeSecretMeeting();
    } else {
      await store.getState().executeNextStep();
    }
    expect(store.getState().lastError).toBeNull();
  }
  throw new Error(`2000 步内没有结束，卡在 ${store.getState().gameState!.phase}/${store.getState().gameState!.nightPhase}`);
}

describe('整局流程', () => {
  it('随机决策下 20 局都能走到结局，并经过献祭后的密会和事件', async () => {
    for (let i = 0; i < 20; i++) {
      const s = await playOnce();
      expect(s.winner).toBeDefined();
      expect(s.secretMeetings.some((m) => m.timing === 'after_sacrifice')).toBe(true);
      expect(s.messages.every((m) => m.round !== undefined)).toBe(true);
    }
  }, 120000);

  it('设闩者死后夜晚照常结束', async () => {
    const s = await playOnce((g) => { g.players.find((p) => p.role === 'guard')!.isAlive = false; });
    expect(s.phase).toBe('end');
  }, 60000);
});
