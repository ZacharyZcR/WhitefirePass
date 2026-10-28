/**
 * 山灵：契约的主人，唯一知道规则的 AI。
 * 这里只做一件事——听懂。角色用戏里的话回答（"我把石头放在霍克先生面前，愿主宽恕"），
 * 山灵一次读完一批回答，说出每个人把选择给了谁。是否合法、怎么结算，仍由引擎裁决。
 */

export interface Answer {
  name: string;
  /** 他说出口的话（含心里话也无妨，山灵只看他的选择） */
  text: string;
  /** 他这一步能选的人 */
  legal: string[];
}

export const SHANLING_SYSTEM = `你是山灵，白烬山口契约的主人。山庄里的人回答了你的问题，你要听懂每个人把选择给了谁。
- 只能从这个人"可以选"的名单里挑；他说的是名、姓、称谓（"霍克先生""那个女仆""神父"）都算数，你要认出是谁。
- 他话里没有明说、但倾向很明显的，按倾向算。
- 他拒绝选、或者完全听不出倾向的，记为 null。
只输出一个 JSON 对象，键是回答者的名字，值是他选的人的全名或 null。`;

export function interpretPrompt(question: string, answers: Answer[]): string {
  const lines = answers.map((a) => `【${a.name}】可以选：${a.legal.join('、')}\n他的回答：${a.text}`);
  return `你问的是：${question}\n\n${lines.join('\n\n')}\n\n输出 JSON。`;
}
