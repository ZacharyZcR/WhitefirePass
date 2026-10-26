/**
 * DeepSeek 官方 API（OpenAI 兼容格式）驱动 AI 旅者
 * 白烬山口 (Whitefire Pass) - AI驱动系统
 *
 * 每次决策是一个工具调用循环（不限轮数）：
 *   AI 读起始 prompt → 用 cli 工具查山庄档案（可多次）→ 用 submit 工具提交 { thinking, speech, target }
 *   target 不合法会被打回重交
 */

import type { GameState, Player, SuspicionEntry } from '@/types/game';
import { getLegalTargets } from './actors';
import { runCli } from './ai/cli';
import { buildPrompt } from './ai/prompt';

export { buildPrompt };

interface LLMConfig {
  apiKey: string;
  apiUrl?: string;
  model?: string;
  onRetry?: (info: { attempt: number; maxRetries: number; delay: number; reason: string }) => void;
}

export interface AIReply {
  thinking: string;
  speech: string;
  target: string | null; // 已校验过的合法目标；这一步不需要选人时为 null
  trace: string; // 这次决策里调过的 cli 命令和结果，给提示词查看器看
  suspicion: SuspicionEntry[]; // 这次给出的怀疑名单
}

interface ToolCall {
  id: string;
  type: 'function';
  function: { name: string; arguments: string };
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  reasoning_content?: string;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
}

export const DEFAULT_API_URL = 'https://api.deepseek.com';
export const DEFAULT_MODEL = 'deepseek-flash'; // DeepSeek V4.1 Flash，和 Paseo 用的同一个
const REASONING_EFFORT = 'high'; // none / low / high / max
const MAX_RETRIES = 6;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const backoff = (attempt: number) => Math.min(1000 * 2 ** attempt, 8000);
const isRetryable = (status: number) => status === 429 || status >= 500;

class FatalError extends Error {}

