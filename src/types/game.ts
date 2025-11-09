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
}

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
}

/**
 * Vote record
 */
export interface Vote {
  from: string;
  target: string;
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
 * Game state - single source of truth
 */
export interface GameState {
  phase: GamePhase;
  round: number;
  players: Player[];
  messages: Message[];
  votes: Vote[];
  nightActions: NightAction[];
  winner?: 'werewolf' | 'villager';
  createdAt: number;
  lastUpdated: number;
  currentPlayerIndex: number; // Current player index for manual stepping
  waitingForNextStep: boolean; // Whether game is waiting for user to click next
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
