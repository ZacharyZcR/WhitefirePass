import { describe, expect, it } from 'vitest';
import type { GameState, Message, Role } from '@/types/game';
import { addMessage, createGame } from '@/lib/game-engine';
import { ambientFor, cuesFor, snapshot, speechEvent } from '@/lib/audio/cues';

const ROLES: Role[] = ['marked', 'marked', 'marked', 'heretic', 'listener', 'coroner', 'twin', 'twin', 'guard',
  'innocent', 'innocent', 'innocent', 'innocent', 'innocent', 'innocent'];

function game(phase: GameState['phase'] = 'day'): GameState {
  const s = createGame({ playerCount: 15, roles: ROLES, enableWitch: false, enableHunter: false });
  s.phase = phase;
  return s;
}

const say = (s: GameState, from: string, content: string, type: Message['type'] = 'speech', vis: Message['visibility'] = 'all') =>
  s.messages.push(addMessage(s, from, content, type, vis));

describe('audio cues', () => {
  it('classifies public speech', () => {
    expect(speechEvent('我不是烙印者，相信我')).toBe('defend');
    expect(speechEvent('我怀疑诺拉在撒谎')).toBe('accuse');
    expect(speechEvent('昨夜风很大')).toBe('speak');
  });

  it('固定过场播放时不出声，全部播完山灵才宣布开始', () => {
    const s = game('prologue');
    const before = snapshot(s);
    Object.assign(s, { phase: 'day', round: 1, cutscenes: ['chosen', 'dayseven'] });
    expect(cuesFor(before, s, true)).toEqual([]);
    const mid = snapshot(s);
    s.cutscenes = ['dayseven'];
    expect(cuesFor(mid, s, true)).toEqual([]);
    const last = snapshot(s);
    s.cutscenes = [];
    expect(cuesFor(last, s, true)).toEqual([{ kind: 'voice', speaker: '山灵', event: 'start' }]);
  });

  it('voices a public speech by its speaker', () => {
    const s = game();
    const before = snapshot(s);
    say(s, s.players[0].name, '我怀疑你');
    expect(cuesFor(before, s, false)).toEqual([{ kind: 'voice', speaker: s.players[0].name, event: 'accuse' }]);
  });

  it('keeps private talk silent without god view', () => {
    const s = game('night');
    const marked = s.players.find((p) => p.role === 'marked')!;
    const victim = s.players.find((p) => p.role === 'innocent')!;
    const before = snapshot(s);
    say(s, marked.name, '今晚动手', 'speech', 'marked');
    expect(cuesFor(before, s, false)).toEqual([]);
    expect(cuesFor(before, s, true)).toEqual([{ kind: 'voice', speaker: marked.name, event: 'whisper' }]);

    const beforePick = snapshot(s);
    say(s, marked.name, victim.name, 'speech', 'marked');
    expect(cuesFor(beforePick, s, false)).toEqual([{ kind: 'sfx', key: 'heartbeat' }]);
  });

  it('lets the spirit whisper to the chosen and the fallen only in god view', () => {
    const s = game('night');
    const marked = s.players.find((p) => p.role === 'marked')!;
    const heretic = s.players.find((p) => p.role === 'heretic')!;
    const before = snapshot(s);
    say(s, '山灵', '你听见了。', 'system', { player: marked.name });
    expect(cuesFor(before, s, false)).toEqual([]);
    expect(cuesFor(before, s, true)).toEqual([{ kind: 'voice', speaker: '山灵', event: 'marked_whisper' }]);

    const dawn = snapshot(s);
    say(s, '山灵', '【灵魂的堕落】昨夜……', 'system', { player: heretic.name });
    say(s, '山灵', '你听见了。', 'system', { player: heretic.name });
    say(s, '山灵', '【暗语】背誓者已经出现。', 'system', 'marked');
    expect(cuesFor(dawn, s, false)).toEqual([]);
    expect(cuesFor(dawn, s, true)).toEqual([{ kind: 'voice', speaker: '山灵', event: 'fall', sting: 'vice' }]);
  });

  it('announces a night death at dawn instead of the spirit', () => {
    const s = game('night');
    const before = snapshot(s);
    s.phase = 'day';
    s.deathLog = [{ name: s.players[3].name, round: 1, cause: 'night' }];
    expect(cuesFor(before, s, false)).toEqual([
      { kind: 'sfx', key: 'bell' },
      { kind: 'voice', speaker: s.players[3].name, event: 'killed', sting: 'body', delay: 1500 },
      { kind: 'voice', speaker: '叙述者', event: 'night_death' },
    ]);
  });

  it('narrates a quiet dawn', () => {
    const s = game('night');
    const before = snapshot(s);
    s.phase = 'day';
    expect(cuesFor(before, s, false)).toEqual([
      { kind: 'sfx', key: 'bell' },
      { kind: 'voice', speaker: '叙述者', event: 'no_death', delay: 1500 },
    ]);
  });

  it('voices the first emotional change, a tie and an event', () => {
    const s = game('day');
    const before = snapshot(s);
    s.pendingStateChanges.push({ character: '莉迪亚·克劳利', triggerCharacter: '托马斯·克劳利', relationshipType: 'sibling', newState: 'vice', reason: '' });
    s.isRevote = true;
    s.gameEvents.push({ round: 1, eventId: 'musical_evening', title: '', description: '', participants: [], effects: [], type: 'positive' });
    expect(cuesFor(before, s, false)).toEqual([
      { kind: 'voice', speaker: '莉迪亚·克劳利', event: 'vice', sting: 'vice' },
      { kind: 'voice', speaker: '叙述者', event: 'tie', sting: 'murmur' },
      { kind: 'sfx', key: 'piano' },
    ]);
  });

  it('lets a surviving harvester speak when the marked win', () => {
    const s = game('voting');
    const before = snapshot(s);
    s.phase = 'end';
    s.winner = 'marked';
    const marked = s.players.find((p) => p.role === 'marked')!;
    expect(cuesFor(before, s, false)).toEqual([
      { kind: 'voice', speaker: '叙述者', event: 'end_marked' },
      { kind: 'voice', speaker: marked.name, event: 'harvest' },
    ]);
  });

  it('thins out a parallel vote batch', () => {
    const s = game('voting');
    const before = snapshot(s);
    s.players.slice(0, 12).forEach((p) => say(s, p.name, s.players[14].name, 'vote'));
    const cues = cuesFor(before, s, false);
    expect(cues.filter((c) => c.kind === 'sfx')).toHaveLength(5);
    expect(cues.filter((c) => c.kind === 'voice')).toHaveLength(2);
  });

  it('plays nothing across games', () => {
    const before = snapshot(game());
    expect(cuesFor(before, { ...game('night'), createdAt: before.createdAt + 1 }, true)).toEqual([]);
  });

  it('stops the blizzard when the lambs win', () => {
    const s = game('end');
    s.winner = 'lamb';
    expect(ambientFor(s)).toEqual([]);
    expect(ambientFor(game('night'))).toEqual(['amb_night']);
  });
});
