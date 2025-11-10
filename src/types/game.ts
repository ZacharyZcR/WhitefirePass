/**
 * Core game type definitions for 白烬山口 (Whitefire Pass)
 */

/**
 * Player roles in the game
 */
export type Role =
  // 收割阵营 (Harvest faction)
  | 'marked'      // 烙印者 (The Marked) - 狼人
  | 'heretic'     // 背誓者 (The Heretic) - 背叛者
  // 羔羊阵营 (Lamb faction)
  | 'listener'    // 聆心者 (The Heart-Listener) - 预言家
  | 'coroner'     // 食灰者 (The Ash-Walker) - 验尸官
  | 'twin'        // 共誓者 (The Co-Sworn) - 双子
  | 'guard'       // 设闩者 (The Bar-Setter) - 守卫
  | 'innocent';   // 无知者 (The Unknowing) - 平民

/**
 * Game phases
 */
export type GamePhase = 'setup' | 'night' | 'day' | 'voting' | 'end';

/**
 * Night sub-phases
 */
export type NightPhase =
  | 'listener'          // 聆心者查验
  | 'marked-discuss'    // 烙印者讨论
  | 'marked-vote'       // 烙印者投票
  | 'guard'             // 设闩者守护
  | 'coroner';          // 食灰者验尸（在白天处决后的夜晚）

/**
 * Message types for different game events
 */
export type MessageType =
  | 'system'      // Game announcements
  | 'speech'      // Player speeches
  | 'action'      // Night actions
  | 'vote'        // Voting
  | 'death'       // Death announcements
  | 'prompt'      // AI prompt
  | 'thinking';   // AI thinking process

/**
 * Player interface - unified abstraction for AI and human players
 */
export interface Player {
  id: string;
  name: string;
  role: Role;
  isAlive: boolean;
  isAI: boolean;
  personality?: string;  // Optional personality prompt for AI players
}

/**
 * Message visibility - who can see this message
 */
export type MessageVisibility =
  | 'all'           // Everyone can see (day speech, voting, system)
  | 'marked'        // Only 烙印者 can see (night discussion)
  | 'listener'      // Only 聆心者 can see (check results)
  | 'coroner'       // Only 食灰者 can see (autopsy results)
  | 'guard'         // Only 设闩者 can see (guard actions)
  | 'twins'         // Only 共誓者 can see (twin communication)
  | { player: string };  // Only specific player can see

/**
 * Game message
 */
export interface Message {
  id: string;
  type: MessageType;
  from: string;  // player name or 'system'
  content: string;
  timestamp: number;
  round?: number;
  phase?: GamePhase;
  visibility: MessageVisibility;  // Who can see this message
}

/**
 * Vote record
 */
export interface Vote {
  from: string;
  target: string;
  round?: number;  // Which round this vote belongs to
}

/**
 * Night action (for seer, witch, etc.)
 */
export interface NightAction {
  playerId: string;
  action: 'check' | 'save' | 'poison';
  target?: string;
}

/**
 * 聆心者 check result
 */
export interface ListenerCheck {
  round: number;
  target: string;
  isClean: boolean;  // true = 清白（羔羊）, false = 污秽（烙印者/背誓者）
}

/**
 * 食灰者 autopsy result
 */
export interface CoronerReport {
  round: number;
  target: string;
  isClean: boolean;  // true = 清白（羔羊）, false = 污秽（烙印者/背誓者）
}

/**
 * 设闩者 guard record
 */
export interface GuardRecord {
  round: number;
  target: string;
}

/**
 * 共誓者配对信息
 */
export interface TwinPair {
  twin1: string;
  twin2: string;
}

/**
 * Game state - single source of truth
 */
export interface GameState {
  phase: GamePhase;
  nightPhase?: NightPhase;  // Sub-phase during night
  round: number;
  players: Player[];
  messages: Message[];
  votes: Vote[];  // Day voting (current round)
  nightVotes: Vote[];  // Night 烙印者 voting for kill (current round)
  nightActions: NightAction[];
  listenerChecks: ListenerCheck[];  // 聆心者's check history
  coronerReports: CoronerReport[];  // 食灰者's autopsy history
  guardRecords: GuardRecord[];  // 设闩者's guard history
  twinPair?: TwinPair;  // 共誓者配对（游戏开始时确定）
  lastGuardedPlayer?: string;  // 上一晚被守护的玩家（守卫不能连续守护同一人）
  lastSacrificedPlayer?: string;  // 上一轮白天被献祭的玩家（用于食灰者验尸）
  winner?: 'marked' | 'lamb';  // 收割 or 羔羊
  createdAt: number;
  lastUpdated: number;
  currentPlayerIndex: number; // Current player index for manual stepping
  waitingForNextStep: boolean; // Whether game is waiting for user to click next

  // Tie handling
  tiedPlayers: string[];  // Players involved in a tie
  isRevote: boolean;  // Whether currently in revote phase
  revoteRound: number;  // Number of revote rounds

  // Vote history for all rounds
  voteHistory: Vote[];  // All day votes with round numbers
  nightVoteHistory: Vote[];  // All night votes with round numbers
}

/**
 * Game configuration
 */
export interface GameConfig {
  playerCount: number;
  roles: Role[];
  enableWitch: boolean;
  enableHunter: boolean;
}

/**
 * Saved game for persistence
 */
export interface SavedGame {
  id: string;
  name: string;
  state: GameState;
  savedAt: number;
}
