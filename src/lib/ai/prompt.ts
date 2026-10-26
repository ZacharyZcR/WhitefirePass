/**
 * 每次决策的起始 prompt：规则、人设、秘密、本回合发生的事、这一步的任务。
 * 更早的记录不再整段塞进来，由 AI 用 cli 工具自己查
 */

import type { GameState, Player } from '@/types/game';
import { EMOTIONAL_STATE_PROMPTS } from '../emotional-prompts';
import { getActingPlayers, getLegalTargets } from '../actors';
import { CLI_HELP, summary } from './cli';
import {
  deathLines, effectiveRole, formatLog, formatSuspicion, isOwnPrivate, ownNotes, ownSuspicion, privateLog, publicLog, secretLines, voteLines,
} from './view';

const LINE = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

const PHASE_NAME: Record<string, string> = {
  day: '白天讨论', voting: '黄昏献祭投票', secret_meeting: '密会', listener: '深夜·聆心者倾听',
  'marked-discuss': '深夜·烙印者密谋', 'marked-vote': '深夜·烙印者决定猎物', guard: '深夜·设闩者守门',
};

function rulesBlock(state: GameState): string {
  const hasHeretic = state.players.some((p) => p.role === 'heretic');
  return `【山灵的契约 —— 你所知道的规则】
- 十五人中藏着 3 名烙印者。他们夜里互相认得，共同决定杀死一人。
${hasHeretic ? '- 还有 1 名背誓者：第 1 天他还是普通人，第 2 天起灵魂堕落，暗中帮烙印者，但他和烙印者互不相识。\n' : ''}- 其余是羔羊：聆心者（每夜倾听一人，得知其灵魂清白或污秽）、食灰者（得知每次被献祭者的灵魂颜色）、设闩者（每夜锁住一人的门使其免死，不能锁自己，不能连续两夜锁同一人）、两名共誓者（彼此知道对方是羔羊）、无知者（没有能力）。
- 每天：讨论 → 黄昏投票，得票最多者被献祭（平票则平票者之外的人再讨论，再投一次，只能投平票者；再平则无人被献祭）。
- 羔羊献祭掉所有烙印者与背誓者即胜；烙印者一方人数不少于羔羊时，收割完成。
- 能力都是暗中的。任何人都可以谎称自己有某种能力。`;
}

function selfBlock(player: Player): string {
  const emotional = player.emotionalState && player.emotionalState !== 'normal'
    ? EMOTIONAL_STATE_PROMPTS[player.name]?.[player.emotionalState] ?? ''
    : '';
  return `【你是 ${player.name}】
${player.personality ?? '你是一个普通的旅人，凭直觉和理性生存。'}
${emotional ? `\n【你此刻的心境】\n${emotional}` : ''}`;
}

function strategyBlock(player: Player, state: GameState): string {
  const others = state.players.filter((p) => p.isAlive && p.name !== player.name).length;
  const harvest = state.players.filter((p) => p.role === 'marked' || p.role === 'heretic').length;
  const common = `【怎样推理 —— 你这一方要赢，不只是自己苟活】
- 先算账：收割一方一共 ${harvest} 人，你身边还活着 ${others} 人。随便指一个人，他是收割者的先验概率只有大约 ${Math.round((harvest / others) * 100)}%（死去的人里若有收割者还会更低）。没有像样的证据，就不要把一个人当成怪物。
- 证据分轻重，别把轻的当重的：
  · 重：聆心者/食灰者的结果、与可验证事实冲突的能力声明、两人对跳同一个独一无二的能力（必有一人在撒谎）。
  · 中：投票站队（谁和谁总投在一起、谁在关键时刻救了谁、谁在最后一刻改票跟风）、谁的死对谁有利（夜里被杀的人生前在怀疑谁）。
  · 轻：口误、记错名字、紧张、说话难听、性格可疑。羔羊也会犯这些错，单凭这些投人，多半烧的是自己人。
- 警惕一边倒：烙印者最爱顺着一个现成的靶子把票堆上去。当大家都在骂同一个人时，问自己：最先把火点起来、最卖力添柴的是谁？他图什么？跟风的人里谁其实没给出自己的理由？
- 能力声明要成对看：同一个能力只有一人。有人自称聆心者，就看谁出来对跳、谁的结果和死者身份/投票对得上；第一天说自己没能力、后来又冒出能力的，要特别警觉（背誓者第 2 天才堕落）。
- 形成你自己的判断，再看别人怎么说；不同意就说不同意，并说出理由。不要因为前面几个人都怀疑谁，你就跟着怀疑谁。`;
  const tips: Record<string, string> = {
    marked: `- 上面是羔羊会用的推理方法，你要反过来利用它：给他们一个看似"重"的假证据，比假的能力声明更有效。
- 夜里优先杀掉已经公开、或明显像聆心者/设闩者的人；也可以杀让羔羊彼此猜疑的人。
- 白天像羔羊一样推理和指控。可以谎称自己是聆心者并报出假的倾听结果，来对抗真正的聆心者。
- 同伴之间不要一起出现在同一边，不要投票整齐划一；同伴快藏不住时，跟着投他也许能保住你自己。`,
    heretic: `- 上面是羔羊会用的推理方法，你要反过来利用它，但小心：你第 1 天的发言已经被所有人记住了。
- 你的价值在白天：搅乱推理，替可能的烙印者开脱，把票引向有能力的羔羊。
- 最强的一招是抢先谎称聆心者，报一个"污秽"给真正有威胁的人。被聆心者查到你就完了，所以要先发制人。`,
    listener: `- 你的结果是羔羊最可靠的信息，死在你手里而没说出去就毫无价值。
- 听到"污秽"时应当尽快公开，带着大家投他；结果都是清白时，可以先藏一两天，但别藏到死。
- 公开后你会成为猎物，要预先把已知结果全部说清楚。`,
    coroner: `- 你的结果能告诉大家昨天献祭得对不对，并且能验证某个自称聆心者的人说的是否属实。
- 结果与某人的说法矛盾时，那就是最强的证据，要说出来。`,
    guard: `- 优先锁已经公开身份、又最可信的聆心者；不确定时，锁白天最有说服力、最可能被盯上的羔羊。
- 不要轻易公开自己，你一旦死了，羔羊就失去夜里唯一的保护。`,
    twin: `- 你和共誓者互相担保，是羔羊最早能抱成团的核心。适当时候公开彼此，能为大家排除两个人。
- 如果有人冒充共誓者，你一眼就能拆穿。`,
    innocent: `- 你没有能力，但你的票和推理和任何人一样重要。
- 盯住那些自称有能力的人，比较他们的说法；冒充者迟早会露出马脚。`,
  };
  return `${common}\n【你这个身份的打法】\n${tips[effectiveRole(player, state.round)] ?? ''}`;
}

