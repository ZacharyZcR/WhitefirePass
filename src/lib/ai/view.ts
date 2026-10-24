/**
 * 一个角色眼中的局面：只包含 TA 有权知道的东西。prompt 和 CLI 共用
 */

import type { GameState, Message, Player } from '@/types/game';

export const ROLE_NAME: Record<string, string> = {
  marked: '烙印者', heretic: '背誓者', listener: '聆心者', coroner: '食灰者', twin: '共誓者', guard: '设闩者', innocent: '无知者',
};

// 七天相处下来，谁都看得见的外貌（灵魂的颜色看不见）
export const APPEARANCE: Record<string, string> = {
  '诺拉·格雷': '26岁，古文字学者。深栗色长发挽起，金边圆眼镜，冷静而疲惫。',
  '马库斯·霍克': '34岁，猎人。眉骨到下巴一道疤，旧皮夹克，腰间猎刀，话少。',
  '艾琳·哈钦斯': '43岁，工厂清洁工。黑头巾下头发花白，总攥着一方旧手帕，沉默。',
  '托马斯·克劳利': '28岁，前银行职员。金发梳得整齐，西装衣领磨损，爱开玩笑掩饰紧张。',
  '莉迪亚·克劳利': '25岁，家庭教师，托马斯的妹妹。利落短发，灰色长裙，几乎不笑。',
  '奥利弗·佩恩': '31岁，药剂师。瘦削驼背，厚眼镜，随身药箱，说话常结巴。',
  '索菲亚·阿什福德': '23岁，没落贵族小姐。金色卷发，褪色丝裙，下巴总是抬着。',
  '塞缪尔·布莱克伍德': '47岁，神父。半白头发，黑袍与银十字架，声音沉稳。',
  '克莱尔·沃伦': '19岁，女仆。娇小，亚麻色乱发，眼神总在躲闪。',
  '维克多·斯通': '39岁，退役上尉。驼背却坚持剃须，旧军大衣，身上有酒气。',
  '艾米莉·卡特': '32岁，战地护士。整洁发髻，手很稳，眼神专注。',
  '本杰明·怀特': '41岁，破产丝绸商。过时的昂贵礼服，不停转动金戒指。',
  '伊莎贝拉·费尔法克斯': '29岁，社交名媛。乌黑波浪长发，酒红长裙，笑容无懈可击。',
  '亚历山大·莫里斯': '45岁，讨债人。一丝不苟的黑色三件套，面无表情，随身账本。',
  '夏洛特·温特斯': '21岁，小剧场演员。红色短发，廉价艳丽的裙子，挑衅的笑。',
};

const PHASE_LABEL: Record<string, string> = {
  day: '白天', voting: '黄昏', night: '夜', secret_meeting: '密会', event: '事件', setup: '序章', prologue: '序章',
};

export const isOwnPrivate = (m: Message, player: Player) => {
  const v = m.visibility;
  if (v === 'all') return false;
  if (typeof v === 'object') {
    return ('player' in v && v.player === player.name) || ('secretMeeting' in v && v.secretMeeting.includes(player.name));
  }
  return (v === 'marked' && player.role === 'marked')
    || (v === 'listener' && player.role === 'listener')
    || (v === 'coroner' && player.role === 'coroner')
    || (v === 'guard' && player.role === 'guard')
    || (v === 'twins' && player.role === 'twin');
};

// 所有人都听到的：发言、事件、讣告和短的系统消息（序章长文不算）
export const publicLog = (state: GameState) => state.messages.filter((m) =>
  m.visibility === 'all' && (m.type === 'speech' || m.type === 'event' || m.type === 'death'
    || (m.type === 'system' && m.phase !== 'prologue' && m.content.length < 300)));

// 只有 TA（和同伴）听到的：密会、烙印者夜谈、能力结果。不含提示词和心里话
export const privateLog = (player: Player, state: GameState) =>
  state.messages.filter((m) => m.type !== 'prompt' && m.type !== 'thinking' && isOwnPrivate(m, player));

