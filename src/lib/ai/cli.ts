/**
 * 山庄档案 CLI：AI 用 cli 工具查局面。只读，且只返回调用者有权知道的内容
 */

import type { GameState, Message, Player } from '@/types/game';
import { getActingPlayers } from '../actors';
import {
  APPEARANCE, deathLines, formatLog, formatSuspicion, ownNotes, ownSuspicion, privateLog, publicLog, secretLines, voteLines,
} from './view';

export const CLI_HELP = `山庄档案 —— 可用命令：
  help                         显示本说明
  status                       回合、阶段、存活者、死者、本阶段的行动顺序
  summary                      每个人一行：生死、最近两次公开发言（节选）、投过谁、被几人投过
  me                           你的身份和只有你知道的秘密
  players [名字]                所有人的外貌与生死；带名字时列出此人说过的全部公开发言和投票
  log [选项]                    你听到过的话（公开 + 你的私密），默认最近 30 条
      -r N    只看第 N 回合        -p 阶段  day | voting | night | meeting | event
      -f 名字  只看某人说的        -g 词    只看包含这个词的（如 -g 聆心者）
      -n N    最近 N 条（默认 30，all 为全部）
  votes [-r N]                 历次献祭投票明细与得票统计
  private                      只有你（和同伴）听到的话：密会、夜谈、能力结果
  notes                        你自己之前写下的心里话，以及你最新的怀疑名单
名字可以只写名或姓（如 诺拉、克劳利 不唯一时会提示）。`;

const MAX_OUTPUT = 6000;
const PHASE: Record<string, string> = {
  day: 'day', 白天: 'day', voting: 'voting', vote: 'voting', 黄昏: 'voting',
  night: 'night', 夜: 'night', meeting: 'secret_meeting', 密会: 'secret_meeting', event: 'event', 事件: 'event',
};

const clip = (text: string) => (text.length > MAX_OUTPUT ? `${text.slice(0, MAX_OUTPUT)}\n……（输出过长已截断，请用 -r / -f / -g / -n 缩小范围）` : text);

// 拆参数：支持 "带 空格" 的引号
const tokenize = (command: string) => [...command.matchAll(/"([^"]*)"|'([^']*)'|(\S+)/g)].map((m) => m[1] ?? m[2] ?? m[3]);

function flags(args: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    const key = args[i].replace(/^--?/, '');
    if (args[i].startsWith('-') && i + 1 < args.length) out[key[0]] = args[++i];
    else out._ = out._ ? `${out._} ${args[i]}` : args[i];
  }
  return out;
}

function findPlayer(state: GameState, query: string): Player | string {
  const hits = state.players.filter((p) => p.name === query || p.name.split('·').includes(query) || p.name.includes(query));
  if (hits.length === 1) return hits[0];
  return hits.length ? `"${query}" 不唯一：${hits.map((p) => p.name).join('、')}` : `没有叫 "${query}" 的人`;
}

function status(player: Player, state: GameState): string {
  const alive = state.players.filter((p) => p.isAlive);
  const order = getActingPlayers(state);
  const deaths = deathLines(state);
  return `第 ${state.round} 回合，阶段：${state.phase}${state.nightPhase && state.phase === 'night' ? `/${state.nightPhase}` : ''}
存活 ${alive.length} 人：${alive.map((p) => p.name).join('、')}
死者：${deaths.length ? `\n${deaths.join('\n')}` : '无'}
本阶段行动顺序：${order.map((p, i) => `${i + 1}.${p.name}${p.name === player.name ? '（你）' : ''}${i < state.currentPlayerIndex ? '✓' : ''}`).join(' ')}`;
}

/**
 * 众人立场摘要：每人最近两次公开发言的节选和投票，一眼看全场
 */
