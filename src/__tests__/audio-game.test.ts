import { describe, expect, it, vi } from 'vitest';
import type { GameState, Player, Role } from '@/types/game';
import { cuesFor, snapshot, type Cue } from '@/lib/audio/cues';

// AI 随机做合法决定（同 game-flow.test.ts），整局跑下来看每一步出什么声音
vi.mock('@/lib/deepseek', async () => {
  const { getLegalTargets } = await import('@/lib/actors');
  const pick = (state: GameState, player: Player) => {
    const targets = getLegalTargets(state, player);
    return targets ? targets[Math.floor(Math.random() * targets.length)].name : null;
  };
  return {
    DEFAULT_API_URL: 'http://mock',
    buildPrompt: () => 'prompt',
    getBatchChoices: async (players: Player[], state: GameState) =>
      players.map((player) => ({ thinking: '…', speech: '就是你了。', target: pick(state, player), trace: '', suspicion: [] })),
    getAIResponse: async (player: Player, state: GameState) => {
      const target = pick(state, player);
      const others = state.players.filter((p) => p.isAlive && p !== player);
      return { thinking: '…', speech: target ? '' : `${player.name}的发言`, target, trace: '', suspicion: [{ name: others[0].name, p: 60, why: '测试' }] };
    },
  };
});

const { useGameStore } = await import('@/stores/game-store');

const ROLES: Role[] = ['marked', 'marked', 'marked', 'heretic', 'listener', 'coroner', 'twin', 'twin', 'guard',
  'innocent', 'innocent', 'innocent', 'innocent', 'innocent', 'innocent'];

const label = (c: Cue) =>
  c.kind === 'sfx' ? `音效:${c.key}${c.delay ? `+${c.delay}` : ''}` : `${c.speaker}:${c.event}${c.sting ? `[${c.sting}]` : ''}${c.delay ? `+${c.delay}` : ''}`;

async function playAndListen(): Promise<{ phase: string; cues: Cue[] }[]> {
  const store = useGameStore;
  store.getState().resetGame();
  store.getState().startGame({ playerCount: 15, roles: ROLES, enableWitch: false, enableHunter: false });
  const log: { phase: string; cues: Cue[] }[] = [];
  let seen = snapshot(store.getState().gameState!);
  for (let step = 0; step < 2000; step++) {
    const s = store.getState().gameState!;
    if (s.phase === 'end') return log;
    while (store.getState().gameState?.cutscenes?.length) store.getState().finishCutscene(); // 固定过场
    if (store.getState().gameState?.pendingStateChanges?.length) store.getState().clearPendingStateChanges(); // 美德/堕落看完了
    await store.getState().executeNextStep();
    const next = store.getState().gameState!;
    log.push({ phase: `${seen.phase}→${next.phase}/${next.nightPhase ?? ''}`, cues: cuesFor(seen, next, false) });
    seen = snapshot(next);
  }
  throw new Error('2000 步内没有结束');
}

describe('整局音频', () => {
  it('不开上帝视角不出密谈，每步语音不超过队列上限，离开夜晚先敲钟再由旁白讲死讯', async () => {
    for (let i = 0; i < 5; i++) {
      const log = await playAndListen();
      const all = log.flatMap((l) => l.cues);
      expect(all.some((c) => c.kind === 'voice' && c.event === 'whisper')).toBe(false);
      for (const l of log) expect(l.cues.filter((c) => c.kind === 'voice').length).toBeLessThanOrEqual(4);

      const dawns = log.filter((l) => l.phase.startsWith('night→') && !l.phase.startsWith('night→night'));
      expect(dawns.length).toBeGreaterThan(0);
      for (const d of dawns) {
        expect(d.cues[0]).toEqual({ kind: 'sfx', key: 'bell' });
        expect(d.cues.some((c) => c.kind === 'voice' && c.speaker === '叙述者')).toBe(true);
      }
      if (i === 0) for (const d of dawns) console.log(d.phase, d.cues.map(label).join(' → '));
    }
  });
});