// 本回合发生的事直接给出；更早的让 AI 自己用 cli 查
function nowBlock(player: Player, state: GameState): string {
  const alive = state.players.filter((p) => p.isAlive);
  const deaths = deathLines(state);
  const votes = voteLines(state);
  const thisRound = [...publicLog(state), ...privateLog(player, state)]
    .filter((m) => m.round === state.round)
    .sort((a, b) => a.timestamp - b.timestamp);
  const lastNote = ownNotes(player, state).at(-1);
  const suspicion = ownSuspicion(player, state);
  return `【现在】第 ${state.round} 回合，存活 ${alive.length} 人：${alive.map((p) => p.name).join('、')}
【死者】${deaths.length ? `\n${deaths.join('\n')}` : '还没有人死去。'}
【历次献祭投票】${votes.length ? `\n${votes.join('\n')}` : '还没有投过票。'}

【众人立场摘要】（每人最近两次发言节选和投票；要看原话全文再用 cli 查）
${summary(state)}

【本回合你听到的话】
${formatLog(thisRound) || '（本回合还没有人开口）'}
${lastNote ? `\n【你上一次的心里话（第 ${lastNote.round} 回合）】\n${lastNote.content}` : ''}
${suspicion.length ? `\n【你上一次的怀疑名单】（根据新情况更新它：有新证据就改，没有就别轻易推翻）\n${formatSuspicion(suspicion)}` : ''}`;
}

