/**
 * Core game type definitions for AI Werewolf
 */

/**
 * Player roles in the game
 */
export type Role = 'werewolf' | 'villager' | 'seer' | 'witch' | 'hunter';

/**
 * Game phases
 */
export type GamePhase = 'setup' | 'night' | 'day' | 'voting' | 'end';

/**
 * Night sub-phases
 */
export type NightPhase = 'seer' | 'werewolf-discuss' | 'werewolf-vote';

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
  | 'werewolf'      // Only werewolves can see (night discussion)
  | 'seer'          // Only seer can see (vision results)
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
 * Seer check result
 */
export interface SeerCheck {
  round: number;
  target: string;
  isGood: boolean;  // true = 好人阵营, false = 狼人阵营
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
  nightVotes: Vote[];  // Night werewolf voting for kill (current round)
  nightActions: NightAction[];
  seerChecks: SeerCheck[];  // Seer's check history
  winner?: 'werewolf' | 'villager';
  createdAt: number;
  lastUpdated: number;
  currentPlayerIndex: number; // Current player index for manual stepping
  waitingForNextStep: boolean; // Whether game is waiting for user to click next

  // Tie handling
  tiedPlayers: string[];  // Players involved in a tie
  isRevote: boolean;  // Whether currently in revote phase
  revoteRound: number;  // Number of revote rounds (for werewolves)

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