async function chat(config: LLMConfig, body: Record<string, unknown>): Promise<ChatMessage> {
  const url = `${(config.apiUrl || DEFAULT_API_URL).replace(/\/+$/, '')}/chat/completions`;
  let lastError: Error = new Error('API 请求失败');

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.apiKey}` },
        body: JSON.stringify({ model: config.model ?? DEFAULT_MODEL, ...body }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: { message?: string } };
        const message = data.error?.message ?? `HTTP ${response.status}`;
        if (!isRetryable(response.status)) throw new FatalError(message);
        throw new Error(`HTTP ${response.status}: ${message}`);
      }

      const data = (await response.json()) as { choices?: Array<{ message?: ChatMessage }> };
      const message = data.choices?.[0]?.message;
      if (!message || (!message.content && !message.tool_calls?.length)) throw new Error('AI 响应为空');
      return message;
    } catch (error) {
      if (error instanceof FatalError) throw error;
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt === MAX_RETRIES) break;
      const delay = backoff(attempt);
      config.onRetry?.({ attempt: attempt + 1, maxRetries: MAX_RETRIES, delay, reason: lastError.message });
      await sleep(delay);
    }
  }
  throw lastError;
}

/**
 * Test if the API key is valid
 */
export async function testApiKey(apiKey: string, apiUrl?: string): Promise<boolean> {
  try {
    await chat({ apiKey, apiUrl }, { messages: [{ role: 'user', content: '回复"在"。' }], max_tokens: 8, reasoning_effort: 'none' });
    return true;
  } catch {
    return false;
  }
}

function tools(targets: string[] | null) {
  return [
    {
      type: 'function',
      function: {
        name: 'cli',
        description: '查阅山庄档案（只读）。可用命令：help、status、summary、me、players [名字]、log [-r 回合] [-p 阶段] [-f 名字] [-g 关键词] [-n 条数]、votes [-r 回合]、private、notes。',
        parameters: {
          type: 'object',
          properties: { command: { type: 'string', description: '例如：status、players 诺拉、log -r 2 -p day、log -g 聆心者、votes' } },
          required: ['command'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'submit',
        description: '提交这一步的最终决定。一次行动只调用一次。',
        parameters: {
          type: 'object',
          properties: {
            thinking: { type: 'string', description: '推理过程，300~500 字，只有自己看得到' },
            speech: { type: 'string', description: '别人能听到的话；这一步不需要说话时留空' },
            target: targets
              ? { type: 'string', enum: targets, description: '选中的人' }
              : { type: 'string', description: '这一步不需要选人，留空' },
            suspicion: {
              type: 'array',
              description: '对其他活着的人的怀疑名单',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string', description: '人名' },
                  p: { type: 'number', description: '是收割者的可能性，0~100' },
                  why: { type: 'string', description: '一句理由' },
                },
                required: ['name', 'p', 'why'],
              },
            },
          },
          required: ['thinking', 'speech', 'target', 'suspicion'],
        },
      },
    },
  ];
}

/**
 * 在候选名字里找到回复指的那个人：全名优先，其次是唯一的名或姓。
 * 写了候选之外某人的全名（比如自己、死者）就是不合法，不再按姓去猜——否则"莉迪亚·克劳利"会被认成同姓的托马斯
 */
function matchName(text: string, names: string[], everyone: string[] = names): string | null {
  if (!text) return null;
  const exact = names.find((n) => text.trim() === n);
  if (exact) return exact;
  const full = names.filter((n) => text.includes(n));
  if (full.length === 1) return full[0];
  if (everyone.some((n) => text.includes(n))) return null;
  const parts = names.filter((n) => n.split('·').some((part) => part.length >= 2 && text.includes(part)));
  return parts.length === 1 ? parts[0] : null;
}

interface Args {
  command?: string;
  thinking?: string;
  speech?: string;
  target?: string;
  suspicion?: unknown;
}

const parseArgs = (raw: string): Args => {
  try {
    return JSON.parse(raw) as Args;
  } catch {
    return {};
  }
};

// 模型没走工具、直接回了 JSON 文本时的兜底
const parseText = (text: string): Args => parseArgs(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1));

// 怀疑名单只留认得出名字的活人，可能性夹在 0~100
function parseSuspicion(raw: unknown, names: string[], everyone: string[]): SuspicionEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item: Partial<SuspicionEntry> | null) => {
    const name = matchName(String(item?.name ?? ''), names, everyone);
    const p = Math.max(0, Math.min(100, Math.round(Number(item?.p))));
    return name && Number.isFinite(p) ? [{ name, p, why: String(item?.why ?? '').trim() }] : [];
  });
}

/**
 * 让一个角色做出这一步的决策
 */
export async function getAIResponse(player: Player, gameState: GameState, config: LLMConfig): Promise<AIReply> {
  const targets = getLegalTargets(gameState, player)?.map((p) => p.name) ?? null;
  const messages: ChatMessage[] = [{ role: 'user', content: buildPrompt(player, gameState) }];
  const trace: string[] = [];

  // 校验一份提交，合法就返回结果，不合法返回打回的理由
  const everyone = gameState.players.map((p) => p.name);
  const others = gameState.players.filter((p) => p.isAlive && p.name !== player.name).map((p) => p.name);
  const accept = (args: Args): AIReply | string => {
    const target = targets ? matchName(args.target ?? '', targets, everyone) ?? matchName(args.speech ?? '', targets, everyone) : null;
    if (targets && !target) return `target "${args.target ?? ''}" 不合法，必须是：${targets.join('、')}。请重新 submit。`;
    if (!targets && !args.speech?.trim()) return 'speech 不能为空，这一步你需要开口说话。请重新 submit。';
    return {
      thinking: args.thinking?.trim() ?? '',
      speech: targets ? '' : args.speech?.trim() ?? '',
      target,
      trace: trace.join('\n\n'),
      suspicion: parseSuspicion(args.suspicion, others, everyone),
    };
  };

  // 不限轮数，直到 AI 用 submit 交出合法决定
  for (;;) {
    const reply = await chat(config, { messages, tools: tools(targets), temperature: 0.9, reasoning_effort: REASONING_EFFORT });
    messages.push({ role: 'assistant', content: reply.content ?? '', reasoning_content: reply.reasoning_content, tool_calls: reply.tool_calls });

    if (!reply.tool_calls?.length) {
      const fallback = accept(parseText(reply.content ?? ''));
      if (typeof fallback !== 'string') return fallback;
      messages.push({ role: 'user', content: '请调用 submit 工具提交你的决定（需要的话先用 cli 查档案）。' });
      continue;
    }

    for (const call of reply.tool_calls) {
      const args = parseArgs(call.function.arguments);
      let result: string;
      if (call.function.name === 'submit') {
        const outcome = accept(args);
        if (typeof outcome !== 'string') return outcome;
        result = outcome;
      } else if (call.function.name === 'cli') {
        result = runCli(args.command ?? 'help', player, gameState);
        trace.push(`$ ${args.command ?? 'help'}\n${result}`);
      } else {
        result = `没有 ${call.function.name} 这个工具，只有 cli 和 submit。`;
      }
      messages.push({ role: 'tool', tool_call_id: call.id, content: result });
    }
  }
}
