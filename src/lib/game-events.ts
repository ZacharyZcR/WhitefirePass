/**
 * Game events system - random events that occur during the game
 * Events affect relationships between characters
 */

export type EventType = 'positive' | 'negative' | 'neutral';

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  participantCount: number; // 3-5 participants
  type: EventType;
  effects: string[]; // Descriptions of relationship changes
}

/**
 * Pool of game events
 * Events are designed to create drama and change relationships
 */
export const GAME_EVENTS: GameEvent[] = [
  // Positive events (3 participants)
  {
    id: 'shared_meal',
    title: '共享晚餐',
    description: '{0}、{1}和{2}在厨房发现了一些保存完好的食物。他们一起准备了一顿简单的晚餐，在烛光下分享食物和故事。这短暂的温暖让他们之间的距离拉近了。',
    participantCount: 3,
    type: 'positive',
    effects: ['{0}和{1}的关系变得更加亲近', '{1}和{2}的关系变得更加亲近', '{0}和{2}的关系变得更加亲近'],
  },
  {
    id: 'rescue',
    title: '危险救援',
    description: '{0}在山口边缘失足滑倒，{1}和{2}冒着危险将其拉了回来。生死一线的经历让三人之间建立了深厚的信任。',
    participantCount: 3,
    type: 'positive',
    effects: ['{0}对{1}和{2}心怀感激', '{1}和{2}因共同救人而关系加深'],
  },
  {
    id: 'old_story',
    title: '往事回忆',
    description: '深夜的炉火旁，{0}、{1}和{2}分享了各自的往事。{0}讲述了童年的温暖回忆，{1}谈到了失去的挚爱，{2}坦诚了内心的恐惧。真诚的倾诉让他们彼此理解。',
    participantCount: 3,
    type: 'positive',
    effects: ['{0}、{1}、{2}之间建立了更深的理解和信任'],
  },

  // Positive events (4 participants)
  {
    id: 'card_game',
    title: '纸牌游戏',
    description: '{0}、{1}、{2}和{3}在阁楼找到了一副旧纸牌，决定玩几局来放松紧张的神经。游戏中的欢声笑语让他们暂时忘记了恐惧。',
    participantCount: 4,
    type: 'positive',
    effects: ['{0}、{1}、{2}、{3}之间的气氛变得更加轻松', '短暂的欢乐让四人关系改善'],
  },
  {
    id: 'shelter_repair',
    title: '修缮避难所',
    description: '暴风雪来临前，{0}、{1}、{2}和{3}合力修复了破损的窗户和屋顶。他们分工合作，{0}负责搬运木材，{1}负责钉钉子，{2}和{3}负责封堵缝隙。共同的劳动让他们成为了更紧密的团队。',
    participantCount: 4,
    type: 'positive',
    effects: ['{0}、{1}、{2}、{3}因共同劳动而建立默契', '团队协作让四人关系加深'],
  },
  {
    id: 'musical_evening',
    title: '音乐之夜',
    description: '{0}在旧钢琴上弹奏了一首曲子，{1}跟着哼唱，{2}和{3}安静地聆听。音乐的力量抚慰了疲惫的心灵，让四人在这个死亡笼罩的地方找到了片刻的美好。',
    participantCount: 4,
    type: 'positive',
    effects: ['{0}、{1}、{2}、{3}通过音乐产生共鸣', '艺术的力量让四人关系升华'],
  },

  // Positive events (5 participants)
  {
    id: 'group_prayer',
    title: '集体祈祷',
    description: '{0}提议进行一次祈祷，{1}、{2}、{3}和{4}虽然信仰不同，但都加入了这个仪式。在烛光和低语中，五人感受到了某种超越个体的联系。',
    participantCount: 5,
    type: 'positive',
    effects: ['{0}、{1}、{2}、{3}、{4}因共同的信念而团结', '精神上的共鸣让五人关系加深'],
  },
  {
    id: 'supply_discovery',
    title: '物资发现',
    description: '{0}、{1}、{2}、{3}和{4}在地窖发现了一批隐藏的补给品——罐头食品、毯子和医疗用品。五人决定公平分配这些宝贵的资源，这个决定让他们对彼此的信任加深。',
    participantCount: 5,
    type: 'positive',
    effects: ['{0}、{1}、{2}、{3}、{4}因公平分配而建立信任', '共同的发现让五人成为盟友'],
  },

  // Negative events (3 participants)
  {
    id: 'food_theft',
    title: '食物失窃',
    description: '{0}发现自己藏的食物不见了，{1}被看到从那个区域离开，{2}试图为{1}辩护。指控、怀疑和争吵让三人之间产生了裂痕。',
    participantCount: 3,
    type: 'negative',
    effects: ['{0}怀疑{1}偷了食物，关系恶化', '{0}和{2}因立场不同而产生矛盾', '{1}感到被冤枉，对{0}产生敌意'],
  },
  {
    id: 'blame_game',
    title: '相互指责',
    description: '{0}、{1}和{2}因为一个决策失误而陷入激烈的争吵。{0}指责{1}的鲁莽，{1}反驳{0}的懦弱，{2}试图调解却被两人同时攻击。冲突让三人关系跌至冰点。',
    participantCount: 3,
    type: 'negative',
    effects: ['{0}和{1}之间产生深刻的矛盾', '{2}感到被孤立，对{0}和{1}都产生不满'],
  },
  {
    id: 'secret_exposed',
    title: '秘密揭露',
    description: '{0}无意中听到{1}和{2}在背后议论自己。那些尖刻的评价和嘲笑刺痛了{0}的心。信任被打破，友谊出现裂痕。',
    participantCount: 3,
    type: 'negative',
    effects: ['{0}对{1}和{2}失去信任', '{1}和{2}感到尴尬和愧疚，但关系已经破裂'],
  },
  {
    id: 'jealousy',
    title: '嫉妒之火',
    description: '{0}注意到{1}和{2}之间的亲密关系，心中涌起强烈的嫉妒。{0}开始故意疏远{1}，并对{2}表现出敌意。这种微妙的情感让三人之间充满紧张。',
    participantCount: 3,
    type: 'negative',
    effects: ['{0}嫉妒{1}和{2}的关系', '{1}感到困惑和不安', '{2}意识到{0}的敌意'],
  },

  // Negative events (4 participants)
  {
    id: 'alliance_betrayal',
    title: '联盟背叛',
    description: '{0}和{1}原本结成联盟，但{1}背地里却和{2}、{3}达成了新的协议。当{0}发现真相时，感到深深的背叛。四人之间的信任彻底崩塌。',
    participantCount: 4,
    type: 'negative',
    effects: ['{0}对{1}的背叛感到愤怒', '{1}、{2}、{3}结成新联盟，孤立{0}', '{0}发誓报复'],
  },
  {
    id: 'resource_conflict',
    title: '资源冲突',
    description: '只剩下一条毯子，但{0}、{1}、{2}和{3}都需要它来抵御寒冷。四人争吵不休，甚至差点动手。最后{0}强行夺走了毯子，留下其他三人在寒冷中愤怒地瞪着{0}。',
    participantCount: 4,
    type: 'negative',
    effects: ['{0}因自私的行为被其他三人敌视', '{1}、{2}、{3}对{0}产生共同的敌意'],
  },
  {
    id: 'rumor_spread',
    title: '谣言传播',
    description: '{0}向{1}透露了关于{2}的一个秘密，{1}又告诉了{3}。当{2}发现这个秘密已经传开时，愤怒地质问众人。谎言和背叛让四人关系破裂。',
    participantCount: 4,
    type: 'negative',
    effects: ['{2}对{0}的泄密感到愤怒', '{2}对{1}和{3}的传播感到背叛', '{0}、{1}、{3}感到愧疚但关系已无法修复'],
  },

  // Negative events (5 participants)
  {
    id: 'group_division',
    title: '群体分裂',
    description: '{0}和{1}提议一个计划，但{2}、{3}和{4}坚决反对。争论升级为冲突，双方互相指责对方会害死所有人。最终群体分裂成两个敌对的阵营。',
    participantCount: 5,
    type: 'negative',
    effects: ['{0}和{1}结成联盟，对抗其他人', '{2}、{3}、{4}结成联盟，与{0}和{1}对立', '五人之间的裂痕可能无法弥合'],
  },
  {
    id: 'scapegoat',
    title: '替罪羊',
    description: '一个灾难性的事件发生了，{0}成为了众人的替罪羊。{1}、{2}、{3}和{4}虽然知道这不完全是{0}的错，但都默许了这种指责，因为这样可以转移自己的责任。{0}被彻底孤立。',
    participantCount: 5,
    type: 'negative',
    effects: ['{0}被其他四人孤立和指责', '{1}、{2}、{3}、{4}因共同的谎言而相互绑定', '{0}对所有人失去信任'],
  },

  // Neutral events (3 participants)
  {
    id: 'philosophical_debate',
    title: '哲学辩论',
    description: '{0}、{1}和{2}围绕生死和道德展开了一场深刻的辩论。{0}持理性主义观点，{1}相信信仰的力量，{2}则认为一切都是虚无。三人谁也说服不了谁，但这场对话让他们对彼此有了更深的了解。',
    participantCount: 3,
    type: 'neutral',
    effects: ['{0}、{1}、{2}之间产生了思想上的碰撞', '虽然观点不同，但三人对彼此的理解加深'],
  },
  {
    id: 'dream_sharing',
    title: '梦境分享',
    description: '{0}、{1}和{2}都做了奇怪的梦。{0}梦到了死去的亲人，{1}梦到了燃烧的森林，{2}梦到了无尽的雪原。三人分享梦境时，发现它们之间似乎存在某种联系，但又说不清具体是什么。',
    participantCount: 3,
    type: 'neutral',
    effects: ['{0}、{1}、{2}因神秘的梦境而产生特殊的联系', '三人开始怀疑白烬山口是否有超自然力量'],
  },

  // Neutral events (4 participants)
  {
    id: 'exploration',
    title: '探索发现',
    description: '{0}、{1}、{2}和{3}一起探索了庄园的一个废弃区域。他们发现了奇怪的符号、旧信件和一本神秘的日记。这些发现让他们对白烬山口的历史有了更多了解，但也带来了更多疑问。',
    participantCount: 4,
    type: 'neutral',
    effects: ['{0}、{1}、{2}、{3}共同掌握了一些秘密信息', '四人之间形成了信息联盟'],
  },
  {
    id: 'skill_exchange',
    title: '技能交换',
    description: '{0}教{1}如何生火，{2}教{3}如何处理伤口，{3}教{0}如何识别可食用的植物，{1}教{2}如何修理工具。四人通过技能交换建立了互惠关系。',
    participantCount: 4,
    type: 'neutral',
    effects: ['{0}、{1}、{2}、{3}通过技能交换建立了实用的合作关系', '四人各取所需，关系保持中立但稳定'],
  },

  // Neutral events (5 participants)
  {
    id: 'ritual_witness',
    title: '仪式见证',
    description: '{0}、{1}、{2}、{3}和{4}在雪地中发现了一个古老的祭坛。上面刻着奇怪的符文，周围散落着动物骨骼。五人站在祭坛前，感受到一种超越理性的敬畏。这个经历让他们之间产生了微妙的联系。',
    participantCount: 5,
    type: 'neutral',
    effects: ['{0}、{1}、{2}、{3}、{4}共同见证了某种神秘的存在', '五人之间建立了特殊的连接，但还不确定这是好是坏'],
  },
  {
    id: 'truth_game',
    title: '真心话游戏',
    description: '{0}提议玩真心话游戏来打发时间。{1}、{2}、{3}和{4}同意了。游戏中，每个人都被迫说出一个秘密。有些秘密无伤大雅，有些则让人震惊。游戏结束后，五人之间的动态发生了微妙的变化。',
    participantCount: 5,
    type: 'neutral',
    effects: ['{0}、{1}、{2}、{3}、{4}对彼此有了更深但也更复杂的了解', '真相带来了亲密，但也带来了不安'],
  },
];

/**
 * Select a random event with specified number of participants
 */
export function selectRandomEvent(participantCount: number): GameEvent | null {
  const validEvents = GAME_EVENTS.filter(e => e.participantCount === participantCount);
  if (validEvents.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * validEvents.length);
  return validEvents[randomIndex];
}

/**
 * Select random participants from alive players
 */
export function selectRandomParticipants(alivePlayers: string[], count: number): string[] {
  if (alivePlayers.length < count) return [];

  const shuffled = [...alivePlayers].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Format event description with participant names
 */
export function formatEventDescription(event: GameEvent, participants: string[]): {
  description: string;
  effects: string[];
} {
  let description = event.description;
  let effects = [...event.effects];

  // Replace {0}, {1}, {2}, etc. with actual names
  participants.forEach((name, index) => {
    const placeholder = `{${index}}`;
    description = description.replace(new RegExp(`\\{${index}}`, 'g'), name);
    effects = effects.map(effect => effect.replace(new RegExp(`\\{${index}}`, 'g'), name));
  });

  return { description, effects };
}
