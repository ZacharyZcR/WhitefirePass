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
export type GamePhase = 'prologue' | 'setup' | 'night' | 'day' | 'event' | 'voting' | 'end';

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
  | 'thinking'    // AI thinking process
  | 'event';      // Game event

/**
 * Player interface - unified abstraction for AI and human players
 */
/**
 * Emotional state - represents character's psychological condition
 */
export type EmotionalState =
  | 'normal'      // 正常状态
  | 'virtue'      // 美德激发 - 变得更理智和强大
  | 'vice';       // 罪恶堕落 - 被压力压垮

/**
 * Relationship type between characters
 */
export type RelationshipType =
  | 'sibling'     // 兄妹
  | 'lover'       // 恋人/前恋人
  | 'crush'       // 单恋
  | 'rival'       // 情敌/仇敌
  | 'debtor'      // 债务关系
  | 'acquaintance'; // 旧识

/**
 * Character relationship definition (directed: character's feeling toward target)
 */
export interface CharacterRelationship {
  character: string;  // Character name
  target: string;     // Related character name
  type: RelationshipType;
  label?: string;     // 这条关系本身的名字（可选，没有时显示关系类型）
  known?: string;     // 开局时他对这个人知道什么、怎么看（第二人称，写进他的开场 prompt）
  virtueChance: number;  // 0-1: Probability of triggering virtue (美德)
  viceChance: number;    // 0-1: Probability of triggering vice (罪恶)
  // Note: virtueChance + viceChance can be < 1, remaining = stay normal
}

export interface Player {
  id: string;
  name: string;
  englishName?: string;  // English name for display
  role: Role;
  isAlive: boolean;
  isAI: boolean;
  personality?: string;  // Optional personality prompt for AI players
  emotionalState?: EmotionalState;  // Current emotional state
  // Character basic info
  age?: number;
  gender?: '男性' | '女性';
  occupation?: string;
  trait?: string;  // Character trait/personality tag
  height?: string;
  bloodType?: string;
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
  quote?: string;  // 投票、选人时说出口的那句话（content 仍是目标名字）
  segment?: string;  // 白天发言属于哪一段议事（见 actors.segmentKey），发言队列从这里重建
}

/**
 * Vote record
 */
/** 固定过场：第三夜（三人被选中）、第七天（吵到决定献祭） */
export type Cutscene = 'chosen' | 'dayseven';

/** 死后情绪变了、要开口说一句的人 */
export interface Mourner {
  name: string;
  dead: string;
  cause: 'sacrifice' | 'night';
}

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
 * Emotional state change event
 */
export interface EmotionalStateChange {
  character: string;      // Character who changes state
  triggerCharacter: string; // Character whose death triggered this
  relationshipType: RelationshipType;
  relationshipLabel?: string;
  newState: EmotionalState;
  reason: string;         // Description of why this happened
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

  // Story progression (for setup phase)
  storyProgress?: number;  // 0-5: Track which story message to show next (0=not started)

  // Emotional state changes
  pendingStateChanges: EmotionalStateChange[];  // Queue of state changes to show to user

  // Game events
  gameEvents: GameEventRecord[];  // History of all game events

  deathLog?: DeathRecord[];
  isGathering?: boolean;  // 第一日正式议事前的自我介绍：每人按座次说一轮，不投票
  ballot?: boolean;
  lastWords?: string;  // 献祭石定下来、还没推进白火的那个人：先留他几句临终的话
  mourners?: Mourner[];  // 有人死后情绪变了的人：每人说一句，说完才往下走
  cutscenes?: Cutscene[];  // 还没播的固定过场，按顺序播完才往下走（新局才有；旧存档没有这个字段，不播）  // 傍晚的讨论结束、献祭石已经发下去：此时的 voting 才是真正投票
  suspicions?: Record<string, SuspicionEntry[]>;  // 每个角色最近一次给出的怀疑名单
}

/**
 * 一个角色对另一个人的判断：是收割者的可能性（0~100）和理由
 */
export interface SuspicionEntry {
  name: string;
  p: number;
  why: string;
}

/**
 * 死亡记录：第几回合，夜里被收割还是白天被献祭
 */
export interface DeathRecord {
  name: string;
  round: number;
  cause: 'night' | 'sacrifice';
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

/**
 * Clue category types
 */
export type ClueCategory = 'letter' | 'note' | 'diary' | 'document' | 'artifact';

/**
 * Clue/Document interface for the investigation panel
 */
export interface Clue {
  id: string;
  title: string;
  category: ClueCategory;
  description: string;  // Short preview text
  date?: string;  // Optional date stamp
  icon?: string;  // Icon identifier
  unlockedAt: number;  // Timestamp when unlocked
  isRead: boolean;  // Whether user has read this clue
  content: Array<{
    date?: string;
    text: string;
  }>;  // Full content (supports multi-page like diary)
}

/**
 * Game event record
 */
export interface GameEventRecord {
  round: number;
  eventId: string;
  title: string;
  description: string;
  participants: string[];
  effects: string[];
  type: 'positive' | 'negative' | 'neutral';
}
