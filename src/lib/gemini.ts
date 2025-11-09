/**
 * Gemini API client for AI player responses
 */

import type { GameState, Player } from '@/types/game';

/**
 * Gemini API configuration
 */
interface GeminiConfig {
  apiKey: string;
  model?: string;
}

/**
 * Test if Gemini API key is valid
 */
export async function testGeminiKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey,
        model: 'gemini-2.5-pro',
        prompt: '测试',
      }),
    });

    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Generate AI response using Gemini API
 */
export async function getAIResponse(
  player: Player,
  gameState: GameState,
  config: GeminiConfig,
): Promise<string> {
  const prompt = buildPrompt(player, gameState);

  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey: config.apiKey,
        model: config.model ?? 'gemini-2.5-pro',
        prompt,
      }),
    });

    if (!response.ok) {
      const errorData = (await response.json()) as { error?: string; details?: string };
      console.error('Gemini API 错误响应:', errorData);
      return `${player.name} 无法发言（${errorData.error || 'API 错误'}）`;
    }

    const data = (await response.json()) as {
      text?: string;
      usage?: unknown;
    };

    const text = data.text?.trim();

    if (!text) {
      console.error('Gemini API 响应为空:', data);
      return `${player.name} 沉默了...`;
    }

    return text;
  } catch (error) {
    console.error(`${player.name} 的 AI 调用失败:`, error);
    return `${player.name}: 我需要想一想...`;
  }
}

/**
 * Build prompt for AI player based on game context
 */
function buildPrompt(player: Player, gameState: GameState): string {
  const { phase, round, players, messages } = gameState;

  const recentMessages = messages.slice(-10);
  const alivePlayers = players.filter((p) => p.isAlive);
  const messageHistory = recentMessages
    .map((m) => `${m.from}: ${m.content}`)
    .join('\n');

  const roleNames: Record<string, string> = {
    werewolf: '狼人',
    villager: '村民',
    seer: '预言家',
    witch: '女巫',
    hunter: '猎人',
  };

  const phaseNames: Record<string, string> = {
    setup: '准备',
    night: '夜晚',
    day: '白天',
    voting: '投票',
    end: '结束',
  };

  const basePrompt = `你是 ${player.name}，正在玩狼人杀游戏。
你的身份：${roleNames[player.role]}
当前阶段：${phaseNames[phase]}
回合数：${round}
存活玩家：${alivePlayers.map((p) => p.name).join('、')}

${getRoleInstructions(player.role)}

最近的对话：
${messageHistory}

`;

  if (phase === 'day') {
    return `${basePrompt}
现在是讨论时间。分享你的想法、怀疑对象，或为自己辩护。
保持简短（1-2句话）。根据你的身份制定策略。

你的发言：`;
  }

  if (phase === 'voting') {
    return `${basePrompt}
投票时间到了。选择一个玩家淘汰。
只回复玩家名字，不要有其他内容。

你的投票：`;
  }

  return basePrompt;
}

/**
 * Role-specific instructions
 */
function getRoleInstructions(role: string): string {
  switch (role) {
    case 'werewolf':
      return '你是狼人。伪装成村民。保护其他狼人。指控村民阵营。';
    case 'seer':
      return '你是预言家。每晚可以查验一名玩家的身份。谨慎使用你的知识。';
    case 'villager':
      return '你是村民。通过讨论和投票找出狼人。';
    case 'witch':
      return '你是女巫。你有一瓶毒药和一瓶解药。';
    case 'hunter':
      return '你是猎人。如果你死了，可以带走一个人。';
    default:
      return '';
  }
}