function taskBlock(player: Player, state: GameState): string {
  const targets = getLegalTargets(state, player)?.map((p) => p.name);
  const order = getActingPlayers(state);
  const position = order.findIndex((p) => p.name === player.name);
  const spoken = position > 0 ? `在你之前已经发言的：${order.slice(0, position).map((p) => p.name).join('、')}。` : '你是第一个开口的人。';
  const lastNight = (state.deathLog ?? []).filter((d) => d.cause === 'night' && d.round === state.round - 1).map((d) => d.name);
  const pick = `target 必须是下列之一：${targets?.join('、')}。speech 留空。`;

  if (state.phase === 'secret_meeting') {
    const [a, b] = state.pendingSecretMeeting?.selectedParticipants ?? ['', ''];
    const other = a === player.name ? b : a;
    const replied = state.messages.some((m) => m.type === 'secret' && m.from === other && m.round === state.round && isOwnPrivate(m, player));
    return `【此刻：与 ${other} 的密会】
没有第三个人在场。你们各说一次话。${replied ? `${other} 已经说完了（见本回合记录），你来回应。` : `你先开口，${other} 会听完再回应。`}
你可以试探、结盟、交换（真或假的）情报，也可以设下圈套。
speech：对 ${other} 说的话，80~150 字。target 留空。`;
  }

  if (state.phase === 'day') {
    const revote = state.isRevote ? `\n刚才的投票平票了（${state.tiedPlayers.join('、')}），他们不能发言。接下来只能在他们之中投票，你要说清楚该献祭谁、为什么。` : '';
    return `【此刻：白天讨论】${state.round > 1 ? `\n昨夜${lastNight.length ? `，${lastNight.join('、')} 死了` : '，没有人死去'}。` : ''}${revote}
${spoken}黄昏就要投票。
speech：你对所有人说的话，100~200 字。要回应前面的人说过的具体内容，给出你怀疑或信任谁及理由；需要时可以公开（或谎称）身份与情报。不要说"我们要冷静""大家要团结"这类空话。target 留空。`;
  }

  if (state.phase === 'voting') {
    return `【此刻：黄昏献祭投票】
每个人都要把献祭石放在一个人面前。想清楚今天谁最可疑，你投的票会被所有人记住。
${pick}`;
  }

  const killable = state.players.filter((p) => p.isAlive && p.role !== 'marked').map((p) => p.name);
  const night: Record<string, string> = {
    listener: `【此刻：深夜，你可以倾听一个灵魂】
选一个你最需要知道真相的人：白天立场最摇摆的、自称有能力的、或者你明天打算押上信誉去指认的人。
${pick}`,
    'marked-discuss': `【此刻：深夜，与同类密谋】${state.revoteRound ? `\n上一次你们的意见没有统一（第 ${state.revoteRound} 次分歧），这次必须达成一致。` : ''}
只有活着的烙印者能听到。分析谁对你们威胁最大（聆心者？设闩者可能锁谁？），提出今晚的猎物和明天白天的打算（要不要有人假冒聆心者、要把票引向谁）。
speech：对同类说的话，80~150 字。target 留空（猎物写在 speech 里，可选：${killable.join('、')}）。`,
    'marked-vote': `【此刻：深夜，决定猎物】
参考同类刚才的意见。票数分散会浪费这一夜。
${pick}`,
    guard: `【此刻：深夜，你可以锁住一扇门】
${state.lastGuardedPlayer ? `昨夜你锁了 ${state.lastGuardedPlayer} 的门，今晚不能再锁。` : ''}猜烙印者今晚会扑向谁。
${pick}`,
  };
  return night[state.nightPhase ?? ''] ?? '';
}

/**
 * Build the opening prompt for an AI player's decision
 */
export function buildPrompt(player: Player, gameState: GameState): string {
  const phase = gameState.phase === 'night' ? gameState.nightPhase ?? 'night' : gameState.phase;
  return [
    `${LINE}\n【白烬山口 · 寂静山庄 · 第 ${gameState.round} 回合 · ${PHASE_NAME[phase] ?? phase}】\n${LINE}`,
    '1913 年深冬。暴雪封山，壁炉里烧着不发热的苍白火焰。你和另外十四人被困在这里。这不是游戏，是你的生死。',
    rulesBlock(gameState),
    selfBlock(player),
    `【只有你知道的秘密】\n${secretLines(player, gameState).join('\n')}`,
    strategyBlock(player, gameState),
    nowBlock(player, gameState),
    taskBlock(player, gameState),
    `【你怎么行动】
你有两个工具：
1. cli(command)：查阅山庄档案。上面已有本回合的话和众人立场摘要；要核对某人的原话、找前后矛盾时再查，挑最关键的一两条查，不必把每个人都翻一遍。
   比如：players 某人（他说过的全部原话）、log -g 聆心者（所有自称能力的话）、log -r 2 -p day（某一天的全部讨论）。
${CLI_HELP.split('\n').map((l) => `   ${l}`).join('\n')}
2. submit(thinking, speech, target, suspicion)：查完之后提交你的决定，一次行动只提交一次。
   - thinking：你的推理过程，300~500 字，只有你自己看得到。这里不用演，冷静地想：现有证据各有多重、哪些人的说法和投票对得上或对不上、谁在带节奏、你的结论和把握有多大、下一步怎么做。
   - speech：别人能听到的话（要求见上）。这里才是 ${player.name} 开口：用 TA 的身份、处境和情绪说话，像 1913 年的人。人设里的口头禅和小动作偶尔点缀即可，不要每句都用；话的分量要落在推理和立场上。
   - target：要求见上，不需要时留空。
   - suspicion：你对其他活着的人的怀疑名单，至少列出你最怀疑和最信任的几位，每人给出"是收割者的可能性"（0~100）和一句理由。数字要和证据的分量相称；下次行动时你会看到这份名单。
- 不要提到"游戏""玩家""AI""狼人"这类词；山灵、烙印者、羔羊、献祭石是这个世界里的说法，可以用。
- 永远不要在 speech 里泄露 thinking 中不打算公开的秘密。`,
  ].filter(Boolean).join('\n\n');
}
