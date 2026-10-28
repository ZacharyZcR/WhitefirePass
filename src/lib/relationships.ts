/**
 * Character relationships configuration
 * Defines how characters react to each other's deaths
 */

import type { CharacterRelationship } from '@/types/game';

/**
 * Relationship graph
 * virtueChance + viceChance: 概率总和
 * - 如果 < 1，剩余概率保持normal状态
 * - 例如 virtue=0.7, vice=0.2 → 70%美德, 20%罪恶, 10%正常
 */
export const CHARACTER_RELATIONSHIPS: CharacterRelationship[] = [
  // 兄妹关系：托马斯 ⟷ 莉迪亚
  {
    character: '莉迪亚·克劳利',
    target: '托马斯·克劳利',
    known: '你哥哥，你唯一的亲人。他赌掉了你的嫁妆，你恨他，可你还是跟着他上了山。',
    type: 'sibling',
    virtueChance: 0.15,  // 15%可能觉醒（为自己而活）
    viceChance: 0.75,    // 75%崩溃（存在意义消失）
    // 10%保持正常（麻木但坚持）
  },
  {
    character: '托马斯·克劳利',
    target: '莉迪亚·克劳利',
    known: '你妹妹。你欠她的，这辈子还不清。她会在这里，是因为你。',
    type: 'sibling',
    virtueChance: 0.70,  // 70%觉醒（最后的救赎）
    viceChance: 0.20,    // 20%更深的自毁（连妹妹都保护不了）
    // 10%正常（麻木继续）
  },

  // 旧识：诺拉 ⟷ 马库斯
  {
    character: '诺拉·格雷',
    target: '马库斯·霍克',
    known: '三年前在爱丁堡，他坐在台下听你讲课，问过一个很准的问题。你对他印象不坏，只是想不通一个猎人为什么会来这里。',
    type: 'acquaintance',
    virtueChance: 0.80,  // 80%理性升华（学者本能）
    viceChance: 0.05,    // 5%情感崩溃（但诺拉没有vice prompt，会保持normal）
    // 15%保持正常
  },
  {
    character: '马库斯·霍克',
    target: '诺拉·格雷',
    known: '三年前在爱丁堡讲狩猎仪式的女学者，她说过的那句话你一直记得。在这群人里，她是你最愿意相信的一个。',
    type: 'acquaintance',
    virtueChance: 0.75,  // 75%猎人本能觉醒
    viceChance: 0.10,    // 10%可能因失去盟友而动摇（但没有vice prompt）
    // 15%保持正常
  },

  // 前恋人：维克多 ⟷ 艾米莉
  {
    character: '维克多·斯通',
    target: '艾米莉·卡特',
    known: '你在南非时的恋人。你对不起她，那个冬天的事你不敢去想。这几天你一直不敢正眼看她。',
    type: 'lover',
    virtueChance: 0.65,  // 65%觉醒（重拾军官荣耀）
    viceChance: 0.25,    // 25%彻底崩溃（但没有vice prompt）
    // 10%保持自毁状态
  },
  {
    character: '艾米莉·卡特',
    target: '维克多·斯通',
    known: '你爱过他，替他签过那份伤情报告，也因为他失去过一个孩子。你离开了他，可看见他发抖的手，你还是忍不住想去扶。',
    type: 'lover',
    virtueChance: 0.20,  // 20%可能反而解脱（但没有virtue prompt）
    viceChance: 0.70,    // 70%救赎破灭
    // 10%保持正常
  },

  // 单恋：奥利弗 → 索菲亚
  {
    character: '奥利弗·佩恩',
    target: '索菲亚·阿什福德',
    known: '三个月前她来你的药房买安眠药，从那以后你就忘不了她。你不敢跟她说话。',
    type: 'crush',
    virtueChance: 0.10,  // 10%可能反而觉醒（但没有virtue prompt）
    viceChance: 0.80,    // 80%意义消失
    // 10%麻木继续
  },
  {
    character: '索菲亚·阿什福德',
    target: '奥利弗·佩恩',
    known: '那个药剂师总是偷偷看你。他胆小，好使唤，在这种地方有个肯替你跑腿的人不是坏事。',
    type: 'crush',
    virtueChance: 0.85,  // 85%贵族冷酷
    viceChance: 0.05,    // 5%可能意识到孤独（但没有vice prompt）
    // 10%正常
  },

  // 债务关系：本杰明 ⟷ 亚历山大
  {
    character: '本杰明·怀特',
    target: '亚历山大·莫里斯',
    known: '债主派来盯你的人。你怕他，更怕他对你的妻子和孩子下手。',
    type: 'debtor',
    virtueChance: 0.75,  // 75%商人觉醒（解脱）
    viceChance: 0.10,    // 10%反而恐惧（失去"规则"）
    // 15%正常
  },
  {
    character: '亚历山大·莫里斯',
    target: '本杰明·怀特',
    known: '你这次上山要盯的人。他欠东区五百镑，人寿保险单押在老板手里。',
    type: 'debtor',
    virtueChance: 0.80,  // 80%职业冷酷（生意失败）
    viceChance: 0.05,    // 5%罕见的动摇
    // 15%正常
  },

  // 情敌：伊莎贝拉 ⟷ 夏洛特
  {
    character: '伊莎贝拉·费尔法克斯',
    target: '夏洛特·温特斯',
    known: '那个红头发的小演员，抢走了你的资助人。你恨她，也看不起她。',
    type: 'rival',
    virtueChance: 0.90,  // 90%胜者姿态
    viceChance: 0.00,    // 0%崩溃（伊莎贝拉不会因此崩溃）
    // 10%正常（不在乎）
  },
  {
    character: '夏洛特·温特斯',
    target: '伊莎贝拉·费尔法克斯',
    known: '她毁了你的麦克白夫人。你恨她，更想赢她。',
    type: 'rival',
    virtueChance: 0.85,  // 85%明星光芒
    viceChance: 0.10,    // 10%舞台崩塌
    // 5%正常
  },

  // 母女般的关系：艾琳 ⟷ 克莱尔
  {
    character: '艾琳·哈钦斯',
    target: '克莱尔·沃伦',
    known: '那个十九岁的小女仆，瘦小，头发剪得乱七八糟。她让你想起汤姆，你总想护着她。你说不清为什么，她的背影会让你心里一紧。',
    type: 'acquaintance',
    virtueChance: 0.80,  // 80%母亲的坚韧（保护年轻人）
    viceChance: 0.15,    // 15%等待死亡（又失去了一个孩子）
    // 5%正常
  },
  {
    character: '克莱尔·沃伦',
    target: '艾琳·哈钦斯',
    known: '那个总穿黑衣服的寡妇。这几天她总把自己那份汤分你一半。你觉得好像在哪里见过她。',
    type: 'acquaintance',
    virtueChance: 0.70,  // 70%勇气觉醒（失去母亲般的保护者）
    viceChance: 0.20,    // 20%恐惧瘫痪（失去唯一的依靠）
    // 10%正常
  },

  // 救赎关系：艾琳 ⟷ 塞缪尔
  {
    character: '艾琳·哈钦斯',
    target: '塞缪尔·布莱克伍德',
    known: '这几天里，只有神父肯坐下来听你说汤姆的事。',
    type: 'acquaintance',
    virtueChance: 0.60,  // 60%母亲的坚韧（神父的牺牲激励她）
    viceChance: 0.30,    // 30%等待死亡（连神父都死了）
    // 10%正常
  },
  {
    character: '塞缪尔·布莱克伍德',
    target: '艾琳·哈钦斯',
    known: '丢了儿子的母亲。她每天都来找你说汤姆。你想替她做点什么，好像这样就能还上一点什么。',
    type: 'acquaintance',
    virtueChance: 0.75,  // 75%真正的救赎（保护母亲般的人）
    viceChance: 0.20,    // 20%虚伪的崩塌（连无辜者都保护不了）
    // 5%正常
  },

  // 阶级关系：克莱尔 ⟷ 索菲亚
  {
    character: '克莱尔·沃伦',
    target: '索菲亚·阿什福德',
    known: '阿什福德小姐使唤你的样子，和大宅里的太太们一模一样。你还是低着头照做了。',
    type: 'acquaintance',
    virtueChance: 0.75,  // 75%勇气觉醒（不再被贵族压迫）
    viceChance: 0.15,    // 15%恐惧瘫痪（失去了社会秩序）
    // 10%正常
  },
  {
    character: '索菲亚·阿什福德',
    target: '克莱尔·沃伦',
    known: '那个小女仆。在这里，她是唯一还肯替你倒水的人。',
    type: 'acquaintance',
    virtueChance: 0.20,  // 20%贵族的冷酷（女仆死亡无关紧要）
    viceChance: 0.65,    // 65%贵族的脆弱（连女仆都比她勇敢）
    // 15%正常
  },

  // 神父与罪人：塞缪尔 ⟷ 托马斯
  {
    character: '塞缪尔·布莱克伍德',
    target: '托马斯·克劳利',
    known: '爱说笑话的年轻人。这几天他来找过你一次，话说到一半就走了。你看得出他心里压着事。',
    type: 'acquaintance',
    virtueChance: 0.70,  // 70%真正的救赎（未能拯救罪人）
    viceChance: 0.25,    // 25%虚伪的崩塌（救赎失败）
    // 5%正常
  },
  {
    character: '托马斯·克劳利',
    target: '塞缪尔·布莱克伍德',
    known: '你想过去找神父忏悔，走到他面前，又讲了个笑话。',
    type: 'acquaintance',
    virtueChance: 0.65,  // 65%救赎之光（神父的牺牲启发他）
    viceChance: 0.25,    // 25%自毁深渊（连神父都救不了他）
    // 10%正常
  },

  // 军人与猎人：维克多 ⟷ 马库斯
  {
    character: '维克多·斯通',
    target: '马库斯·霍克',
    known: '脸上有疤的猎人。这里只有他像是见过血的，你和他说得上话。',
    type: 'acquaintance',
    virtueChance: 0.75,  // 75%最后的荣耀（战友倒下，他必须站起来）
    viceChance: 0.15,    // 15%懦夫重现（连猎人都死了）
    // 10%正常
  },
  {
    character: '马库斯·霍克',
    target: '维克多·斯通',
    known: '退役的上尉，酒鬼。他也去过德兰士瓦。你没问他在哪个团，他也没问你。',
    type: 'acquaintance',
    virtueChance: 0.70,  // 70%猎人本能（军人的死激发警觉）
    viceChance: 0.20,    // 20%野性退化（失去盟友）
    // 10%正常
  },

  // 理性与信仰：诺拉 ⟷ 塞缪尔
  {
    character: '诺拉·格雷',
    target: '塞缪尔·布莱克伍德',
    known: '他说话温和，大家都愿意亲近他。可他做祝福手势的顺序，和你在都柏林见过的神父都不一样。你把这件事记下了。',
    type: 'acquaintance',
    virtueChance: 0.70,  // 70%理性升华（信仰失败，理性获胜）
    viceChance: 0.20,    // 20%知识的虚妄（连信仰都无法救人）
    // 10%正常
  },
  {
    character: '塞缪尔·布莱克伍德',
    target: '诺拉·格雷',
    known: '那个女学者看你的眼神，像在核对什么。你一直躲着她。',
    type: 'acquaintance',
    virtueChance: 0.60,  // 60%真正的救赎（学者的死让他更坚定）
    viceChance: 0.30,    // 30%虚伪的崩塌（连知识都救不了人）
    // 10%正常
  },

  // 医者与求助者：艾米莉 ⟷ 艾琳
  {
    character: '艾米莉·卡特',
    target: '艾琳·哈钦斯',
    known: '那个沉默的寡妇。前几天她发烧，你守了她一夜。',
    type: 'acquaintance',
    virtueChance: 0.75,  // 75%战地医者（医者使命）
    viceChance: 0.15,    // 15%救赎破灭（又一个无法拯救的人）
    // 10%正常
  },
  {
    character: '艾琳·哈钦斯',
    target: '艾米莉·卡特',
    known: '那个护士手很稳，说话不绕弯子。你发烧那天，是她守着你。',
    type: 'acquaintance',
    virtueChance: 0.55,  // 55%母亲的坚韧（医者的死激励她）
    viceChance: 0.35,    // 35%等待死亡（连医者都死了）
    // 10%正常
  },

  // 被忽视的人：奥利弗 ⟷ 克莱尔
  {
    character: '奥利弗·佩恩',
    target: '克莱尔·沃伦',
    known: '那个小女仆。这几天她和你一样，总待在没人注意的角落。你悄悄多给过她一块面包。',
    type: 'acquaintance',
    virtueChance: 0.70,  // 70%谨慎的力量（保护弱者）
    viceChance: 0.20,    // 20%意义消失（又失去一个被忽视的人）
    // 10%正常
  },
  {
    character: '克莱尔·沃伦',
    target: '奥利弗·佩恩',
    known: '第一次听见他姓佩恩，你手里的碗差点掉了。你在佩恩宅五年，只远远见过长子一两回。他好像不认得你。',
    type: 'acquaintance',
    virtueChance: 0.65,  // 65%勇气觉醒（他的勇气激励她）
    viceChance: 0.25,    // 25%恐惧瘫痪（失去同类）
    // 10%正常
  },

  // 佩恩宅之夜：奥利弗 ⟷ 夏洛特（死因调查上见过）
  {
    character: '奥利弗·佩恩',
    target: '夏洛特·温特斯',
    known: '父亲的情妇。父亲倒下的那一夜，只有她在场。死因调查上你见过她，从那以后你一直想问她，父亲最后说了什么。',
    type: 'acquaintance',
    label: '父亲的情妇',
    virtueChance: 0.55,  // 55%谨慎的力量（核对每个人的话）
    viceChance: 0.35,    // 35%意义消失（再也问不到父亲最后的话）
  },
  {
    character: '夏洛特·温特斯',
    target: '奥利弗·佩恩',
    known: '埃德蒙的长子。死因调查那天，他坐在旁听席最后一排，一直看着你。你不想和他单独说话。',
    type: 'acquaintance',
    label: '旧情人的儿子',
    virtueChance: 0.70,  // 70%明星光芒（没人再追问那一夜）
    viceChance: 0.20,    // 20%舞台崩塌（那场戏没演完）
  },

  // 佩恩宅旧人：莉迪亚 ⟷ 奥利弗
  {
    character: '莉迪亚·克劳利',
    target: '奥利弗·佩恩',
    known: '朱利安的哥哥。你在佩恩家教书的那几年见过他几次，他话很少。在这里，只有他和你一样记得朱利安。',
    type: 'acquaintance',
    label: '朱利安的哥哥',
    virtueChance: 0.55,  // 55%为自己而活（替朱利安看清真相）
    viceChance: 0.35,    // 35%意义消失（最后一个记得朱利安的人）
  },
  {
    character: '奥利弗·佩恩',
    target: '莉迪亚·克劳利',
    known: '朱利安小时候的家庭教师。朱利安叫她"第二个母亲"。你欠她一声谢谢。',
    type: 'acquaintance',
    label: '弟弟的家庭教师',
    virtueChance: 0.60,  // 60%谨慎的力量（不再躲在柜台后面）
    viceChance: 0.30,    // 30%意义消失（又一次来不及）
  },
  {
    character: '托马斯·克劳利',
    target: '奥利弗·佩恩',
    known: '老佩恩的长子，你在银行里见过他一两回。看见他，你就会想起那间书房。',
    type: 'acquaintance',
    label: '老板的儿子',
    virtueChance: 0.40,  // 40%救赎之光（债还给活人）
    viceChance: 0.50,    // 50%自毁深渊（山记得每一笔账）
  },

  // 东区的账：托马斯 ⟷ 亚历山大，托马斯 ⟷ 本杰明
  {
    character: '托马斯·克劳利',
    target: '亚历山大·莫里斯',
    known: '替东区老板收账的人。你欠赌场的三百镑，迟早会落到他手里。他看你一眼，你就想躲。',
    type: 'debtor',
    label: '东区的债主',
    virtueChance: 0.60,  // 60%救赎之光（债主倒下了）
    viceChance: 0.30,    // 30%自毁深渊（换个人来收账）
  },
  {
    character: '亚历山大·莫里斯',
    target: '托马斯·克劳利',
    known: '欠东区赌场三百镑的银行职员。这笔不归你管，但你记得这个数字。',
    type: 'debtor',
    label: '欠赌账的职员',
    virtueChance: 0.75,  // 75%职业冷酷（一笔坏账）
    viceChance: 0.10,    // 10%失控的暴力（账本没用了）
  },
  {
    character: '本杰明·怀特',
    target: '托马斯·克劳利',
    known: '你认得这张脸。1908年，就是他坐在佩恩银行的柜台后面拒了你的贷款，你才去找了亚历山大。',
    type: 'acquaintance',
    label: '拒贷的职员',
    virtueChance: 0.60,  // 60%商人的觉醒（旧账勾销）
    viceChance: 0.30,    // 30%恐惧的囚徒（只剩他一个）
  },
  {
    character: '托马斯·克劳利',
    target: '本杰明·怀特',
    known: '亚历山大一直盯着他，你猜他和你一样欠着东区的钱。你隐约觉得在哪里见过他。',
    type: 'acquaintance',
    label: '同欠东区的人',
    virtueChance: 0.55,  // 55%救赎之光（替他活下去）
    viceChance: 0.35,    // 35%自毁深渊（同一张账单）
  },

  // 伦敦的客厅：伊莎贝拉 ⟷ 索菲亚
  {
    character: '伊莎贝拉·费尔法克斯',
    target: '索菲亚·阿什福德',
    known: '伦敦客厅里见过很多次的阿什福德小姐。她家倒下之前，客厅里那些话是怎么传开的，你比谁都清楚。她可以用。',
    type: 'acquaintance',
    label: '客厅里的旧识',
    virtueChance: 0.75,  // 75%胜者姿态（又少了一个人）
    viceChance: 0.15,    // 15%魅力失效（几年后的自己）
  },
  {
    character: '索菲亚·阿什福德',
    target: '伊莎贝拉·费尔法克斯',
    known: '伦敦社交圈里最会笑的女人。你在客厅里见过她很多次，学过她说话的样子，也一直防着她。',
    type: 'acquaintance',
    label: '客厅里的旧识',
    virtueChance: 0.65,  // 65%贵族的冷酷（少了一双眼睛）
    viceChance: 0.25,    // 25%贵族的脆弱（连她都输了）
  },

  // 汇票：亚历山大 → 塞缪尔
  {
    character: '亚历山大·莫里斯',
    target: '塞缪尔·布莱克伍德',
    type: 'acquaintance',
    label: '寄汇票的神父',
    known: '"神父"。你知道他是谁，也知道每年复活节从都柏林寄来的汇票出自谁手。他不认得你。',
    virtueChance: 0.80,  // 80%职业冷酷（伪善者的终结）
    viceChance: 0.10,    // 10%失控的暴力（规则的崩溃）
  },

  // 炉火边的人：塞缪尔 ⟷ 克莱尔，塞缪尔 → 亚历山大
  {
    character: '塞缪尔·布莱克伍德',
    target: '克莱尔·沃伦',
    known: '那个小女仆。好几次她走到你身边，像是有话要说，最后都低着头走开了。',
    type: 'acquaintance',
    label: '炉火边的女孩',
    virtueChance: 0.65,  // 65%真正的救赎（护住活着的人）
    viceChance: 0.30,    // 30%虚伪的崩塌（又一个没救下的孩子）
  },
  {
    character: '克莱尔·沃伦',
    target: '塞缪尔·布莱克伍德',
    known: '你想过把楼梯上的事告诉神父，话到嘴边又咽了回去。',
    type: 'acquaintance',
    label: '炉火边的神父',
    virtueChance: 0.60,  // 60%勇气觉醒（没人再挡在前面）
    viceChance: 0.30,    // 30%恐惧瘫痪（没有人听了）
  },
  {
    character: '塞缪尔·布莱克伍德',
    target: '亚历山大·莫里斯',
    known: '穿黑西装的收账人。他偶尔会看你一眼，那眼神让你不舒服，你说不清为什么。',
    type: 'acquaintance',
    virtueChance: 0.60,  // 60%真正的救赎（恶人也是该救的灵魂）
    viceChance: 0.30,    // 30%虚伪的崩塌（连恶人都保护不了）
  },

  // 操纵关系：伊莎贝拉 ⟷ 本杰明
  {
    character: '伊莎贝拉·费尔法克斯',
    target: '本杰明·怀特',
    known: '戴金戒指的商人。这几天你看出来了，他怕死，也好骗。',
    type: 'acquaintance',
    virtueChance: 0.85,  // 85%胜者姿态（少了一个可利用的人）
    viceChance: 0.10,    // 10%魅力失效（连商人都控制不了）
    // 5%正常
  },
  {
    character: '本杰明·怀特',
    target: '伊莎贝拉·费尔法克斯',
    known: '她这几天对你格外和气。你知道这不会没有原因，可你还是愿意听她说话。',
    type: 'acquaintance',
    virtueChance: 0.70,  // 70%商人的觉醒（不再被魅力迷惑）
    viceChance: 0.20,    // 20%恐惧的囚徒（失去了可以交易的对象）
    // 10%正常
  },
];

/**
 * Get relationships for a character
 */
export function getRelationshipsForCharacter(characterName: string): CharacterRelationship[] {
  return CHARACTER_RELATIONSHIPS.filter(rel => rel.character === characterName);
}

/**
 * Check if character death triggers state changes
 */
export function getTriggeredStateChanges(
  deadCharacterName: string,
): CharacterRelationship[] {
  return CHARACTER_RELATIONSHIPS.filter(rel => rel.target === deadCharacterName);
}

/**
 * Get relationship type label in Chinese
 */
export function getRelationshipLabel(type: CharacterRelationship['type']): string {
  const labels: Record<CharacterRelationship['type'], string> = {
    sibling: '兄妹',
    lover: '前恋人',
    crush: '暗恋对象',
    rival: '宿敌',
    debtor: '债务关系',
    acquaintance: '旧识',
  };
  return labels[type];
}
