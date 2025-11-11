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

  // 债务关系：本杰明 ⟷ 亚历山大
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

  // 母女般的关系：艾琳 ⟷ 克莱尔
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

  // 救赎关系：艾琳 ⟷ 塞缪尔
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

  // 阶级关系：克莱尔 ⟷ 索菲亚
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

  // 单恋演员：奥利弗 → 夏洛特
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
    viceChance: 0.10,    // 10%舞台崩塌（失去唯一真心的观众）
    // 10%正常
  },

  // 操纵关系：伊莎贝拉 ⟷ 本杰明
  {
    character: '伊莎贝拉·费尔法克斯',
    target: '本杰明·怀特',
    type: 'acquaintance',
    virtueChance: 0.85,  // 85%胜者姿态（少了一个可利用的人）
    viceChance: 0.10,    // 10%魅力失效（连商人都控制不了）
    // 5%正常
  },
  {
    character: '本杰明·怀特',
    target: '伊莎贝拉·费尔法克斯',
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
