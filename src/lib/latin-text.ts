/**
 * Latin/English text library for mystical atmosphere
 * 拉丁语/英文文本库 - 提升神秘感和美感
 */

/**
 * Role mottos in Latin - Each role has a unique motto
 * 角色拉丁文座右铭
 */
export const ROLE_MOTTOS = {
  marked: {
    latin: 'Ignis Aeterna',
    english: 'Eternal Flame',
    chinese: '永恒之火',
  },
  heretic: {
    latin: 'Fides Fracta',
    english: 'Broken Faith',
    chinese: '破碎的信仰',
  },
  listener: {
    latin: 'Veritas Occulta',
    english: 'Hidden Truth',
    chinese: '隐藏的真相',
  },
  coroner: {
    latin: 'Memento Mori',
    english: 'Remember Death',
    chinese: '勿忘死亡',
  },
  twin: {
    latin: 'Unus Animus',
    english: 'One Soul',
    chinese: '同一灵魂',
  },
  guard: {
    latin: 'Custodes Noctis',
    english: 'Night Guardian',
    chinese: '夜之守护',
  },
  innocent: {
    latin: 'Spes Ultima',
    english: 'Final Hope',
    chinese: '最后的希望',
  },
} as const;

/**
 * Phase labels in Latin - Poetic translations
 * 阶段拉丁文标签
 */
export const PHASE_LABELS = {
  prologue: {
    latin: 'Initium',
    english: 'PROLOGUE',
    subtitle: 'The Beginning',
  },
  setup: {
    latin: 'Praeparatio',
    english: 'SETUP',
    subtitle: 'Preparation',
  },
  day: {
    latin: 'Dies Lucis',
    english: 'DAY',
    subtitle: 'Day of Light',
  },
  night: {
    latin: 'Nox Aeterna',
    english: 'NIGHT',
    subtitle: 'Eternal Night',
  },
  voting: {
    latin: 'Sacrificium',
    english: 'VOTING',
    subtitle: 'The Sacrifice',
  },
  event: {
    latin: 'Eventus Arcanus',
    english: 'EVENT',
    subtitle: 'Mystical Event',
  },
  end: {
    latin: 'Finis',
    english: 'END',
    subtitle: 'The End',
  },
} as const;

/**
 * UI section titles with Latin subtitles
 * UI区域标题的拉丁文副标题
 */
export const SECTION_TITLES = {
  gameLog: {
    title: '游戏日志',
    latin: 'Chronicon Ludi',
    english: 'CHRONICLE',
  },
  travelers: {
    title: '旅者',
    latin: 'Viatores',
    english: 'TRAVELERS',
  },
  factionStats: {
    title: '阵营',
    latin: 'Factiones',
    english: 'FACTIONS',
  },
  votingProgress: {
    title: '投票进度',
    latin: 'Progressio Suffragii',
    english: 'VOTING PROGRESS',
  },
  clues: {
    title: '线索',
    latin: 'Indicia',
    english: 'CLUES',
  },
  gameControl: {
    title: '游戏控制',
    latin: 'Imperium Ludi',
    english: 'GAME CONTROL',
  },
  personalityEditor: {
    title: '旅者详情',
    latin: 'Personae',
    english: 'TRAVELER DETAILS',
  },
  gameGuide: {
    title: '游戏说明',
    latin: 'Liber Regum',
    english: 'GAME GUIDE',
  },
  promptViewer: {
    title: '神谕指引',
    latin: 'Oraculum',
    english: 'DIVINE GUIDANCE',
  },
} as const;

/**
 * Button labels with Latin/English
 * 按钮的拉丁文/英文标签
 */
export const BUTTON_LABELS = {
  nextStep: {
    title: '下一步',
    latin: 'Procedere',
    english: 'NEXT',
  },
  startGame: {
    title: '开始游戏',
    latin: 'Incipere',
    english: 'START',
  },
  resetGame: {
    title: '重置游戏',
    latin: 'Renovare',
    english: 'RESET',
  },
  retry: {
    title: '重试',
    latin: 'Iterare',
    english: 'RETRY',
  },
  autoExecute: {
    title: '自动执行',
    latin: 'Automatice',
    english: 'AUTO',
  },
  secretMeeting: {
    title: '发起密会',
    latin: 'Concilium',
    english: 'MEETING',
  },
  saveGame: {
    title: '保存游戏',
    latin: 'Servare',
    english: 'SAVE',
  },
} as const;

/**
 * Decorative Latin quotes for atmosphere
 * 装饰性拉丁文引用
 */
export const DECORATIVE_QUOTES = {
  mountain: 'Mons Cineris Albi',  // 白烬山口
  lodge: 'Villa Silentii',  // 寂静山庄
  contract: 'Foedus Montis',  // 山灵契约
  sacrifice: 'Holocaustum',  // 献祭
  harvest: 'Messis Animarum',  // 灵魂收割
  lamb: 'Agnus Innocens',  // 无辜羔羊
  truth: 'Veritas Lux Mea',  // 真相即光明
  death: 'Mors Certa, Hora Incerta',  // 死亡确定，时刻不定
  fate: 'Fatum Nos Iunget',  // 命运将我们联结
  darkness: 'In Tenebris Lux',  // 黑暗中的光
} as const;

/**
 * Message type labels
 * 消息类型标签
 */
export const MESSAGE_TYPE_LABELS = {
  system: {
    chinese: '叙述者',
    latin: 'Narrator',
    english: 'NARRATOR',
  },
  speech: {
    chinese: '发言',
    latin: 'Oratio',
    english: 'SPEECH',
  },
  thinking: {
    chinese: '思考',
    latin: 'Cogitatio',
    english: 'THINKING',
  },
  action: {
    chinese: '行动',
    latin: 'Actio',
    english: 'ACTION',
  },
  vote: {
    chinese: '投票',
    latin: 'Suffragium',
    english: 'VOTE',
  },
  death: {
    chinese: '死亡',
    latin: 'Mors',
    english: 'DEATH',
  },
  secret: {
    chinese: '密会',
    latin: 'Secretum',
    english: 'SECRET',
  },
} as const;

/**
 * Faction labels
 * 阵营标签
 */
export const FACTION_LABELS = {
  harvest: {
    chinese: '收割阵营',
    latin: 'Factio Messorum',
    english: 'HARVEST FACTION',
  },
  lamb: {
    chinese: '羔羊阵营',
    latin: 'Factio Agnorum',
    english: 'LAMB FACTION',
  },
} as const;

/**
 * Status labels
 * 状态标签
 */
export const STATUS_LABELS = {
  alive: {
    chinese: '存活',
    latin: 'Vivus',
    english: 'ALIVE',
  },
  dead: {
    chinese: '已死亡',
    latin: 'Mortuus',
    english: 'DECEASED',
  },
  running: {
    chinese: '运行中',
    latin: 'In Cursu',
    english: 'RUNNING',
  },
  paused: {
    chinese: '已暂停',
    latin: 'Pausa',
    english: 'PAUSED',
  },
} as const;

/**
 * Time labels
 * 时间标签
 */
export const TIME_LABELS = {
  round: {
    chinese: '回合',
    latin: 'Circulus',
    english: 'ROUND',
  },
  day: {
    chinese: '天',
    latin: 'Dies',
    english: 'DAY',
  },
  night: {
    chinese: '夜',
    latin: 'Nox',
    english: 'NIGHT',
  },
} as const;