export const ownNotes = (player: Player, state: GameState) =>
  state.messages.filter((m) => m.type === 'thinking' && m.from === player.name);

// 按回合分段的记录
export function formatLog(messages: Message[]): string {
  let round = -1;
  const lines: string[] = [];
  for (const m of messages) {
    if (m.round !== undefined && m.round !== round) {
      round = m.round;
      lines.push(`\n— 第 ${round} 回合 —`);
    }
    lines.push(`[${PHASE_LABEL[m.phase ?? ''] ?? ''}] ${m.from}：${m.content}`);
  }
  return lines.join('\n').trim();
}

export const deathLines = (state: GameState) =>
  (state.deathLog ?? []).map((d) => `第 ${d.round} 回合${d.cause === 'night' ? '夜里' : '黄昏被献祭'}：${d.name}`);

export function voteLines(state: GameState, round?: number): string[] {
  const byRound = new Map<number, string[]>();
  for (const v of state.voteHistory) {
    if (v.round === undefined || (round !== undefined && v.round !== round)) continue;
    byRound.set(v.round, [...(byRound.get(v.round) ?? []), `${v.from}→${v.target}`]);
  }
  return [...byRound].map(([r, list]) => `第 ${r} 回合：${list.join('，')}`);
}

// 背誓者第 2 天才知道自己堕落
export const effectiveRole = (player: Player, round: number) =>
  player.role === 'heretic' && round < 2 ? 'innocent' : player.role;

// 只有 TA 自己知道的事：身份、同伴、能力得到的结果
export function secretLines(player: Player, state: GameState): string[] {
  const { round, players } = state;
  const status = (name: string) => (players.find((p) => p.name === name)?.isAlive ? '活着' : '已死');
  const role = effectiveRole(player, round);
  const lines = [`你的真实身份：${ROLE_NAME[role]}${role === 'marked' || role === 'heretic' ? '（收割一方）' : '（羔羊一方）'}`];

  if (role === 'marked') {
    const mates = players.filter((p) => p.role === 'marked' && p.name !== player.name);
    lines.push(`你的同类：${mates.map((p) => `${p.name}（${status(p.name)}）`).join('、')}`);
    if (round >= 2 && players.some((p) => p.role === 'heretic')) lines.push('你们感知到：羔羊中已有一人背誓，站在你们这边，但你们不知道是谁。');
  }
  if (role === 'heretic') {
    lines.push('第 1 夜之后你的灵魂堕落了。你不知道烙印者是谁，他们也不知道是你。聆心者现在会把你听成"污秽"。');
  }
  if (role === 'twin' && state.twinPair) {
    const partner = state.twinPair.twin1 === player.name ? state.twinPair.twin2 : state.twinPair.twin1;
    lines.push(`你的共誓者：${partner}（${status(partner)}），TA 绝对是羔羊。`);
  }
  if (role === 'listener') {
    lines.push(state.listenerChecks.length
      ? `你的倾听结果：\n${state.listenerChecks.map((c) => `  第 ${c.round} 夜：${c.target} —— ${c.isClean ? '清白' : '污秽'}（${status(c.target)}）`).join('\n')}`
      : '你还没有倾听过任何人。');
  }
  if (role === 'coroner') {
    lines.push(state.coronerReports.length
      ? `你尝到的灵魂：\n${state.coronerReports.map((r) => `  第 ${r.round} 回合被献祭的 ${r.target} —— ${r.isClean ? '清白' : '污秽'}`).join('\n')}`
      : '还没有人被献祭，你什么也没尝到。');
  }
  if (role === 'guard') {
    lines.push(state.guardRecords.length
      ? `你锁过的门：${state.guardRecords.map((g) => `第 ${g.round} 夜 ${g.target}`).join('、')}`
      : '你还没有锁过任何人的门。');
  }
  return lines;
}
