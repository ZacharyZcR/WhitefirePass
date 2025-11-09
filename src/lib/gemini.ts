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
// eslint-disable-next-line complexity
function buildPrompt(player: Player, gameState: GameState): string {
  const { phase, nightPhase, round, players, messages } = gameState;

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

  // Get phase display name
  let phaseDisplay = phaseNames[phase];
  if (phase === 'night' && nightPhase) {
    const nightPhaseNames: Record<string, string> = {
      'seer': '夜晚-预言家查验',
      'werewolf-discuss': '夜晚-狼人讨论',
      'werewolf-vote': '夜晚-狼人投票',
    };
    phaseDisplay = nightPhaseNames[nightPhase] || phaseDisplay;
  }

  // Get teammate information for werewolves
  const werewolfTeammates = player.role === 'werewolf'
    ? players.filter((p) => p.role === 'werewolf' && p.name !== player.name)
    : [];

  // Get seer check info
  const seerCheckInfo = player.role === 'seer' && phase === 'day'
    ? `
【你的查验记录】
${gameState.seerChecks.length > 0
  ? gameState.seerChecks.map((check) => `第${check.round}回合查验：${check.target} 是 ${roleNames[check.role]}`).join('\n')
  : round === 1
    ? '⚠️ 重要：游戏没有第0晚！你现在还没有进行过任何查验，因此没有任何查验信息。你的第一次查验将在今晚（第1回合夜晚）进行。'
    : '你还没有查验任何人'
}`
    : '';

  const basePrompt = `你是 ${player.name}，正在玩狼人杀游戏。

【你的性格设定】
${player.personality || '你是一个普通玩家，按照自己的判断行事。'}

【游戏信息】
你的身份：${roleNames[player.role]}
当前阶段：${phaseDisplay}
回合数：${round}
存活玩家：${alivePlayers.map((p) => p.name).join('、')}
${werewolfTeammates.length > 0 ? `你的狼人队友：${werewolfTeammates.map((p) => p.name).join('、')}` : ''}
${seerCheckInfo}

${getRoleInstructions(player.role, phase, nightPhase)}

最近的对话：
${messageHistory}

`;

  if (phase === 'day') {
    return `${basePrompt}
现在是讨论时间。请按照以下格式回复：

【思考】
（在这里详细写出你的分析和推理过程，包括：
- 对当前局势的判断
- 对其他玩家发言的分析
- 你的策略和计划
建议400-500字以内，充分展现你的思考深度）

【发言】
（在这里写出你要对大家说的话。⚠️ 强制限制：必须在150字以内，超出部分将被截断）

注意：思考部分只有你自己能看到，发言部分所有人都能看到。`;
  }

  if (phase === 'voting') {
    return `${basePrompt}
投票时间到了。请按照以下格式回复：

【思考】
（在这里详细写出你的投票理由和分析，包括：
- 对所有存活玩家的评估
- 谁最可疑及原因
- 投票的战略考虑
建议400-500字以内，展现你的推理过程）

【发言】
（只写要投票的玩家名字，不要有其他内容）

注意：思考部分只有你自己能看到，发言部分（投票结果）所有人都能看到。`;
  }

  if (phase === 'night') {
    // Seer check phase
    if (nightPhase === 'seer' && player.role === 'seer') {
      return `${basePrompt}
现在是预言家查验时间。请按照以下格式回复：

【思考】
（详细分析为什么要查验这个人，包括：
- 白天发言的可疑之处
- 行为模式分析
- 查验的战略价值
建议300-400字，展现你的推理深度）

【发言】
（只写要查验的玩家名字，不要有其他内容）

注意：思考和发言都只有你自己能看到。查验结果会在你选择后显示。`;
    }

    // Werewolf discuss phase
    if (nightPhase === 'werewolf-discuss' && player.role === 'werewolf') {
      return `${basePrompt}
现在是狼人讨论时间。请按照以下格式回复：

【思考】
（详细写出你的分析和策略，包括：
- 对当前局势的评估
- 威胁最大的玩家分析
- 击杀的战略考虑
建议300-400字，充分思考）

【发言】
（和队友讨论今晚的目标，阐述你的建议和理由。⚠️ 强制限制：必须在150字以内）

注意：思考和发言都只有狼人能看到。`;
    }

    // Werewolf vote phase
    if (nightPhase === 'werewolf-vote' && player.role === 'werewolf') {
      return `${basePrompt}
现在是狼人投票时间。请按照以下格式回复：

【思考】
（详细写出你的击杀策略和分析，包括：
- 综合队友的讨论意见
- 最终的目标选择理由
- 对后续局势的预判
建议300-400字，展现决策过程）

【发言】
（只写要击杀的玩家名字，不要有其他内容）

注意：思考和发言都只有狼人能看到。`;
    }
  }

  return basePrompt;
}

/**
 * Role-specific instructions
 */
// eslint-disable-next-line complexity
function getRoleInstructions(role: string, phase: string, nightPhase?: string): string {
  switch (role) {
    case 'werewolf':
      if (phase === 'night') {
        if (nightPhase === 'werewolf-discuss') {
          return `【狼人身份 - 讨论阶段】
你是狼人。现在是夜晚，只有狼人能看到这些对话。
⚠️ 当前阶段：讨论今晚的击杀目标
- 和其他狼人深入交流你的想法和分析
- 详细分析哪个玩家威胁最大及原因
- 提出你的建议并充分阐述理由
- 这是制定战略的关键时刻，充分讨论`;
        } else if (nightPhase === 'werewolf-vote') {
          return `【狼人身份 - 投票阶段】
你是狼人。现在需要投票决定击杀目标。
⚠️ 重要：投票选择今晚要杀的人
- 根据刚才的讨论做出决定
- 只回复要杀的玩家名字（如：Alice）
- 不要解释原因，不要说其他内容`;
        }
      }
      return `【狼人身份 - ${phase === 'day' ? '白天' : '投票'}阶段】
你是狼人，但必须伪装成村民。
⚠️ 重要规则：
- 绝不暴露自己是狼人
- 绝不暴露其他狼人的身份
- 像村民一样说话和投票
- 可以指控真正的村民，转移注意力`;
    case 'seer':
      if (phase === 'night' && nightPhase === 'seer') {
        return `【预言家身份 - 查验阶段】
你是预言家。现在是夜晚查验时间。
⚠️ 重要：选择一个玩家查验身份
- 根据白天的讨论选择最可疑的人
- 只回复要查验的玩家名字（如：Alice）
- 不要解释原因，不要说其他内容
- 查验结果只有你能看到`;
      }
      return `【预言家身份】
你是预言家，每晚可以查验一名玩家的真实身份。
⚠️ 关于查验信息的使用：
- 查验结果会显示在上方的【你的查验记录】中
- 如果记录为空，说明你还没有查验信息
- 你可以选择公开查验结果来获取信任，但这会让你成为狼人的目标
- 你也可以选择隐藏身份，多活几轮收集更多信息
- 谨慎使用你的知识，根据局势选择最优策略`;
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
