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
  // 兄妹：托马斯 ⟷ 莉迪亚
  // 她当掉了母亲的石榴石项链替他还债，扔了当票；他偷偷捡回来，想用这次的钱赎回。
  // 她没收到信，长桌第十五张椅子上却别着她的名字。
  {
    character: '莉迪亚·克劳利',
    target: '托马斯·克劳利',
    type: 'sibling',
    virtueChance: 0.15,  // 15%可能觉醒（为自己而活）
    viceChance: 0.75,    // 75%崩溃（存在意义消失）
    // 10%保持正常（麻木但坚持）
  },
  {
    character: '托马斯·克劳利',
    target: '莉迪亚·克劳利',
    type: 'sibling',
    virtueChance: 0.70,  // 70%觉醒（最后的救赎）
    viceChance: 0.20,    // 20%更深的自毁（连妹妹都保护不了）
    // 10%正常（麻木继续）
  },

  // 旧识：诺拉 ⟷ 马库斯
  // 1910年爱丁堡讲座，他问"谁替狼说话"；雨里送她到韦弗利车站的十分钟。两人都记得，都不提。
  {
    character: '诺拉·格雷',
    target: '马库斯·霍克',
    type: 'acquaintance',
    virtueChance: 0.80,  // 80%理性升华（学者本能）
    viceChance: 0.05,    // 5%情感崩溃（但诺拉没有vice prompt，会保持normal）
    // 15%保持正常
  },
  {
    character: '马库斯·霍克',
    target: '诺拉·格雷',
    type: 'acquaintance',
    virtueChance: 0.75,  // 75%猎人本能觉醒
    viceChance: 0.10,    // 10%可能因失去盟友而动摇（但没有vice prompt）
    // 15%保持正常
  },

  // 前恋人：维克多 ⟷ 艾米莉
  // 布隆方丹战地医院相识，伦敦同居数年，1905年她离开。
  // 她换药时哼《与我同住》，他至今听不得；她口袋里留着他军装上的铜纽扣，他不知道。
  {
    character: '维克多·斯通',
    target: '艾米莉·卡特',
    type: 'lover',
    virtueChance: 0.65,  // 65%觉醒（重拾军官荣耀）
    viceChance: 0.25,    // 25%彻底崩溃（但没有vice prompt）
    // 10%保持自毁状态
  },
  {
    character: '艾米莉·卡特',
    target: '维克多·斯通',
    type: 'lover',
    virtueChance: 0.20,  // 20%可能反而解脱（但没有virtue prompt）
    viceChance: 0.70,    // 70%救赎破灭
    // 10%保持正常
  },

  // 单恋：奥利弗 → 索菲亚
  // 她来他的药房买安眠药，他每次偷偷减量；她只觉得"药越来越不管用"。
  {
    character: '奥利弗·佩恩',
    target: '索菲亚·阿什福德',
    type: 'crush',
    virtueChance: 0.10,  // 10%可能反而觉醒（但没有virtue prompt）
    viceChance: 0.80,    // 80%意义消失
    // 10%麻木继续
  },
  {
    character: '索菲亚·阿什福德',
    target: '奥利弗·佩恩',
    type: 'crush',
    virtueChance: 0.85,  // 85%贵族冷酷
    viceChance: 0.05,    // 5%可能意识到孤独（但没有vice prompt）
    // 10%正常
  },

  // 债务：本杰明 ⟷ 亚历山大
  // 五百镑，格里姆肖的账。亚历山大去过怀特家，替他女儿艾玛系过鞋带——本杰明最怕的一幕。
  {
    character: '本杰明·怀特',
    target: '亚历山大·莫里斯',
    type: 'debtor',
    virtueChance: 0.75,  // 75%商人觉醒（解脱）
    viceChance: 0.10,    // 10%反而恐惧（失去"规则"）
    // 15%正常
  },
  {
    character: '亚历山大·莫里斯',
    target: '本杰明·怀特',
    type: 'debtor',
    virtueChance: 0.80,  // 80%职业冷酷（生意失败）
    viceChance: 0.05,    // 5%罕见的动摇
    // 15%正常
  },

  // 情敌：伊莎贝拉 ⟷ 夏洛特
  // 霍尔布鲁克先生先是伊莎贝拉的资助人，后转向夏洛特；伊莎贝拉的流言让他撤资，夏洛特没演成麦克白夫人。
  // 他撤资那天外套上有紫罗兰香水味。两人都输了，各自只记得对方赢。
  {
    character: '伊莎贝拉·费尔法克斯',
    target: '夏洛特·温特斯',
    type: 'rival',
    virtueChance: 0.90,  // 90%胜者姿态
    viceChance: 0.00,    // 0%崩溃（伊莎贝拉不会因此崩溃）
    // 10%正常（不在乎）
  },
  {
    character: '夏洛特·温特斯',
    target: '伊莎贝拉·费尔法克斯',
    type: 'rival',
    virtueChance: 0.85,  // 85%明星光芒
    viceChance: 0.10,    // 10%舞台崩塌
    // 5%正常
  },

  // 母女般：艾琳 ⟷ 克莱尔
  // 第一夜艾琳把披肩给了发抖的克莱尔。
  {
    character: '艾琳·哈钦斯',
    target: '克莱尔·沃伦',
    type: 'acquaintance',
    virtueChance: 0.80,  // 80%母亲的坚韧（保护年轻人）
    viceChance: 0.15,    // 15%等待死亡（又失去了一个孩子）
    // 5%正常
  },
  {
    character: '克莱尔·沃伦',
    target: '艾琳·哈钦斯',
    type: 'acquaintance',
    virtueChance: 0.70,  // 70%勇气觉醒（失去母亲般的保护者）
    viceChance: 0.20,    // 20%恐惧瘫痪（失去唯一的依靠）
    // 10%正常
  },

  // 救赎：艾琳 ⟷ 塞缪尔
  // 艾琳请他为汤姆祷告；他引错经文，她轻声纠正。她是唯一让他觉得袍子很薄的人。
  {
    character: '艾琳·哈钦斯',
    target: '塞缪尔·布莱克伍德',
    type: 'acquaintance',
    virtueChance: 0.60,  // 60%母亲的坚韧（神父的牺牲激励她）
    viceChance: 0.30,    // 30%等待死亡（连神父都死了）
    // 10%正常
  },
  {
    character: '塞缪尔·布莱克伍德',
    target: '艾琳·哈钦斯',
    type: 'acquaintance',
    virtueChance: 0.75,  // 75%真正的救赎（保护母亲般的人）
    viceChance: 0.20,    // 20%虚伪的崩塌（连无辜者都保护不了）
    // 5%正常
  },

  // 阶级：克莱尔 ⟷ 索菲亚
  // 克莱尔在阿什福德庄园给她刷过三年靴子；索菲亚不认得她的脸。
  {
    character: '克莱尔·沃伦',
    target: '索菲亚·阿什福德',
    type: 'acquaintance',
    virtueChance: 0.75,  // 75%勇气觉醒（不再被贵族压迫）
    viceChance: 0.15,    // 15%恐惧瘫痪（失去了社会秩序）
    // 10%正常
  },
  {
    character: '索菲亚·阿什福德',
    target: '克莱尔·沃伦',
    type: 'acquaintance',
    virtueChance: 0.20,  // 20%贵族的冷酷（女仆死亡无关紧要）
    viceChance: 0.65,    // 65%贵族的脆弱（连女仆都比她勇敢）
    // 15%正常
  },

  // 神父与罪人：塞缪尔 ⟷ 托马斯
  // 上山的马车里，托马斯向他忏悔了当票的事。他只说："先把它赎回来。"
  {
    character: '塞缪尔·布莱克伍德',
    target: '托马斯·克劳利',
    type: 'acquaintance',
    virtueChance: 0.70,  // 70%真正的救赎（未能拯救罪人）
    viceChance: 0.25,    // 25%虚伪的崩塌（救赎失败）
    // 5%正常
  },
  {
    character: '托马斯·克劳利',
    target: '塞缪尔·布莱克伍德',
    type: 'acquaintance',
    virtueChance: 0.65,  // 65%救赎之光（神父的牺牲启发他）
    viceChance: 0.25,    // 25%自毁深渊（连神父都救不了他）
    // 10%正常
  },

  // 军人与猎人：维克多 ⟷ 马库斯
  // 两人夜里都查窗户，站在窗前一起抽烟，不说话。
  {
    character: '维克多·斯通',
    target: '马库斯·霍克',
    type: 'acquaintance',
    virtueChance: 0.75,  // 75%最后的荣耀（战友倒下，他必须站起来）
    viceChance: 0.15,    // 15%懦夫重现（连猎人都死了）
    // 10%正常
  },
  {
    character: '马库斯·霍克',
    target: '维克多·斯通',
    type: 'acquaintance',
    virtueChance: 0.70,  // 70%猎人本能（军人的死激发警觉）
    viceChance: 0.20,    // 20%野性退化（失去盟友）
    // 10%正常
  },

  // 理性与信仰：诺拉 ⟷ 塞缪尔
  // 诺拉听出他的拉丁文祷词每次错在同一处变格，没有说破。
  {
    character: '诺拉·格雷',
    target: '塞缪尔·布莱克伍德',
    type: 'acquaintance',
    virtueChance: 0.70,  // 70%理性升华（信仰失败，理性获胜）
    viceChance: 0.20,    // 20%知识的虚妄（连信仰都无法救人）
    // 10%正常
  },
  {
    character: '塞缪尔·布莱克伍德',
    target: '诺拉·格雷',
    type: 'acquaintance',
    virtueChance: 0.60,  // 60%真正的救赎（学者的死让他更坚定）
    viceChance: 0.30,    // 30%虚伪的崩塌（连知识都救不了人）
    // 10%正常
  },

  // 医者与求助者：艾米莉 ⟷ 艾琳
  // 艾米莉一直在留意艾琳的咳嗽，给过她一块薄荷糖，什么也没问。
  {
    character: '艾米莉·卡特',
    target: '艾琳·哈钦斯',
    type: 'acquaintance',
    virtueChance: 0.75,  // 75%战地医者（医者使命）
    viceChance: 0.15,    // 15%救赎破灭（又一个无法拯救的人）
    // 10%正常
  },
  {
    character: '艾琳·哈钦斯',
    target: '艾米莉·卡特',
    type: 'acquaintance',
    virtueChance: 0.55,  // 55%母亲的坚韧（医者的死激励她）
    viceChance: 0.35,    // 35%等待死亡（连医者都死了）
    // 10%正常
  },

  // 被忽视的人：奥利弗 ⟷ 克莱尔
  // 他给了她一罐冻疮膏。山庄里没人注意她，也没人注意他。
  {
    character: '奥利弗·佩恩',
    target: '克莱尔·沃伦',
    type: 'acquaintance',
    virtueChance: 0.70,  // 70%谨慎的力量（保护弱者）
    viceChance: 0.20,    // 20%意义消失（又失去一个被忽视的人）
    // 10%正常
  },
  {
    character: '克莱尔·沃伦',
    target: '奥利弗·佩恩',
    type: 'acquaintance',
    virtueChance: 0.65,  // 65%勇气觉醒（他的勇气激励她）
    viceChance: 0.25,    // 25%恐惧瘫痪（失去同类）
    // 10%正常
  },

  // 台下的观众：奥利弗 → 夏洛特
  // 几年前他在白教堂看她演奥菲莉亚，买了三次票，坐第三排。她记得那张脸，想不起是谁。
  {
    character: '奥利弗·佩恩',
    target: '夏洛特·温特斯',
    type: 'crush',
    virtueChance: 0.15,  // 15%谨慎的力量（从暗恋中解脱）
    viceChance: 0.75,    // 75%意义消失（失去另一个光芒）
    // 10%正常
  },
  {
    character: '夏洛特·温特斯',
    target: '奥利弗·佩恩',
    type: 'crush',
    virtueChance: 0.80,  // 80%明星光芒（观众的死让她更耀眼）
    viceChance: 0.10,    // 10%舞台崩塌（失去第三排那个唯一的观众）
    // 10%正常
  },

  // 旧账：伊莎贝拉 ⟷ 本杰明
  // 1911年她在他店里赊了三件丝绸晚礼服，四十三镑，至今未付。她不记得他，他记得每一笔。
  {
    character: '伊莎贝拉·费尔法克斯',
    target: '本杰明·怀特',
    type: 'acquaintance',
    virtueChance: 0.85,  // 85%胜者姿态（一张账单随他一起埋了）
    viceChance: 0.10,    // 10%魅力失效（连商人都控制不了）
    // 5%正常
  },
  {
    character: '本杰明·怀特',
    target: '伊莎贝拉·费尔法克斯',
    type: 'acquaintance',
    virtueChance: 0.70,  // 70%商人的觉醒（不再对赊账的人陪笑）
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
