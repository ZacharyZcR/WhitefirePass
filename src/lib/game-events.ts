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
    description: '{0}、{1}和{2}在厨房最里面的橱柜里找到半袋燕麦和两罐腌牛肉。罐头上的标签已经褪色，印着1903年的日期，可里面的肉没有坏。三个人就着一根蜡烛煮了一锅粥，分着吃完，谁也没问这些罐头是给谁留的。',
    participantCount: 3,
    type: 'positive',
    effects: ['{0}和{1}的关系变得更加亲近', '{1}和{2}的关系变得更加亲近', '{0}和{2}的关系变得更加亲近'],
  },
  {
    id: 'rescue',
    title: '危险救援',
    description: '{0}去地窖取煤油，踩上结了冰的石阶，一脚滑空。{1}和{2}听见声响冲下去，一个拽住胳膊，一个垫在下面，三个人一起滚到了底。爬起来时，{0}发现地窖的墙上用粉笔划着一排排记号，五个一组，像有人在数日子。',
    participantCount: 3,
    type: 'positive',
    effects: ['{0}对{1}和{2}心怀感激', '{1}和{2}因共同救人而关系加深'],
  },
  {
    id: 'old_story',
    title: '往事回忆',
    description: '后半夜，炉边只剩{0}、{1}和{2}。{0}说起小时候冬天的厨房，{1}说起一个再也见不到的人，{2}沉默了很久，说起自己最怕的那件事。白火在一旁静静燃着，像也在听。三个人都没提委托书上写了什么，但都明白，对方也背着东西来的。',
    participantCount: 3,
    type: 'positive',
    effects: ['{0}、{1}、{2}之间建立了更深的理解和信任'],
  },

  // Positive events (4 participants)
  {
    id: 'card_game',
    title: '纸牌游戏',
    description: '{0}、{1}、{2}和{3}在阁楼的箱子里找到一副旧纸牌。牌背印着褪色的山庄纹章，一共五十二张，其中十五张的牌面上用铅笔写着名字——字迹不同，墨色深浅不一，不是同一年写的。他们没有去认那些名字，把那十五张挑出来压在箱底，用剩下的牌玩了几局。笑声很勉强，但总算笑了。',
    participantCount: 4,
    type: 'positive',
    effects: ['{0}、{1}、{2}、{3}之间的气氛缓和了一些', '那十五个名字压在箱底，谁也没再提'],
  },
  {
    id: 'shelter_repair',
    title: '修缮避难所',
    description: '夜里一阵狂风撞开了二楼走廊的窗。{0}、{1}、{2}和{3}抢着去堵：{0}搬来床板，{1}钉钉子，{2}和{3}用撕开的毯子塞缝。窗框里嵌着一枚生锈的铁钉，钉帽上刻着和窗棂一样的符号。窗终于堵上了。窗外的雪，始终没有落进来一片。',
    participantCount: 4,
    type: 'positive',
    effects: ['{0}、{1}、{2}、{3}因共同劳动而有了默契', '那枚刻着符号的钉子，让四人心里都多了一个疑问'],
  },
  {
    id: 'musical_evening',
    title: '音乐之夜',
    description: '大厅角落那架旧钢琴走了音。{0}掀开琴盖，弹了一支谁都会哼的老歌，{1}跟着轻声唱，{2}和{3}靠着墙听。谱架上夹着一页手抄的乐谱，边上有人用铅笔写了一行小字："第二个冬天，我们还在唱。"日期被蜡烛油糊住了。曲子弹完，没有人鼓掌，可每个人都觉得屋里暖了一点。',
    participantCount: 4,
    type: 'positive',
    effects: ['{0}、{1}、{2}、{3}在一支老歌里有了片刻的共鸣', '那行铅笔小字让四人都沉默了一会儿'],
  },

  // Positive events (5 participants)
  {
    id: 'group_prayer',
    title: '集体祈祷',
    description: '{0}提议做一次祈祷。{1}、{2}、{3}和{4}信的东西各不相同，但都围了过来。有人念错了经文，没有人纠正。烛火摇晃，白火却纹丝不动，像在等他们念完。祷词的最后一句，五个人不约而同地停了一下——那一刻，他们都觉得屋里多了一个人在听。',
    participantCount: 5,
    type: 'positive',
    effects: ['{0}、{1}、{2}、{3}、{4}因共同的信念而团结', '精神上的共鸣让五人关系加深'],
  },
  {
    id: 'supply_discovery',
    title: '物资发现',
    description: '{0}、{1}、{2}、{3}和{4}撬开了地窖深处一只钉死的木箱：罐头、毛毯、一盒绷带。箱盖内侧用油漆写着"北方勘探公司"，下面一行小字："留给下一批"。五个人按人头把东西分了，连已经不在的人那一份也单独放好。没有人说为什么。',
    participantCount: 5,
    type: 'positive',
    effects: ['{0}、{1}、{2}、{3}、{4}因公平分配而建立信任', '"留给下一批"——五人开始怀疑自己是第几批'],
  },

  // Negative events (3 participants)
  {
    id: 'food_theft',
    title: '食物失窃',
    description: '{0}藏在床下的半块面包不见了。有人看见{1}傍晚从那条走廊出来，{2}却说{1}当时一直在厨房帮忙。三个人在楼梯口吵到声音发哑。面包始终没有找到。第二天早上，长桌上原本放{0}餐具的位置，多了一小撮面包屑。',
    participantCount: 3,
    type: 'negative',
    effects: ['{0}怀疑{1}偷了食物，关系恶化', '{0}和{2}因立场不同而产生矛盾', '{1}感到被冤枉，对{0}产生敌意'],
  },
  {
    id: 'blame_game',
    title: '相互指责',
    description: '门闩没有插好，冷风灌了半夜。{0}说是{1}最后一个上楼，{1}说{0}从来只会动嘴，{2}想劝，两个人一起转过来冲着{2}。这件事本身很小，可在这座山庄里，没有小事。',
    participantCount: 3,
    type: 'negative',
    effects: ['{0}和{1}之间产生深刻的矛盾', '{2}感到被孤立，对{0}和{1}都产生不满'],
  },
  {
    id: 'secret_exposed',
    title: '秘密揭露',
    description: '{0}下楼取水，在楼梯拐角听见{1}和{2}在说自己——说{0}的口音，说{0}委托书上那件不肯讲的事。他们说得很轻，笑得也很轻。{0}端着水站了很久，然后转身上楼。第二天，三个人都装作什么也没发生。',
    participantCount: 3,
    type: 'negative',
    effects: ['{0}对{1}和{2}失去信任', '{1}和{2}感到尴尬和愧疚，但关系已经破裂'],
  },
  {
    id: 'jealousy',
    title: '嫉妒之火',
    description: '{0}看见{1}把自己的毯子分给了{2}，两个人挨着炉火低声说话。{0}没有过去。从那以后，{0}吃饭时坐得离{1}远了一些，看{2}的眼神也冷了。没人说破，可三个人都感觉得到。',
    participantCount: 3,
    type: 'negative',
    effects: ['{0}嫉妒{1}和{2}的关系', '{1}感到困惑和不安', '{2}意识到{0}的敌意'],
  },

  // Negative events (4 participants)
  {
    id: 'alliance_betrayal',
    title: '联盟背叛',
    description: '{0}和{1}约好白天彼此照应，投石时不互相指认。可{0}夜里起身，看见{1}和{2}、{3}在书房里点着一根蜡烛低声商量，桌上摊着那本旧日记。{1}抬头看见了门口的{0}，没有解释。',
    participantCount: 4,
    type: 'negative',
    effects: ['{0}对{1}的背叛感到愤怒', '{1}、{2}、{3}结成新联盟，孤立{0}', '{0}发誓报复'],
  },
  {
    id: 'resource_conflict',
    title: '资源冲突',
    description: '最后一条完好的羊毛毯。{0}、{1}、{2}和{3}都冻得睡不着。争执从客气到难听，最后{0}一把夺过毯子裹在身上，背过身去。另外三个人在冷里坐到天亮，谁也没再看{0}一眼。',
    participantCount: 4,
    type: 'negative',
    effects: ['{0}因自私的行为被其他三人敌视', '{1}、{2}、{3}对{0}产生共同的敌意'],
  },
  {
    id: 'rumor_spread',
    title: '谣言传播',
    description: '{0}把{2}委托书上的那件事告诉了{1}，叮嘱千万别说出去。{1}当晚就告诉了{3}。第二天，{2}发现每个人看自己的眼神都不一样了。{2}站在长桌前，把那封信拍在桌上，问是谁说出去的。没有人回答。',
    participantCount: 4,
    type: 'negative',
    effects: ['{2}对{0}的泄密感到愤怒', '{2}对{1}和{3}的传播感到背叛', '{0}、{1}、{3}感到愧疚但关系已无法修复'],
  },

  // Negative events (5 participants)
  {
    id: 'group_division',
    title: '群体分裂',
    description: '{0}和{1}主张打破二楼的窗，趁白天顺着绳子下山试试；{2}、{3}和{4}说那是送死——马库斯来时的脚印一夜之间就没了，谁知道雪底下是什么。争吵越来越凶，最后{0}和{1}搬去了东边的房间，另外三个人留在大厅。中间那条走廊，从此像一道边界。',
    participantCount: 5,
    type: 'negative',
    effects: ['{0}和{1}结成联盟，对抗其他人', '{2}、{3}、{4}结成联盟，与{0}和{1}对立', '五人之间的裂痕可能无法弥合'],
  },
  {
    id: 'scapegoat',
    title: '替罪羊',
    description: '储藏室里最后一桶煤油漏光了，地上只剩一摊油渍。{1}、{2}、{3}和{4}都知道那只桶本来就有裂缝，可每个人都说是{0}最后碰过它。{0}辩解了几句，没人接话。从那以后，{0}一个人坐在长桌的最末端。',
    participantCount: 5,
    type: 'negative',
    effects: ['{0}被其他四人孤立和指责', '{1}、{2}、{3}、{4}因共同的谎言而相互绑定', '{0}对所有人失去信任'],
  },

  // Neutral events (3 participants)
  {
    id: 'philosophical_debate',
    title: '哲学辩论',
    description: '{0}说这一切都有解释，只是他们还没找到；{1}说有些事只能交给信仰；{2}说解释和信仰都是一回事——都是人在害怕的时候给自己讲的故事。三个人争到煤油灯熄了，谁也没说服谁。可那以后，他们看彼此的眼神，多了一点认得。',
    participantCount: 3,
    type: 'neutral',
    effects: ['{0}、{1}、{2}之间产生了思想上的碰撞', '虽然观点不同，但三人对彼此的理解加深'],
  },
  {
    id: 'dream_sharing',
    title: '梦境分享',
    description: '同一个夜里，{0}、{1}和{2}都做了梦。{0}梦见一个死去的亲人站在门口，身上全是雪；{1}梦见一张空桌子，桌上一张白纸，名字一个接一个自己浮出来；{2}梦见一片没有脚印的雪原，远处有十五把椅子。早饭时三人说起，越说越安静。',
    participantCount: 3,
    type: 'neutral',
    effects: ['{0}、{1}、{2}因同一夜的梦而产生了特殊的联系', '三人开始相信，这座山在跟他们说话'],
  },

  // Neutral events (4 participants)
  {
    id: 'exploration',
    title: '探索发现',
    description: '{0}、{1}、{2}和{3}撬开了书房那张上锁的写字台。抽屉里有一叠空白信纸、一瓶褐色墨水、一枚刻着窗棂符号的火漆印章。最上面那张信纸只写了两个字："致——"。墨迹是新的。字迹和他们每个人收到的委托书，一模一样。',
    participantCount: 4,
    type: 'neutral',
    effects: ['{0}、{1}、{2}、{3}共同掌握了一个秘密', '四人开始怀疑：写信的人，也许就在山庄里，或者将会在'],
  },
  {
    id: 'skill_exchange',
    title: '技能交换',
    description: '困了几天，人总得找点事做。{0}教{1}怎么让湿木头生起火，{2}教{3}怎么包扎冻伤，{3}教{0}认哪些干苔藓能嚼，{1}帮{2}修好了那盏漏油的灯。谁都没说信任，但都记下了谁帮过自己。',
    participantCount: 4,
    type: 'neutral',
    effects: ['{0}、{1}、{2}、{3}通过技能交换建立了实用的合作关系', '四人各取所需，关系保持中立但稳定'],
  },

  // Neutral events (5 participants)
  {
    id: 'ritual_witness',
    title: '仪式见证',
    description: '{0}、{1}、{2}、{3}和{4}顺着地窖的冷风，找到一扇被煤堆挡住的矮门。门后是一间石室，中央一块平整的石台，台面上有一圈被磨亮的凹痕，像很多人一起把手按在上面过。墙上刻着一排排名字，每十五个一组。最新的一组下面，还空着十五个位置。',
    participantCount: 5,
    type: 'neutral',
    effects: ['{0}、{1}、{2}、{3}、{4}共同见证了那面刻满名字的墙', '五人之间多了一种说不清的联系，不确定是好是坏'],
  },
  {
    id: 'truth_game',
    title: '真心话游戏',
    description: '{0}提议玩真心话，每人说一件委托书上没写、但自己知道写信的人一定知道的事。{1}、{2}、{3}和{4}都同意了。有人说得轻描淡写，有人说到一半停住，有人说完之后再没抬头。游戏结束时，五个人谁也没有说"这只是游戏"。',
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
