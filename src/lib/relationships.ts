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
    viceChance: 0.05,    // 5%可能失去动力（但没有vice prompt）
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