export function summary(state: GameState): string {
  const said = publicLog(state);
  return state.players.map((p) => {
    const recent = said.filter((m) => m.from === p.name).slice(-2)
      .map((m) => `第${m.round}回合「${m.content.replace(/\s+/g, ' ').slice(0, 70)}${m.content.length > 70 ? '…' : ''}」`);
    const votes = state.voteHistory.filter((v) => v.from === p.name).map((v) => `R${v.round}→${v.target}`);
    const against = state.voteHistory.filter((v) => v.target === p.name).length;
    return `${p.isAlive ? '·' : '✝'} ${p.name}｜${recent.join(' ') || '没说过话'}｜投票：${votes.join(' ') || '无'}｜被投 ${against} 次`;
  }).join('\n');
}

function players(player: Player, state: GameState, query?: string): string {
  if (!query) {
    return state.players.map((p) => `${p.isAlive ? '·' : '✝'} ${p.name}：${APPEARANCE[p.name] ?? p.occupation ?? ''}`).join('\n');
  }
  const target = findPlayer(state, query);
  if (typeof target === 'string') return target;
  const said = publicLog(state).filter((m) => m.from === target.name);
  const votes = state.voteHistory.filter((v) => v.from === target.name).map((v) => `第 ${v.round} 回合投 ${v.target}`);
  const against = state.voteHistory.filter((v) => v.target === target.name).map((v) => `第 ${v.round} 回合被 ${v.from} 投`);
  return `${target.name}（${target.isAlive ? '活着' : '已死'}）：${APPEARANCE[target.name] ?? ''}
【公开发言】\n${formatLog(said) || '（没说过话）'}
【TA 的投票】${votes.join('；') || '无'}
【投 TA 的票】${against.join('；') || '无'}`;
}

function log(player: Player, state: GameState, args: string[]): string {
  const f = flags(args);
  let messages: Message[] = [...publicLog(state), ...privateLog(player, state)].sort((a, b) => a.timestamp - b.timestamp);
  if (f.r) messages = messages.filter((m) => m.round === Number(f.r));
  if (f.p) {
    const phase = PHASE[f.p];
    if (!phase) return `未知阶段 "${f.p}"，可用：day voting night meeting event`;
    messages = messages.filter((m) => m.phase === phase);
  }
  if (f.f) {
    const who = findPlayer(state, f.f);
    if (typeof who === 'string') return who;
    messages = messages.filter((m) => m.from === who.name);
  }
  if (f.g) messages = messages.filter((m) => m.content.includes(f.g));
  if (f.n !== 'all') messages = messages.slice(-(Number(f.n) || 30));
  return formatLog(messages) || '（没有符合条件的记录）';
}

function votes(state: GameState, args: string[]): string {
  const round = flags(args).r ? Number(flags(args).r) : undefined;
  const lines = voteLines(state, round);
  if (!lines.length) return '还没有投过票。';
  const tally = new Map<string, number>();
  for (const v of state.voteHistory) {
    if (round === undefined || v.round === round) tally.set(v.target, (tally.get(v.target) ?? 0) + 1);
  }
  const ranking = [...tally].sort((a, b) => b[1] - a[1]).map(([name, n]) => `${name} ${n}`).join('，');
  return `${lines.join('\n')}\n累计得票：${ranking}`;
}

/**
 * 执行一条命令，返回给 AI 的文本
 */
export function runCli(command: string, player: Player, state: GameState): string {
  const [name, ...args] = tokenize(command.trim());
  const commands: Record<string, () => string> = {
    help: () => CLI_HELP,
    status: () => status(player, state),
    summary: () => summary(state),
    me: () => secretLines(player, state).join('\n'),
    players: () => players(player, state, args.join(' ') || undefined),
    log: () => log(player, state, args),
    votes: () => votes(state, args),
    private: () => formatLog(privateLog(player, state)) || '（没有只属于你的记录）',
    notes: () => [
      ownNotes(player, state).map((m) => `第 ${m.round} 回合：${m.content}`).join('\n') || '（你还没写过心里话）',
      ownSuspicion(player, state).length ? `【最新怀疑名单】\n${formatSuspicion(ownSuspicion(player, state))}` : '',
    ].filter(Boolean).join('\n\n'),
  };
  const run = commands[name ?? ''];
  return clip(run ? run() : `未知命令 "${name ?? ''}"。\n\n${CLI_HELP}`);
}
