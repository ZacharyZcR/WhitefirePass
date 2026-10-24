/**
 * Presentation tokens shared by game UI components.
 * 角色/阶段的显示名、色调，以及纯展示用的小工具函数。不含任何游戏逻辑。
 */

import type { GamePhase, GameState, NightPhase, Player, Role } from '@/types/game';

export interface RoleInfo {
  name: string;
  en: string;
  /** Sigil tone, used for small role marks only */
  color: string;
}

export const ROLE_INFO: Record<Role, RoleInfo> = {
  marked: { name: '烙印者', en: 'The Marked', color: '#c0605a' },
  heretic: { name: '背誓者', en: 'The Heretic', color: '#a39a8c' },
  listener: { name: '聆心者', en: 'The Listener', color: '#a99bd0' },
  coroner: { name: '食灰者', en: 'Ash-Walker', color: '#7fb3ad' },
  twin: { name: '共誓者', en: 'The Co-Sworn', color: '#8fbfa3' },
  guard: { name: '设闩者', en: 'Bar-Setter', color: '#d1ad6e' },
  innocent: { name: '无知者', en: 'The Unknowing', color: '#9fb6c8' },
};

export function roleInfo(role: string): RoleInfo {
  return ROLE_INFO[role as Role] ?? { name: role, en: '', color: '#9fb6c8' };
}

export const isHarvest = (role: string): boolean => role === 'marked' || role === 'heretic';

export const PHASE_NAME: Record<GamePhase, string> = {
  prologue: '序章',
  setup: '序章',
  day: '白昼议事',
  voting: '献祭投票',
  secret_meeting: '密会',
  event: '异事',
  night: '长夜',
  end: '终局',
};

export const NIGHT_PHASE_NAME: Record<NightPhase, string> = {
  listener: '聆心者查验',
  'marked-discuss': '烙印者密谋',
  'marked-vote': '烙印者择猎',
  guard: '设闩者守门',
  coroner: '食灰者验尸',
};

/** Night-toned scenes: deep blue + pale fire */
export const isNightScene = (phase: GamePhase): boolean =>
  phase === 'night' || phase === 'secret_meeting' || phase === 'end';

const HANZI = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];

/** 1 → 一, 12 → 十二, 25 → 二十五 */
export function toHanzi(n: number): string {
  if (n <= 10) return HANZI[n] ?? String(n);
  if (n < 20) return `十${HANZI[n - 10]}`;
  if (n < 100) return `${HANZI[Math.floor(n / 10)]}十${n % 10 ? HANZI[n % 10] : ''}`;
  return String(n);
}

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI'];
export const toRoman = (n: number): string => ROMAN[n - 1] ?? String(n);

/** Public asset path that survives the GitHub Pages basePath */
const BASE_PATH = process.env.NODE_ENV === 'production' ? '/WhitefirePass' : '';
export const assetPath = (path: string): string => `${BASE_PATH}${path}`;
export const portraitSrc = (name: string): string => assetPath(`/portraits/${encodeURIComponent(name)}.png`);

/**
 * Players who act in the current step — mirrors the selection in the store,
 * used only to show "next to act" and progress in the HUD.
 */
export function getActingPlayers(state: GameState): Player[] {
  const alive = state.players.filter((p) => p.isAlive);
  if (state.phase === 'night') {
    const roleFor: Partial<Record<NightPhase, Role>> = {
      listener: 'listener',
      'marked-discuss': 'marked',
      'marked-vote': 'marked',
      guard: 'guard',
    };
    const role = state.nightPhase && roleFor[state.nightPhase];
    return role ? alive.filter((p) => p.role === role) : alive;
  }
  if (state.phase === 'day' && state.isRevote && state.tiedPlayers.length > 0) {
    return alive.filter((p) => !state.tiedPlayers.includes(p.name));
  }
  return alive;
}

const SPEAKING_PHASES: GamePhase[] = ['day', 'voting', 'night'];

export function getNextActor(state: GameState): Player | undefined {
  if (!SPEAKING_PHASES.includes(state.phase)) return undefined;
  return getActingPlayers(state)[state.currentPlayerIndex];
}
