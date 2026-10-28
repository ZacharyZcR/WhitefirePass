/**
 * 角色会话：每个角色一个持续的对话。
 *
 *   system    开场——人设、自传、用戏里的话讲的身份、自己记得的罪（烙印者还有山灵告诉他的真相）、说话约定。
 *             只放开局就定下的东西，整局不变，DeepSeek 的前缀缓存才能命中。
 *   之后       先是第七天清晨那场固定的争吵，再按时间顺序：他听到的话（user）、他自己说过的话（assistant）。从 gameState.messages 按可见性现场重建，只追加。
 *   最后一句   "轮到你了"——山灵的发问或叙述者的提示，加上此刻会变的东西（心境）。
 *
 * 角色只输出纯文本：先用全角括号写心里话，再写说出口的话。
 */

import type { GameState, Message, Player } from '@/types/game';
import { getCharacterAutobiographies } from '../character-autobiographies';
import { EMOTIONAL_STATE_PROMPTS } from '../emotional-prompts';
import { getActingPlayers, getLegalTargets, mentions } from '../actors';
import { getRelationshipsForCharacter } from '../relationships';
import { sinsAgainst, sinsBy } from '../sins';
import { sacrificeQuorum } from '../game-engine';
import { VOICES } from '../voices';
import { DEBT_TIES, HATRED } from '../hatred';
import { DAY_SEVEN } from '../day-seven-script';
import { isOwnPrivate } from './view';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const PHASE_LABEL: Record<string, string> = {
  day: '白天', voting: '黄昏', night: '夜里', event: '异事',
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 开场 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const WORLD = `1913年深冬，白烬山口，寂静山庄。

一份神秘的委托书把你们十五个陌生人聚到了这里。第二天，委托人没有出现，暴风雪封死了下山的所有道路。第三天，你们在地窖里发现了一封遗书：

"山灵警告：你们之中混入了三个非人者。它们会在夜晚猎杀真正的人类。你们必须在白昼找出这三个非人者并献祭，否则所有人都会死。"
"在收割与羔羊的对抗结束之前，暴风雪永远不会停止。"

壁炉里烧着不发热的苍白火焰。你们已经在这里困了七天，彼此早就照过面，只是谁也没跟谁好好说过话。前六天里还没有人死去。食物快吃完了，你们决定照遗书说的做——从今天起，就是献祭的第一日：每天黄昏，每个人把一块献祭石放在一个人面前，石头最多的那个人会被推进白火里。不想放的可以不放；可石头要是太散，白火就不收——那一天谁也不死，夜里的东西照样出来。

山庄里流传着一些说法：有人能在夜里听见一个人灵魂的颜色；有人能在梦里尝出被献祭者的灰是干净还是污浊；有人握着山庄里唯一一根能从门外闩上的门闩；还有两个人第一夜就认出了彼此是干净的。可这些谁都能自称。据说遗书最末还有一行被水洇开的字：第二天，会有一个人背弃你们。`;

const SPEAKING = `你就是这个人，活在这间屋子里。每次轮到你，先用全角括号写下你此刻心里真正在想的——只有你自己知道，别人听不见——然后写你说出口的话。括号里只写你脑子里的念头，用"我"来想；不要写动作、神态，也不要写旁白。
照你说话的样子开口：自称、怎么叫别人，从头到尾都是你自己的。口头禅是偶尔漏出来的，一场话里冒一次就够，别句句都带；那几句例句只是让你知道腔调，一个字也别照抄。别学旁人的腔调。
说人话。这是一群又冷又饿、吓得睡不着的人挤在火堆边上，不是在开庭，不是在辩论，也不是在写文章：大白话，会说半截、会重复、会改口，会"呃""那个""啊？"，会被别人的话带跑。不要每次都讲一番道理，不要总结陈词，不要排比，不要拿一句漂亮话收尾。可以抱怨冷、抱怨饿、发牢骚、开个不合时宜的玩笑、说句蠢话、问点跟这事不相干的。别把遗书上的规矩挂在嘴边算账——你是怕死的人，不是在玩游戏的人；除非你本来就是那种人，否则也别像侦探一样盘问别人。
心里话可以多写——你在怀疑谁、怕什么、盘算什么、想起了谁、哪句话刺到了你，想到哪写到哪，三五句、一小段都行。说出口的话却要短：十几个人围着火堆，没有人会一口气讲一大段。通常一句，最多两句；可以答非所问，可以只是叹一口气，也可以什么都不说，只写"……"。
你不必同意任何人，但怎么不同意是你自己的事：有人当面顶回去，有人冷笑，有人不吭声，有人只是攥紧手里的东西。不要写旁白，不要替别人说话，不要给自己的话加引号。`;

/** 用戏里的话讲身份：开局那一刻他知道什么 */
function identity(player: Player, state: GameState): string {
  const others = (role: string) => state.players.filter((p) => p.role === role && p.name !== player.name).map((p) => p.name);
  switch (player.role) {
    case 'marked':
      return `困在这里的第三天夜里——地窖里找到遗书的那一夜——所有人都睡下了，白火没有熄。它叫醒了你，在你手背上烙下一个印记，把真相告诉了你。火边还站着另外两个人，手背上是同样的印记：${others('marked').join('、')}。你们对上了眼神，从那一夜起就知道彼此是什么。你们不是遗书里说的"人"了——你们就是那三个非人者。白天，你得和别人一样害怕、一样怀疑；夜里，你们会聚在一起，决定让谁再也醒不过来。`;
    case 'listener':
      return '山灵在你身上留了一道烙印。夜里，你能去听一个人灵魂的颜色——清白，或者污秽。这件事没有人知道。';
    case 'coroner':
      return '每当有人被推进白火，那天夜里你会在梦里尝到他的灰——干净的，或者污浊的。这件事没有人知道。';
    case 'guard':
      return '你手里有山庄里唯一一根能从门外闩上的门闩。每天夜里你可以闩上一扇门，门后的人就能活到天亮。你不能闩你自己的门，也不能连着两夜闩同一扇。这件事没有人知道。';
    case 'twin':
      return `第一夜你醒来时，看见${others('twin').join('、')}额头上有一道和你一样的微光。你们知道彼此是干净的——在这座山庄里，这是唯一能确定的事。`;
    default:
      // 无知者，以及还没堕落的背誓者：开局时他们都只是人
      return '你身上没有任何印记。你是人——你是这么相信的。';
  }
}

export function opening(player: Player, state: GameState): string {
  const chapters = getCharacterAutobiographies(player.name).map((c) => `《${c.title}》\n${c.content}`).join('\n\n');
  const deeds = sinsBy(player.name).map((s) => s.deed);
  const truths = player.role === 'marked' ? sinsAgainst(player.name).map((s) => s.truth) : [];
  // 第三夜之后，烙印者对债主的旧印象都翻了过来
  const debts = player.role === 'marked' ? DEBT_TIES[player.name] ?? {} : {};
  const known = getRelationshipsForCharacter(player.name)
    .filter((r) => r.known)
    .map((r) => `${r.target}：${r.known}${debts[r.target] ? `——第三夜之后：${debts[r.target].line}` : ''}`);
  // 原来不相熟的债主也要写上；其余的人，第三夜之后心如磐石
  const strangers = Object.entries(debts).filter(([t]) => !known.some((k) => k.startsWith(`${t}：`)));
  if (player.role === 'marked') {
    known.push(...strangers.map(([t, d]) => `${t}：第三夜之后：${d.line}`));
    known.push('第三夜之后，你的心像石头一样硬了：除了欠你的人，这屋里谁的死活都不再牵动你。');
  }
  return [
    WORLD,
    `你是${player.name}。\n\n${player.personality ?? ''}`,
    VOICES[player.name] && `你说话的样子：\n${VOICES[player.name]}`,
    chapters && `这些是你的过去。你记得，但不一定会说出来：\n\n${chapters}`,
    known.length ? `这座山庄里你认得的人。你护着谁、躲着谁、恨谁，由你自己的心决定：\n${known.join('\n')}` : '',
    identity(player, state),
    deeds.length ? `你心底还记得、从没对任何人说过的事：\n${deeds.join('\n')}` : '',
    truths.length ? `白火烙下印记的那一刻，山灵把真相告诉了你——欠你的人，就在这座山庄里：\n${truths.join('\n')}` : '',
    player.role === 'marked' && HATRED[player.name] ? `那一夜之后，你心里多了这些：\n${HATRED[player.name]}` : '',
    SPEAKING,
  ].filter(Boolean).join('\n\n');
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 他听到的、他说过的 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const playerNames = (state: GameState) => new Set(state.players.map((p) => p.name));

/** 别人说的话、发生的事，写成他耳朵里听到的样子 */
function heard(m: Message, names: Set<string>): string {
  const text = m.content.replace(/\*\*/g, '');
  if (m.from === '山灵') return `山灵在你耳边说：${text}`;
  if (!names.has(m.from)) return text; // 叙述者、系统
  if (m.type === 'vote') return `${m.from}${m.quote ? `说："${m.quote}"——` : ''}把献祭石放在了${text}面前。`;
  if (names.has(text.trim())) return `${m.from}${m.quote ? `说："${m.quote}"——` : ''}选了${text}。`;
  return `${m.from}：${text}`;
}

/** 自己说过的话：心里话放回括号里 */
function said(m: Message, thought: string | undefined, names: Set<string>): string {
  const inner = thought ? `（${thought.split('\n\n【怀疑名单】')[0]}）` : '';
  const words = m.quote ?? (names.has(m.content.trim()) ? `……${m.content}。` : m.content);
  return `${inner}${words}`;
}

/** 从消息记录重建他的对话：只追加，合并相邻同角色的消息 */
export function history(player: Player, state: GameState): ChatMessage[] {
  const names = playerNames(state);
  const out: ChatMessage[] = [];
  const push = (role: 'user' | 'assistant', content: string) => {
    const last = out[out.length - 1];
    if (last?.role === role) last.content += `\n\n${content}`;
    else out.push({ role, content });
  };
  let scene = '';
  let thought: string | undefined;

  // 第七天清晨那场争吵（固定剧情）：每个人都在场，自己说过的话回到"他说过的"一侧
  push('user', '—— 第七天 · 清晨，大厅 ——');
  for (const l of DAY_SEVEN) {
    if (l.speaker === player.name) push('assistant', l.line);
    else push('user', l.speaker === '叙述者' ? l.line : `${l.speaker}：${l.line}`);
  }

  for (const m of state.messages) {
    if (m.phase === 'prologue' || m.type === 'prompt') continue;
    if (m.type === 'thinking') {
      if (m.from === player.name) thought = m.content;
      continue;
    }
    const mine = m.from === player.name;
    if (!mine && m.visibility !== 'all' && !isOwnPrivate(m, player)) continue;

    const here = `献祭第${m.round}日 · ${PHASE_LABEL[m.phase ?? ''] ?? ''}`;
    if (here !== scene) {
      scene = here;
      push('user', `—— ${here} ——`);
    }
    if (mine) {
      push('assistant', said(m, thought, names));
      thought = undefined;
    } else {
      push('user', heard(m, names));
    }
  }
  return out;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 轮到你了 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** 山灵的发问或叙述者的提示：轮到他做什么 */
export function cue(player: Player, state: GameState): string {
  const legal = getLegalTargets(state, player)?.map((p) => p.name);
  const before = getActingPlayers(state)[state.currentPlayerIndex - 1];
  const lastWords = before && state.messages.findLast((m) => m.type === 'speech' && m.from === before.name)?.content;
  const calledOut = Boolean(lastWords && mentions(lastWords, state.players.map((p) => p.name)).includes(player.name));
  const after = before ? (calledOut ? `${before.name}刚才说到了你，` : `${before.name}说完了，`) : '';

  const mourner = state.mourners?.find((m) => m.name === player.name);
  if (mourner) {
    const how = mourner.cause === 'night' ? '昨夜死在了自己的房里' : '刚刚被推进白火，烧成了灰';
    return `（${mourner.dead}${how}。你心里有什么东西变了。大厅里没人说话——你开口了，只说一句。）`;
  }
  if (state.phase === 'voting' && state.lastWords) {
    if (player.name === state.lastWords) {
      return `（献祭石最多的是你。白火就在你身后，所有人都看着你，没有谁会来拉你一把。这是你最后能说的话——咒骂、求饶、冷笑、平静，或者说出一个藏了一辈子的秘密，都由你。${after}）`;
    }
    return `（${state.lastWords}就要被推进白火了。${calledOut ? `${state.lastWords}刚才冲你说了话。` : `你往${state.lastWords}面前放过石头，或者你有话要对${state.lastWords}说。`}这是最后能对他说话的时候。）`;
  }
  if (state.phase === 'night' && state.nightPhase === 'listener' && !legal) {
    const check = state.listenerChecks.find((c) => c.round === state.round);
    return `（你听见了${check?.target}的灵魂——${check?.isClean ? '清白' : '污秽'}的。你一个人醒在黑暗里，说什么都没有人听得见。）`;
  }
  if (state.phase === 'day' && state.isGathering) {
    return `（第一日，自我介绍。你们在山庄里一起困了七天，却从没坐下来好好认识过彼此。十五个人围着壁炉，按座次轮流说说自己：你是谁，做什么的，为什么会接下那份委托——说多少、说不说真话，由你。今天不投票，但每个人都在听。${before ? `${before.name}介绍完了，` : '你是第一个。'}轮到你了。）`;
  }
  if (state.phase === 'day') {
    const revote = state.isRevote
      ? `刚才的献祭石平分在${state.tiedPlayers.join('和')}面前，他们不许再开口。黄昏时只能在他们之中选一个。`
      : '白天，离黄昏还早，献祭石还没发下来。说说你心里的疑问、你注意到的事、你信谁不信谁——石头放给谁，留到黄昏再说。';
    return `（${revote}${after}大厅里的人看向你。）`;
  }
  if (state.phase === 'voting' && !state.ballot) {
    return `（黄昏。献祭石还没发下来，可每个人都知道它会落在谁面前——这是放石头之前最后能开口的时候。说说你打算把石头放在谁面前、为什么；或者，替自己辩护。${after}轮到你了。）`;
  }
  if (state.phase === 'voting') {
    return `山灵：黄昏了。献祭石握在你手里，冰凉。你把它放在谁面前？\n（可以放在：${legal?.join('、')}；也可以不放。最多的人不到${sacrificeQuorum(state)}块，今天就没有人被献祭。所有人同时放下石头，谁也看不到别人放在哪——只写你自己放下石头时说的话。）`;
  }
  if (state.phase === 'night') {
    const alone = '你一个人醒在黑暗里，说什么都没有人听得见——对自己说，对死去的人说，对山灵说，都行。';
    if (state.nightPhase === 'listener') return `山灵：夜深了，你的烙印在发烫。今夜，你要去听谁的灵魂？\n（${alone}可以去听：${legal?.join('、')}）`;
    if (state.nightPhase === 'marked-discuss') {
      return `山灵：（只有带着印记的人听得见）夜深了，饥饿醒了。你们聚在黑暗里，说说今夜去找谁——你想要谁，为什么；同类说得不对，就顶回去。${after ? `（${after}轮到你了。）` : ''}`;
    }
    if (state.nightPhase === 'coroner') return `（灰的味道还留在你舌头上。${alone}）`;
    if (state.nightPhase === 'marked-vote') return `山灵：决定吧。今夜是谁？\n（可以去找：${legal?.join('、')}）`;
    if (state.nightPhase === 'guard') return `山灵：走廊很黑，门闩在你手里。今夜，你闩上谁的门？\n（${alone}可以闩：${legal?.join('、')}）`;
  }
  return '（轮到你了。）';
}

/** 此刻会变的东西：心境 */
function mood(player: Player): string {
  const state = player.emotionalState;
  return state && state !== 'normal' ? EMOTIONAL_STATE_PROMPTS[player.name]?.[state] ?? '' : '';
}

/** 一次决策要发给模型的完整会话 */
export function buildSession(player: Player, state: GameState): ChatMessage[] {
  const tail = [mood(player), cue(player, state)].filter(Boolean).join('\n\n');
  const messages: ChatMessage[] = [{ role: 'system', content: opening(player, state) }, ...history(player, state)];
  const last = messages[messages.length - 1];
  if (last.role === 'user') last.content += `\n\n${tail}`;
  else messages.push({ role: 'user', content: tail });
  return messages;
}

/** 给提示词查看器看的文字版 */
export function renderSession(player: Player, state: GameState): string {
  const label = { system: '【开场】', user: '【他听到的】', assistant: '【他说过的】' } as const;
  return buildSession(player, state).map((m) => `${label[m.role]}\n${m.content}`).join('\n\n━━━━━━━━━━━━━━━━━━━━\n\n');
}

/**
 * 拆开回复：括号里的都是心里话或动作（不出声），其余是说出口的话。
 * 模型偶尔在台词中间再插一段括号，也一并挪回心里，台词里只留出声的部分。
 * 模型有时会换成方括号、【】、〔〕写心里话，同样当作括号处理（书名号不算：台词里会提到书名）
 */
const OPEN = '（(\\[【〔［';
const CLOSE = '）)\\]】〕］';
const PAIRED = new RegExp(`[${OPEN}]([^${OPEN}${CLOSE}]*)[${CLOSE}]`, 'g');
const UNCLOSED = new RegExp(`^\\s*[${OPEN}]([^\\n]*)\\n`);

export function parseUtterance(text: string): { thinking: string; speech: string } {
  const inner: string[] = [];
  const speech = text
    .replace(PAIRED, (_, part: string) => {
      inner.push(part.trim());
      return '';
    })
    // 开头的括号忘了合上：到第一个换行为止都算心里话
    .replace(UNCLOSED, (_, part: string) => {
      inner.push(part.trim());
      return '';
    })
    .replace(/^[ \t]*[“"]([^“”"\n]*)[”"][ \t]*$/gm, '$1') // 整句套了引号的，去掉引号
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return { thinking: inner.filter(Boolean).join('\n'), speech };
}
