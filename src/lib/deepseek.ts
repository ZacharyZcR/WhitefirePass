/**
 * DeepSeek 官方 API（OpenAI 兼容格式）驱动白烬山口的人
 *
 * 山灵架构：
 *   角色 —— 各自一个持续会话（ai/session.ts），只用人物的口吻说话，输出"（心里话）说出口的话"的纯文本。
 *   山灵 —— 需要选人时，一次读完一批回答，听出每个人选了谁（ai/shanling.ts）。
 *   引擎 —— 校验是否合法、结算一切（actors.ts / game-engine.ts / store）。
 */

import type { GameState, Player, SuspicionEntry } from '@/types/game';
import { getLegalTargets } from './actors';
import { buildSession, parseUtterance, renderSession, type ChatMessage } from './ai/session';
import { SHANLING_SYSTEM, interpretPrompt, type Answer } from './ai/shanling';

/** 提示词查看器看到的：这个人此刻完整的会话 */
export const buildPrompt = renderSession;

interface LLMConfig {
  apiKey: string;
  apiUrl?: string;
  model?: string;
  onRetry?: (info: { attempt: number; maxRetries: number; delay: number; reason: string }) => void;
}

export interface AIReply {
  thinking: string;
  /** 说出口的话 */
  speech: string;
  /** 这一步要选人时，山灵听出的目标（已校验合法）；没表态或不需要选人时为 null */
  target: string | null;
  trace: string;
  suspicion: SuspicionEntry[];
}

// 默认服务由 .env.local 决定（现在是 Paseo 里的 Gemini 3.8 Flash）；没配就回到 DeepSeek 官方
export const DEFAULT_API_URL = process.env.NEXT_PUBLIC_LLM_API_URL || 'https://api.deepseek.com';
export const DEFAULT_MODEL = process.env.NEXT_PUBLIC_LLM_MODEL || 'deepseek-flash';
const CHARACTER_EFFORT = 'low'; // 角色开口：想得太深反而写得像文章
const MAX_RETRIES = 6;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const backoff = (attempt: number) => Math.min(1000 * 2 ** attempt, 8000);
const isRetryable = (status: number) => status === 429 || status >= 500;

class FatalError extends Error {}

async function chat(config: LLMConfig, body: Record<string, unknown>): Promise<string> {
  const base = (config.apiUrl || DEFAULT_API_URL).replace(/\/+$/, '');
  // 浏览器里经同源的 /api/ai 由服务端转发（跨域、https 访问 http 端点都不成问题）；Node 里跑脚本时直连
  const viaProxy = typeof window !== 'undefined';
  const url = viaProxy ? '/api/ai' : `${base}/chat/completions`;
  let lastError: Error = new Error('API 请求失败');

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.apiKey}` },
        body: JSON.stringify({ ...(viaProxy ? { apiUrl: base } : {}), model: config.model ?? DEFAULT_MODEL, ...body }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: { message?: string } };
        const message = data.error?.message ?? `HTTP ${response.status}`;
        if (!isRetryable(response.status)) throw new FatalError(message);
        throw new Error(`HTTP ${response.status}: ${message}`);
      }

      const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
      const content = data.choices?.[0]?.message?.content?.trim();
      if (!content) throw new Error('AI 响应为空');
      return content;
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

/**
 * 在候选名字里找到指的那个人：全名优先，其次是唯一的名或姓。
 * 写了候选之外某人的全名（比如自己、死者）就不算，不再按姓去猜——否则"莉迪亚·克劳利"会被认成同姓的托马斯
 */
export function matchName(text: string, names: string[], everyone: string[] = names): string | null {
  if (!text) return null;
  const exact = names.find((n) => text.trim() === n);
  if (exact) return exact;
  const full = names.filter((n) => text.includes(n));
  if (full.length === 1) return full[0];
  if (everyone.some((n) => text.includes(n))) return null;
  const parts = names.filter((n) => n.split('·').some((part) => part.length >= 2 && text.includes(part)));
  return parts.length === 1 ? parts[0] : null;
}

/** 角色开口：在他自己的会话里说一句 */
async function speak(player: Player, state: GameState, config: LLMConfig) {
  const messages: ChatMessage[] = buildSession(player, state);
  // 话短是说话约定管的，这里只防止偶尔收不住的长篇
  const text = await chat(config, { messages, temperature: 1.0, max_tokens: 1500, reasoning_effort: CHARACTER_EFFORT });
  return parseUtterance(text);
}

const QUESTION: Record<string, string> = {
  voting: '黄昏了，你把献祭石放在谁面前？',
  listener: '今夜，你要去听谁的灵魂？',
  'marked-vote': '今夜去找谁？',
  guard: '今夜，你闩上谁的门？',
};

/** 山灵一次听完一批回答，说出每个人选了谁 */
async function interpret(state: GameState, answers: Answer[], config: LLMConfig): Promise<Record<string, string | null>> {
  const question = QUESTION[state.phase === 'night' ? state.nightPhase ?? '' : state.phase] ?? '你选谁？';
  let parsed: Record<string, string | null> = {};
  try {
    const text = await chat(config, {
      messages: [{ role: 'system', content: SHANLING_SYSTEM }, { role: 'user', content: interpretPrompt(question, answers) }],
      response_format: { type: 'json_object' },
      temperature: 0,
      reasoning_effort: 'none',
    });
    parsed = JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1)) as Record<string, string | null>;
  } catch {
    // 山灵没听清（或代理不支持 JSON 输出）：退回直接从原话里找名字
  }
  const everyone = state.players.map((p) => p.name);
  return Object.fromEntries(answers.map((a) => [
    a.name,
    matchName(parsed[a.name] ?? '', a.legal, everyone) ?? matchName(a.text, a.legal, everyone),
  ]));
}

/**
 * 一批人同时作答（投票、烙印者决定猎物时并行）；不需要选人的一步，山灵不出场
 */
export async function getBatchChoices(players: Player[], state: GameState, config: LLMConfig): Promise<AIReply[]> {
  const spoken = await Promise.all(players.map((p) => speak(p, state, config)));
  const legal = players.map((p) => getLegalTargets(state, p)?.map((x) => x.name) ?? null);
  const answers: Answer[] = players.flatMap((p, i) => (legal[i] ? [{ name: p.name, text: spoken[i].speech || spoken[i].thinking, legal: legal[i]! }] : []));
  const choices = answers.length ? await interpret(state, answers, config) : {};
  return players.map((p, i) => ({
    thinking: spoken[i].thinking,
    speech: spoken[i].speech,
    target: legal[i] ? choices[p.name] ?? null : null,
    trace: '',
    suspicion: [],
  }));
}

/**
 * 让一个角色做出这一步的决策
 */
export async function getAIResponse(player: Player, gameState: GameState, config: LLMConfig): Promise<AIReply> {
  const [reply] = await getBatchChoices([player], gameState, config);
  return reply;
}
