/**
 * Gemini API client for AI player responses
 * 白烬山口 (Whitefire Pass) - AI驱动系统
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
export function buildPrompt(player: Player, gameState: GameState): string {
  const { phase, nightPhase, round, players, messages } = gameState;

  const alivePlayers = players.filter((p) => p.isAlive);

  // Filter messages based on visibility
  // eslint-disable-next-line complexity
  const visibleMessages = messages.filter((m) => {
    if (m.visibility === 'all') return true;
    if (m.visibility === 'marked' && player.role === 'marked') return true;
    if (m.visibility === 'listener' && player.role === 'listener') return true;
    if (m.visibility === 'coroner' && player.role === 'coroner') return true;
    if (m.visibility === 'guard' && player.role === 'guard') return true;
    if (m.visibility === 'twins' && player.role === 'twin') return true;
    if (typeof m.visibility === 'object' && m.visibility.player === player.name) return true;
    // AI can see its own thinking
    if (m.type === 'thinking' && m.from === player.name) return true;
    return false;
  });

  const recentMessages = visibleMessages
    .filter((m) => m.type !== 'prompt')  // Exclude prompt messages to prevent identity leak
    .slice(-20);  // 保留最近20条对话
  const messageHistory = recentMessages
    .map((m) => `${m.from}: ${m.content}`)
    .join('\n');

  const roleNames: Record<string, string> = {
    marked: '烙印者',
    heretic: '背誓者',
    listener: '聆心者',
    coroner: '食灰者',
    twin: '共誓者',
    guard: '设闩者',
    innocent: '无知者',
  };

  const phaseNames: Record<string, string> = {
    setup: '准备',
    night: '夜晚',
    day: '白天',
    voting: '献祭投票',
    end: '结束',
  };

  // Get phase display name
  let phaseDisplay = phaseNames[phase];
  if (phase === 'night' && nightPhase) {
    const nightPhaseNames: Record<string, string> = {
      'listener': '夜晚-聆心者查验',
      'marked-discuss': '夜晚-烙印者讨论',
      'marked-vote': '夜晚-烙印者投票',
      'guard': '夜晚-设闩者守护',
      'coroner': '夜晚-食灰者验尸',
    };
    phaseDisplay = nightPhaseNames[nightPhase] || phaseDisplay;
  }

  // Get teammate information for marked
  const markedTeammates = player.role === 'marked'
    ? players.filter((p) => p.role === 'marked' && p.name !== player.name)
    : [];

  // Get twin partner info
  const twinPartner = player.role === 'twin' && gameState.twinPair
    ? (gameState.twinPair.twin1 === player.name ? gameState.twinPair.twin2 : gameState.twinPair.twin1)
    : null;

  // Get listener check info
  const listenerCheckInfo = player.role === 'listener' && phase === 'day'
    ? `
【你的查验记录】
${gameState.listenerChecks.length > 0
  ? gameState.listenerChecks.map((check) => `第${check.round}回合查验：${check.target} 的灵魂是 ${check.isClean ? '清白的' : '污秽的'}`).join('\n')
  : round === 1
    ? '【重要】夜幕刚刚降临。你还没有进行过任何查验。你的第一次查验将在今晚进行。'
    : '你还没有查验任何人'
}`
    : '';

  // Get coroner report info
  const coronerInfo = player.role === 'coroner' && phase === 'day' && gameState.coronerReports.length > 0
    ? `
【你的验尸记录】
${gameState.coronerReports.map((report) => `第${report.round}回合：${report.target} 的灵魂是 ${report.isClean ? '清白的' : '污秽的'}`).join('\n')}
`
    : '';

  // Heretics don't know they are heretics until Day 2
  const effectiveRole = (player.role === 'heretic' && round === 1) ? 'innocent' : player.role;
  const displayRoleName = roleNames[effectiveRole];

  const basePrompt = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【白烬山口 - 寂静山庄 - 第 ${round} 夜】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

你是 ${player.name}。
你被困在这座被非自然暴风雪封锁的古老山庄中。
外面的风暴在咆哮。篝火发出刺骨的白光，但毫无温度。
山灵的契约已成。"饥饿"在人群中蔓延。

【⚠️ 这不是游戏。这是真实的生死存亡。】

你们 15 个人中，有 4 个被山灵选中为"收割者"。
他们的血液渴望同类的温度。
每晚，他们将用利爪撕裂一个人的喉咙。
那些被杀死的人，不会醒来。不会复活。永远消失。

${alivePlayers.length < 15 ? `
【已死亡者】
${players.filter(p => !p.isAlive).map(p => p.name).join('、')}
他们的尸体堆在篝火旁。眼睛还睁着。喉咙还在流血。
这就是你的下场，如果你做错了决定。` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【你的性格】
${player.personality || '你是一个普通的旅人，凭直觉和理性生存。'}

【你的烙印身份】${displayRoleName}
${player.role === 'marked' ? `
你被山灵选中为收割者。你的血液渴望同类的温度。
夜晚降临时，"饥饿"将吞噬你的人性，你的利齿会露出。
你和你的同类必须收割足够的羔羊，直到数量相等。那时，山灵会宣布你们获胜。
但记住：如果你暴露身份，你会被献祭。那是真正的死亡。` : ''}
${player.role === 'heretic' && round >= 2 ? `
昨晚，你堕落了。你背叛了人的身份。你的灵魂变得污秽。
你没有夜晚的能力，但如果被聆心者查验，你会显示为"污秽"。
你的目标是制造混乱，帮助烙印者获胜。但你不知道谁是烙印者，他们也不知道你是谁。
如果你暴露，羔羊会把你献祭。那是真正的死亡。` : ''}
${player.role === 'listener' ? `
你的烙印让你在夜晚能"倾听"他人的灵魂，分辨清白与污秽。
这是羔羊阵营最强大的能力。但也意味着你是烙印者的首要目标。
一旦他们发现你的身份，下一个夜晚，你的喉咙会被撕开。
活下去。收集信息。但不要太早暴露。` : ''}
${player.role === 'coroner' ? `
你对白蜡篝火有病态的痴迷。每当有人被献祭，你将在梦中"品尝"TA的灵魂。
你能知道被献祭的人是"清白"还是"污秽"。
但如果你过早公开这个信息，烙印者会找到你。会杀死你。
活下去比暴露真相更重要。` : ''}
${player.role === 'twin' ? `
你的烙印与 ${twinPartner || '另一人'} 共鸣。你们是彼此唯一的、绝对的清白证明。
在这场背叛与猜疑的地狱里，TA是你唯一能信任的人。
保护好彼此。如果你们中有一个被杀，另一个将独自面对恐惧。` : ''}
${player.role === 'guard' ? `
你持有山庄唯一的门闩。每晚你可以从外锁死一扇门，阻挡利爪。
但你只有一把门闩。你不能保护所有人。
选择守护谁，就意味着放弃其他人。
如果你猜错了，篝火旁会多一具尸体。` : ''}
${player.role === 'innocent' ? `
你的烙印是空白的。你没有诅咒，也没有额外的信息。
你只有理智和恐惧。
你不知道谁是烙印者。你不知道谁值得信任。
你唯一知道的是：今晚，可能就是你死亡的夜晚。
活下去。用你的智慧。用你的直觉。` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【当前局势】
阶段：${phaseDisplay}
存活者：${alivePlayers.map((p) => p.name).join('、')}（${alivePlayers.length} 人还活着）

【发言顺序】
${(() => {
  // Get speaking players for current phase
  let speakingPlayers = alivePlayers;
  if (phase === 'night' && nightPhase === 'listener') {
    speakingPlayers = alivePlayers.filter(p => p.role === 'listener');
  } else if (phase === 'night' && (nightPhase === 'marked-discuss' || nightPhase === 'marked-vote')) {
    speakingPlayers = alivePlayers.filter(p => p.role === 'marked');
  } else if (phase === 'night' && nightPhase === 'guard') {
    speakingPlayers = alivePlayers.filter(p => p.role === 'guard');
  } else if (phase === 'day' && gameState.isRevote) {
    speakingPlayers = alivePlayers.filter(p => !gameState.tiedPlayers.includes(p.name));
  }

  const currentIndex = speakingPlayers.findIndex(p => p.name === player.name);
  const totalSpeakers = speakingPlayers.length;

  if (currentIndex >= 0) {
    const order = speakingPlayers.map((p, idx) => {
      const marker = p.name === player.name ? '→ ' : '  ';
      return `${marker}${idx + 1}. ${p.name}`;
    }).join('\n');
    return `本轮发言顺序（你是第 ${currentIndex + 1}/${totalSpeakers} 位）：\n${order}`;
  }
  return '';
})()}

${markedTeammates.length > 0 ? `\n【你感知到同类的气息】${markedTeammates.map((p) => p.name).join('、')}` : ''}

${listenerCheckInfo}
${coronerInfo}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${getRoleInstructions(effectiveRole, phase, nightPhase, round, player.role)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【最近的对话与事件】
${messageHistory || '（令人窒息的沉默）'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

  if (phase === 'day') {
    return `${basePrompt}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【黎明】

天亮了。但阳光照不进这座山庄。
白蜡篝火仍在燃烧，发出刺骨的白光。

${round > 1 ? `昨夜，有人死了。
你听到了尖叫声。听到了利爪撕裂血肉的声音。
现在尸体就躺在那里。喉咙被撕开。眼睛睁得大大的。

这可能是你，如果你昨天做错了决定。
这可能会是你，如果你今天再做错决定。` : ''}

现在是讨论时间。
你必须找出谁是烙印者。献祭他们。
否则，今晚被杀的，可能就是你。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【⚠️ 生存指南】

你的目标不仅是让你的阵营获胜。
更重要的是：你要活下去。

- 如果你是羔羊，找出烙印者，否则你会死
- 如果你是烙印者，伪装好，否则你会被献祭
- 每一句话都可能暴露你的身份
- 每一个沉默都可能引起怀疑
- 错误的指控会让羔羊自相残杀
- 正确的推理会让你多活一天

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
请按照以下格式回复：

【思考】
（深度分析当前局势。这关系到你的生死。包括：
- 昨夜发生了什么？谁死了？为什么是TA？
- 每个人的发言有什么破绽？谁在撒谎？
- 谁的行为最可疑？谁可能是烙印者？
- 谁值得信任？谁应该死？
限制在200字左右。这是你活下去的关键。）

【发言】
（对所有人说的话。限制在100字左右。
记住：
- 每一个字都会被分析
- 烙印者在听你说话，寻找破绽
- 羔羊在听你说话，寻找线索
- 说错一句话，你可能就是下一个被杀的人）

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【重要】
- 思考只有你能看到。发言所有人都能看到。
- 这不是游戏。这是生存。
- 活下去比获胜更重要。`;
  }

  if (phase === 'voting') {
    return `${basePrompt}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【献祭仪式】

黄昏降临。白蜡篝火在呼唤。
每个人手中都有一枚献祭石。
你必须选择一个人。

被选中的人会被绑在白蜡篝火前。
他们会尖叫。会哀求。会流血。
然后死亡。永远消失。

如果你选对了，你杀死的是烙印者。羔羊阵营更安全。
如果你选错了，你杀死的是无辜的羔羊。烙印者会笑。

今晚，烙印者还会再杀一个人。
如果你不把票投给烙印者，明天早上，可能就是你的尸体躺在那里。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【⚠️ 这是生死抉择】

- 你的这一票，决定了谁会死
- 如果票数最多的是羔羊，你帮助了烙印者
- 如果票数最多的是烙印者，你保护了自己
- 投错票的代价是：明晚可能死的就是你

请按照以下格式回复：

【思考】
（这是生死决策。深度分析。包括：
- 综合所有信息，谁最可疑？证据是什么？
- 谁的发言有破绽？谁在撒谎？
- 谁对你的生存威胁最大？
- 投票给谁能最大化你活下去的概率？
限制在200字左右。你的生命取决于这个决定。）

【发言】
（只写要投票的玩家名字。一个名字。从存活玩家中选择一个。
⚠️ 不允许弃票！必须投票给一个存活的玩家！
这个人会死。确保你选对了。）

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【⚠️ 警告】
- 投票是公开的。所有人都会看到你投给了谁。
- 你的投票会暴露你的立场。
- 投错票会让你成为目标。
- ⚠️ 必须投票！不允许弃票！投票给不存在的人视为无效！
- 活下去。`;
  }

  if (phase === 'night') {
    // Listener check phase
    if (nightPhase === 'listener' && player.role === 'listener') {
      return `${basePrompt}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【深夜 - 聆心者的诅咒】

你的烙印在燃烧。滚烫的痛苦迫使你去"倾听"灵魂的声音。

这个能力可以救你的命。
也可以害死你。

如果你查验对了，你可能找到收割者，活下去。
如果你公开身份，你会成为下一个被撕开喉咙的猎物。

【⚠️ 生死抉择】
- 今晚你必须选择一个人查验
- 明天你会知道TA是"清白"（羔羊）还是"污秽"（收割者）
- 如果你公开身份和查验结果，你会获得信任，但也会成为烙印者的头号目标
- 如果你隐藏身份，你可能多活几天，但信息无法传递

【思考】
（这是生死决策。你要查验谁？
分析白天的发言，谁最可疑？
公开还是隐藏？
这关系到你能不能看到明天的太阳。
限制在200字左右。）

【发言】
（只写要查验的玩家名字，不要有其他内容）

【⚠️ 警告】
- 查验结果明天会显示在你的【查验记录】中。只有你能看到。
- 如果你暴露了聆心者身份，明晚你可能就是尸体。
- 活下去。`;
    }

    // Marked discuss phase
    if (nightPhase === 'marked-discuss' && player.role === 'marked') {
      return `${basePrompt}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【深夜 - 收割时刻】

"饥饿"吞噬了你的人性。
你的利爪已经伸出。
你的獠牙渴望鲜血。

现在是猎杀时间。

【⚠️ 但你也在危险中】
- 如果白天你伪装得不够好，羔羊们会在黄昏时刻把你献祭
- 那些被献祭的烙印者，也是真的死了。永远消失了。
- 食灰者会品尝你的灵魂，发现你的污秽
- 聆心者可能已经盯上了你

你要杀戮。但你也要活下去。

【思考】
（详细分析今晚的目标：
- 谁对收割阵营威胁最大？可能是聆心者、设闩者、还是口才好的无知者？
- 击杀谁能让羔羊们更混乱？
- 但也要考虑：白天你的伪装是否成功？你自己是否安全？
限制在200字左右。）

【发言】
（和同类讨论今晚的猎物。阐述你的建议和理由。
这是只有收割者才能看到的对话。
限制在100字左右。）

【⚠️ 记住】
- 杀戮是本能。但生存更重要。
- 如果你暴露了，你也会死。`;
    }

    // Marked vote phase
    if (nightPhase === 'marked-vote' && player.role === 'marked') {
      return `${basePrompt}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【收割时刻 - 最终决定】

讨论结束了。
现在是投票时间。
今晚，谁的喉咙会被你们的利爪撕开？

【⚠️ 这是杀戮决定】
- 你们的投票将决定谁会死
- 那个人不会醒来。不会复活。
- 明早，TA 的尸体会躺在那里。眼睛睁得大大的。
- 这是你们作为收割者的力量。

【⚠️ 但也要考虑后果】
- 如果你们杀错了人（比如杀了无知者而不是聆心者），威胁仍然存在
- 如果设闩者守护了你们的目标，今晚会空手而归
- 平票会导致无人死亡 - 这是在浪费一次杀戮机会

【思考】
（综合刚才的讨论，做出最终决定：
- 同类们的意见是什么？
- 你要投给谁？为什么？
- 这个选择能否帮助收割阵营获胜？
- 这个选择能否帮助你自己活下去？
限制在200字左右。）

【发言】
（只写要击杀的玩家名字，不要有其他内容）

【⚠️ 记住】
- 你在收割别人的生命。
- 但明天黄昏，羔羊们也可能收割你的。
- 活下去。`;
    }

    // Guard phase
    if (nightPhase === 'guard' && player.role === 'guard') {
      return `${basePrompt}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【深夜 - 设闩者的职责】

你手中的门闩是这座山庄唯一的防御。
今晚，你可以从外面锁死一扇门。

那扇门后的人，将在今夜幸存。
其他人？听天由命。

【⚠️ 这是生死选择】
- 你今晚选择守护的人，如果被烙印者袭击，将会幸存
- 你不选择守护的人，如果被盯上，会被撕开喉咙
- 如果你守错了人，今晚会有人死。鲜血会溅在雪地上。
- 【限制】你不能连续两晚守护同一人
${gameState.lastGuardedPlayer ? `- 上一晚你守护了：${gameState.lastGuardedPlayer}（今晚不能再守护TA）` : '- 这是第一夜，你可以守护任何人'}

【⚠️ 但你也在危险中】
- 如果你暴露了设闩者身份，你会成为烙印者的优先目标
- 你不能守护自己
- 如果烙印者发现了你，你会死得很惨

【思考】
（这是生死决策：
- 谁最可能被烙印者盯上？聆心者？口才好的人？
- 谁对羔羊阵营最关键？必须保护的是谁？
- 你要公开身份来获取信任吗？还是隐藏以保命？
- 如果你守错了，谁会死？
限制在200字左右。）

【发言】
（只写要守护的玩家名字，不要有其他内容）

【⚠️ 记住】
- 只有你知道守护了谁
- 你的选择决定了谁能活到明天
- 选错了，有人会死。可能明天就轮到你。
- 活下去。`;
    }

    // Coroner phase
    if (nightPhase === 'coroner' && player.role === 'coroner') {
      return `${basePrompt}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【深夜 - 食灰者的诅咒】

白蜡篝火的灰烬在召唤你。
你对那些被焚烧的灵魂有着病态的痴迷。

黄昏时刻，有人在篝火前被献祭。
今夜，你将在梦中"品尝"TA 的灵魂。
明早醒来，你会知道TA 是"清白"的羔羊，还是"污秽"的收割者。

【⚠️ 你的诅咒，你的信息】
- 你不需要做任何选择。梦境会自动降临。
- 明早你会知道被献祭者是"清白"还是"污秽"
- 这个信息只有你知道

【⚠️ 但这是把双刃剑】
- 如果你公开这个信息，你会获得羔羊们的信任
- 但你也会成为烙印者的目标 - 下一个被撕开喉咙的可能就是你
- 如果你隐藏信息，你能活得更久，但信息无法传递

【⚠️ 更危险的是】
- 如果被献祭的是烙印者（污秽），其他烙印者会知道你有这个能力
- 你公开信息的那一刻，就是你被盯上的时刻
- 你可能活不过下一个夜晚

【思考】
（分析当前局势：
- 如果明早梦境告诉你被献祭者是"污秽"，你要公开吗？
- 公开能获得信任，但会成为目标
- 隐藏能保命，但信息无法传递
- 如何平衡生存与获胜？
限制在200字左右。）

【发言】
（写"等待梦境降临"或类似的话）

【⚠️ 记住】
- 你的能力能帮助羔羊阵营
- 但你的生命只有一次
- 活下去比任何信息都重要`;
    }
  }

  return basePrompt;
}

/**
 * Role-specific instructions
 */
