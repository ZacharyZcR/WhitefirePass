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
    throw new Error(errorData.error ?? errorData.details ?? 'API 请求失败');
  }

  const data = (await response.json()) as {
    text?: string;
    usage?: unknown;
  };

  const text = data.text?.trim();

  if (!text) {
    console.error('Gemini API 响应为空:', data);
    throw new Error('AI 响应为空');
  }

  return text;
}

/**
 * Build prompt for AI player based on game context
 */
function buildPrompt(player: Player, gameState: GameState): string {
  const { phase, round, players, messages } = gameState;

  const alivePlayers = players.filter((p) => p.isAlive);

  // Filter messages based on visibility
  const visibleMessages = messages.filter((m) => {
    if (m.visibility === 'all') return true;
    if (m.visibility === 'werewolf' && player.role === 'werewolf') return true;
    if (m.visibility === 'seer' && player.role === 'seer') return true;
    if (typeof m.visibility === 'object' && m.visibility.player === player.name) return true;
    // AI can see its own thinking
    if (m.type === 'thinking' && m.from === player.name) return true;
    return false;
  });

  const recentMessages = visibleMessages
    .filter((m) => m.type !== 'prompt')  // Exclude prompt messages to prevent identity leak
    .slice(-50);
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

  // Get teammate information for werewolves
  const werewolfTeammates = player.role === 'werewolf'
    ? players.filter((p) => p.role === 'werewolf' && p.name !== player.name)
    : [];

  const basePrompt = `你是 ${player.name}，正在玩狼人杀游戏。

【你的性格设定】
${player.personality || '你是一个普通玩家，按照自己的判断行事。'}

【游戏信息】
你的身份：${roleNames[player.role]}
当前阶段：${phaseNames[phase]}
回合数：${round}
存活玩家：${alivePlayers.map((p) => p.name).join('、')}
${werewolfTeammates.length > 0 ? `你的狼人队友：${werewolfTeammates.map((p) => p.name).join('、')}` : ''}

${getRoleInstructions(player.role, phase)}

最近的对话：
${messageHistory}

`;

  if (phase === 'day') {
    return `${basePrompt}
现在是讨论时间。请按照以下格式回复：

【思考】
（在这里写出你的分析和推理过程，2-3句话）

【发言】
（在这里写出你要对大家说的话，1-2句话）

注意：思考部分只有你自己能看到，发言部分所有人都能看到。`;
  }

  if (phase === 'voting') {
    return `${basePrompt}
投票时间到了。请按照以下格式回复：

【思考】
（在这里写出你的投票理由和分析，2-3句话）

【发言】
（只写要投票的玩家名字，不要有其他内容）

注意：思考部分只有你自己能看到，发言部分（投票结果）所有人都能看到。`;
  }

  if (phase === 'night' && player.role === 'werewolf') {
    return `${basePrompt}
现在是夜晚，选择今晚要杀的玩家。请按照以下格式回复：

【思考】
（在这里写出你的击杀策略和分析，2-3句话）

【发言】
（只写要击杀的玩家名字，不要有其他内容）

注意：思考和发言都只有狼人能看到。`;
  }

  return basePrompt;
}

/**
 * Role-specific instructions
 */
function getRoleInstructions(role: string, phase: string): string {
  switch (role) {
    case 'werewolf':
      if (phase === 'night') {
        return `【狼人身份 - 夜晚阶段】
你是狼人。现在是夜晚，只有狼人能看到这些对话。
⚠️ 重要：你需要投票选择今晚要杀的人
- 分析白天的讨论，选择威胁最大的玩家
- 优先杀掉发言好、逻辑清晰的玩家
- 只回复要杀的玩家名字（如：Alice）
- 不要解释原因，不要说其他内容`;
      }
      return `【狼人身份 - ${phase === 'day' ? '白天' : '投票'}阶段】
你是狼人，但必须伪装成村民。
⚠️ 重要规则：
- 绝不暴露自己是狼人
- 绝不暴露其他狼人的身份
- 像村民一样说话和投票
- 可以指控真正的村民，转移注意力`;
    case 'seer':
      return '你是预言家。每晚可以查验一名玩家的身份。谨慎使用你的知识，避免过早暴露身份。';
    case 'villager':
      return '你是村民。通过讨论和投票找出狼人。仔细观察每个人的发言和行为。';
    case 'witch':
      return '你是女巫。你有一瓶毒药和一瓶解药。使用时机很关键。';
    case 'hunter':
      return '你是猎人。如果你死了，可以带走一个人。保持低调，不要过早暴露身份。';
    default:
      return '';
  }
}