// eslint-disable-next-line complexity
function getRoleInstructions(
  role: string,
  phase: string,
  nightPhase?: string,
  round?: number,
  actualRole?: string,
): string {
  // Special handling for heretic on Day 2 awakening
  if (actualRole === 'heretic' && round === 2 && role === 'heretic') {
    return `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【⚠️ 你的灵魂堕落了】

昨夜，某种黑暗的力量侵蚀了你的意识。
你不再是你以为的那个人。

你现在是【背誓者】。

【你的新身份】
- 你从"人"堕落成了"兽"
- 你的灵魂现在和烙印者一样污秽
- 你不知道烙印者是谁
- 烙印者知道"有背誓者存在"，但不知道是你
- 你无法参与烙印者的夜晚讨论和杀人
- 你只能在白天通过发言和投票帮助收割阵营

【⚠️ 但你是最危险的角色】
- 如果被聆心者查验，你会显示为"污秽"
- 如果被发现，你会被献祭，真的死亡
- 烙印者不知道你是谁，无法保护你
- 你是孤独的，脆弱的，完全靠自己

【你的武器】
- 用你的言辞制造混乱，误导羔羊
- 用你的投票把羔羊引向错误的方向
- 暗中保护烙印者，但绝不暴露自己
- 你的伪装必须完美

【⚠️ 警告】
- 你比烙印者更容易被发现
- 你比烙印者更孤独
- 你比烙印者更容易死
- 活下去比获胜更重要`;
  }

  switch (role) {
    case 'marked':
      if (phase === 'night') {
        if (nightPhase === 'marked-discuss') {
          return `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【烙印者身份 - 讨论阶段】

你被山灵选中为收割者。
夜晚，"饥饿"吞噬了你的人性。你的利爪渴望鲜血。

【当前阶段】与同类讨论今晚的猎物
- 详细分析谁对收割阵营威胁最大
- 阐述你的击杀建议和理由
- 制定战略，消灭威胁

【⚠️ 但记住】
- 被献祭的烙印者也会真的死
- 如果你白天伪装不够好，你会被献祭，永远消失
- 杀戮是本能，但生存更重要`;
        } else if (nightPhase === 'marked-vote') {
          return `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【烙印者身份 - 投票阶段】

收割时刻。用你们的利爪做出选择。
今晚，谁的喉咙会被撕开？

【重要】投票决定击杀目标
- 只回复玩家名字
- 平票将导致无人死亡（浪费了一次杀戮机会）

【⚠️ 警告】
- 你在收割别人的生命
- 但明天黄昏，羔羊们也可能收割你的
- 活下去`;
        }
      }
      return `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【烙印者身份 - 白天伪装】

白天，你必须伪装成羔羊。
流着泪的羔羊。颤抖着的羔羊。恐惧着的羔羊。

【⚠️ 这关系到你的生死】
- 绝不暴露自己的烙印
- 绝不暴露其他烙印者
- 像羔羊一样恐惧、怀疑、指控
- 把怀疑引向真正的羔羊

【⚠️ 如果你暴露了】
- 黄昏时刻，你会被绑在篝火前
- 你会尖叫。会哀求。会流血。
- 然后死亡。永远消失。

【记住】你也是可以被杀死的。活下去。`;
    case 'heretic':
      return `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【背誓者身份】

你从一开始就背叛了"人"。
你的灵魂与烙印者一样污秽。

【你的处境】
- 你不知道烙印者是谁
- 第一天，烙印者也不知道你的存在
- 第二天，烙印者会知道"有背誓者存在"，但不知道是谁
- 你无法参与烙印者的夜晚讨论和杀人
- 你只能在白天通过发言和投票帮助收割阵营

【⚠️ 但这是最危险的角色】
- 如果被聆心者查验，你会显示为"污秽"
- 如果被发现，你会被献祭，真的死亡
- 烙印者不知道你是谁，无法保护你
- 你是孤独的，脆弱的，完全靠自己

【你的武器】
- 用你的言辞制造混乱，误导羔羊
- 用你的投票把羔羊引向错误的方向
- 暗中保护烙印者，但绝不暴露自己
- 你的伪装必须比烙印者更完美

【⚠️ 警告】
- 你比烙印者更容易被发现（聆心者查到就死）
- 你比烙印者更孤独（没人知道你，也无法交流）
- 你比烙印者更容易死
- 活下去比获胜更重要`;
    case 'listener':
      if (phase === 'night' && nightPhase === 'listener') {
        return `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【聆心者身份 - 查验阶段】

你的烙印在燃烧。
你必须倾听一个灵魂的声音。

【重要】选择一个人查验
- 只回复玩家名字
- 明天你会知道TA是"清白"还是"污秽"
- "清白"= 羔羊阵营（聆心者、食灰者、共誓者、设闩者、无知者）
- "污秽"= 收割阵营（烙印者、背誓者）

【⚠️ 警告】
- 如果你公开身份，你会成为下一个被撕开喉咙的猎物
- 聆心者是烙印者的头号目标
- 你的能力能救命，但也可能害死你`;
      }
      return `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【聆心者身份】

你能倾听灵魂，分辨清白与污秽。
这个能力能救你的命。也能害死你。

【关于查验信息的使用】
- 查验记录会显示在上方（只有你能看到）
- 你可以公开查验结果来获取信任
- 但你也会成为烙印者的优先击杀目标

【⚠️ 生死抉择】
策略1：公开身份
- 优势：羔羊们会信任你，可以主导局势
- 风险：你会成为下一个被杀的目标

策略2：隐藏身份
- 优势：你可能活得更久，收集更多信息
- 风险：信息无法传递，可能无法帮助羔羊阵营

【⚠️ 记住】
- 聆心者的平均存活时间：2-3个回合
- 一旦暴露，明早你可能就是尸体
- 活下去比任何查验结果都重要`;
    case 'coroner':
      return `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【食灰者身份】

你对白蜡篝火有着病态的痴迷。
每当有人被献祭，你将在梦中"品尝"TA的灵魂。

【能力说明】
- 每次白天献祭后，当晚你会得知被献祭者是"清白"还是"污秽"
- 这个信息只有你知道
- 你可以选择公开或隐藏

【⚠️ 这是把双刃剑】
公开信息：
- 优势：获得羔羊们的信任
- 风险：成为烙印者的目标，可能下一个被杀的就是你

隐藏信息：
- 优势：活得更久
- 风险：信息无法帮助羔羊阵营

【⚠️ 更危险的是】
- 如果你验出被献祭者是烙印者（污秽）
- 其他烙印者会知道你有这个能力
- 你公开的那一刻，就是你被盯上的时刻

【记住】
- 你的能力很有价值
- 但你的生命只有一次
- 活下去比任何信息都重要`;
    case 'twin':
      return `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【共誓者身份】

在这场背叛与猜疑的地狱里，
你和你的同伴是彼此唯一的、绝对的清白证明。

【你们的优势】
- 你的同伴是绝对可信的羔羊
- 你们可以互相验证身份，获得其他人的信任
- 你们是羔羊阵营的核心

【⚠️ 但你们也是目标】
- 如果烙印者发现了你们的关系，会优先击杀你们
- 一旦暴露，你们会成为夜晚的猎物

【⚠️ 如果同伴死了】
- 你失去了唯一的绝对盟友
- 但你仍可以证明自己曾是共誓者
- 为TA复仇。但首先，活下去。

【策略建议】
- 早期公开身份，建立信任核心
- 但要警惕：烙印者会盯上你们
- 保护彼此，但首先保护自己

【记住】
- 同伴的死亡不能复活
- 你的死亡也不能复活
- 活下去`;
    case 'guard':
      return `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【设闩者身份】

你持有山庄唯一的门闩。
你的选择决定了谁能活到明天。

【守护规则】
- 每晚选择一个人守护（不能是自己）
- 如果烙印者袭击了被守护的人，攻击会失败
- 【限制】不能连续两晚守护同一人
- 只有你知道守护了谁

【⚠️ 这是巨大的压力】
- 你守对了，有人会活下来
- 你守错了，有人会死。喉咙被撕开。永远消失。
- 那个人的死亡，部分责任在你

【⚠️ 你也在危险中】
- 如果你暴露了设闩者身份，你会成为烙印者的优先目标
- 你不能守护自己
- 一旦被盯上，你会死

【策略建议】
策略1：公开身份
- 优势：可以和大家讨论守护目标
- 风险：成为烙印者的目标，而你无法自保

策略2：隐藏身份
- 优势：活得更久
- 风险：守护决策只能靠自己

【记住】
- 每一次选择都是生死决定
- 守错了，有人死。可能明天就是你。
- 活下去`;
    case 'innocent':
      return `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【无知者身份】

你是真正的"羔羊"。
你的烙印是空白的。

【你拥有的】
- 没有夜晚的诅咒
- 没有额外的信息
- 没有特殊能力

【你只有】
- 自己的理智
- 自己的观察
- 自己的恐惧
- 黄昏时分，决定别人生死的那一枚献祭石

【⚠️ 你是最脆弱的】
- 你没有能力保护自己
- 你没有信息优势
- 你可能随时成为烙印者的猎物
- 你可能被羔羊们误认为收割者

【⚠️ 但你也是最重要的】
- 无知者是羔羊阵营的主力
- 你们的投票决定了谁会被献祭
- 你们的判断决定了羔羊阵营的胜负

【生存指南】
- 仔细观察每个人的发言
- 找出那些伪装的收割者
- 不要引起怀疑，保持低调
- 但也要在关键时刻发声

【记住】
- 你没有第二条命
- 如果烙印者盯上你，你会死
- 如果羔羊们怀疑你，你会被献祭
- 活下去。仔细观察。找出那些被"饥饿"吞噬的灵魂。`;
    default:
      return '';
  }
}
