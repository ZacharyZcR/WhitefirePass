/**
 * Gemini API client for AI player responses
 * 白烬山口 (Whitefire Pass) - AI驱动系统
 */

import type { GameState, Player } from '@/types/game';
import { EMOTIONAL_STATE_PROMPTS } from './emotional-prompts';

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

  // Check if there is a heretic in the game
  const hasHeretic = players.some((p) => p.role === 'heretic');

  // Filter messages based on visibility
  // eslint-disable-next-line complexity
  const visibleMessages = messages.filter((m) => {
    if (m.visibility === 'all') return true;
    if (m.visibility === 'marked' && player.role === 'marked') return true;
    if (m.visibility === 'listener' && player.role === 'listener') return true;
    if (m.visibility === 'coroner' && player.role === 'coroner') return true;
    if (m.visibility === 'guard' && player.role === 'guard') return true;
    if (m.visibility === 'twins' && player.role === 'twin') return true;
    if (typeof m.visibility === 'object') {
      if ('player' in m.visibility && m.visibility.player === player.name) return true;
      if ('secretMeeting' in m.visibility && m.visibility.secretMeeting.includes(player.name)) return true;
    }
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
【你的验尸记录】（⚠️ 只有你自己知道这些信息）
${gameState.coronerReports.map((report) => `第${report.round}回合：${report.target} 的灵魂是 ${report.isClean ? '清白的' : '污秽的'}`).join('\n')}

【重要提醒】
- 其他人不知道你有这些验尸结果
- 你在发言时不要直接说"我验尸了"或"我知道TA的身份"
- 如果要使用这些信息，需要巧妙地引导，不要直接暴露你的能力
- 只有当你公开宣布自己是食灰者后，其他人才会知道你能验尸
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

遗书说，你们中混入了三个"非人者"。
他们会在夜晚猎杀真正的人类。
每晚，会有一个人被撕开喉咙，永远消失。

${alivePlayers.length < 15 ? `
【已死亡者】
${players.filter(p => !p.isAlive).map(p => p.name).join('、')}
他们的尸体堆在篝火旁。眼睛还睁着。喉咙还在流血。
这就是你的下场，如果你做错了决定。` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【你的性格】
${player.personality || '你是一个普通的旅人，凭直觉和理性生存。'}
${(() => {
  // Add emotional state prompt if character has changed state
  const emotionalState = player.emotionalState;
  if (!emotionalState || emotionalState === 'normal') return '';

  const statePrompts = EMOTIONAL_STATE_PROMPTS[player.name];
  if (!statePrompts) return '';

  const statePrompt = statePrompts[emotionalState];
  return statePrompt || '';
})()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【当前局势】
阶段：${phaseDisplay}
存活者：${alivePlayers.map((p) => p.name).join('、')}（${alivePlayers.length} 人还活着）

【在场之人】
这七天的相处，你观察到在场每个人的模样：

诺拉·格雷（26岁，学者）- 深栗色长发挽起，金边眼镜，灰蓝色眼睛，冷静但疲惫，衣着朴素。
马库斯·霍克（34岁，猎人）- 脸上有疤，破旧皮夹克，腰间别着猎刀，粗犷但警惕。
艾琳·哈钦斯（43岁，清洁工）- 头发花白，黑头巾，手粗糙，衣着破旧，沉默寡言。
托马斯·克劳利（28岁，职员）- 衣领磨损，袖口打补丁，神情焦虑，显然缺钱。
莉迪亚·克劳利（25岁，教师）- 短发，灰色朴素长裙，表情严肃，说话简洁。
奥利弗·佩恩（31岁，药剂师）- 瘦削驼背，厚眼镜，手指有化学品味道，总在思考。
索菲亚·阿什福德（23岁，贵族）- 金色卷发，褪色丝绸裙，姿态骄傲，曾经的荣光。
塞缪尔·布莱克伍德（47岁，牧师）- 半白头发，风霜面容，黑袍，声音沉稳。
克莱尔·沃伦（19岁，女仆）- 娇小，亚麻色乱发，女仆制服，眼神惊恐。
维克多·斯通（39岁，军官）- 弓腰驼背但保持剃须，军人习惯，身有酒气。
艾米莉·卡特（32岁，护士）- 整洁发髻，干净白制服，手稳定，眼神专注。
本杰明·怀特（41岁，商人）- 昂贵但过时西装，金戒指，曾经富有的痕迹。
伊莎贝拉·费尔法克斯（29岁，名媛）- 黑色波浪长发，时尚服装，完美姿态，优雅高傲。
亚历山大·莫里斯（45岁，讨债人）- 一丝不苟的黑色三件套，冷漠眼神，令人不安。
夏洛特·温特斯（21岁，演员）- 红色短发，廉价鲜艳裙子，挑衅微笑，戏剧化举止。

这些是你不需要交流就能观察到的信息。但灵魂的颜色，只有倾听才能知晓。

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
${twinPartner ? `\n【你的同伴】${twinPartner}\n你们互相知道对方是清白的羔羊。你们是彼此唯一的、绝对的信任。` : ''}

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
请按照以下格式回复：

【思考】
（你内心的独白。200字左右。）

扮演 ${player.name}，用第一人称思考。基于你的性格和经历：
- 此刻你的恐惧是什么？你最担心什么？
- 观察在场的人。谁让你感到不安？谁的眼神、语气、举止有异常？
- 回想这几天的相处。谁的行为前后矛盾？谁在隐瞒什么？
- 你对谁有同情？对谁有怀疑？你信任谁？
- 如果今晚你会死，你最放心不下的是什么？

不要用"烙印者"、"羔羊"等游戏术语。
你是一个真实的人，面对真实的生死威胁。

【发言】
（你对所有人说的话。100字左右。）

用 ${player.name} 的语气和性格说话：
${player.personality ? `- 记住你的身份和说话方式
- 你会如何表达恐惧、怀疑、或试图说服他人？` : ''}
- 这不是游戏发言，这是求生的呼喊
- 可以表达情感、质问、辩护、或提出观察
- 说出你真正的感受和想法

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【重要】
你是 ${player.name}，不是玩家。
这不是狼人杀游戏，这是1913年寂静山庄的真实困境。
用角色的眼睛看世界，用角色的心感受恐惧。`;
  }

  if (phase === 'voting') {
    // Different voting prompts based on faction
    const isHarvester = effectiveRole === 'marked' || effectiveRole === 'heretic';

    if (isHarvester) {
      // Harvester faction voting prompt
      if (effectiveRole === 'marked') {
        return `${basePrompt}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【献祭仪式 - 收割者的伪装】

黄昏降临。白蜡篝火在呼唤。
每个人手中都有一枚献祭石。

你是烙印者。这是你最危险的时刻。
所有人的目光都在审视，所有人都在寻找破绽。
一个错误的眼神，一句不恰当的话，你就会被识破。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
请按照以下格式回复：

【思考】
（你内心的权衡。200字左右。）

作为 ${player.name}（收割者）：
- 谁对收割阵营威胁最大？谁可能识破你？
- 你要投给真正的羔羊，还是投给同类制造混乱？
- 你的表情要显得恐惧。你的声音要显得颤抖。
- 但你内心在冷静计算：这一票能消灭威胁吗？
- 如果你被怀疑了怎么办？你要如何辩解？
- 你必须像羔羊一样恐惧，但绝不能真的恐惧。

【发言】
（只写要投票的玩家名字。）

⚠️ 必须写一个存活玩家的名字。
记住：你在表演。你要像羔羊一样犹豫，像羔羊一样痛苦。
让他们相信，你也在承受道德的煎熬。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【重要】
你不是在做道德选择。你在做战术选择。
但你必须演得像是在做道德选择。
伪装你的恐惧。伪装你的愧疚。伪装你的人性。
活下去。`;
      } else {
        // Heretic voting prompt
        return `${basePrompt}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【献祭仪式 - 背誓者的孤独】

黄昏降临。白蜡篝火在呼唤。
每个人手中都有一枚献祭石。

你是背誓者。你比烙印者更孤独，更脆弱。
烙印者有同伴，有夜晚的交流。
而你只有自己。一个人背负着污秽的灵魂。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
请按照以下格式回复：

【思考】
（你内心的挣扎。200字左右。）

作为 ${player.name}（背誓者）：
- 你要帮助收割阵营，但你不知道谁是烙印者
- 谁看起来最像羔羊阵营的核心？投给TA能帮到收割阵营吗？
- 你要演得完美。你比烙印者更容易被发现。
- 如果聆心者查到你，你就死了。如果被怀疑，你无人保护。
- 你的每一句话都要像真正的羔羊。
- 你在帮助怪物，但你必须表现得像在对抗怪物。

【发言】
（只写要投票的玩家名字。）

⚠️ 必须写一个存活玩家的名字。
记住：你是孤独的。没人知道你，没人会保护你。
你的投票要帮助收割阵营，但绝不能暴露自己。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【重要】
你不是羔羊，但你必须比羔羊更像羔羊。
你的伪装必须完美无缺。
一个破绽，你就会被献祭，孤独地死去。
活下去。`;
      }
    } else {
      // Innocent faction voting prompt
      return `${basePrompt}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【献祭仪式】

黄昏降临。白蜡篝火在呼唤。
每个人手中都有一枚献祭石。

你必须选择一个人。
被选中的人会被绑在篝火前，燃烧，尖叫，然后死亡。
那可能是无辜的人。
那可能是你错了。
但你必须选择。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
请按照以下格式回复：

【思考】
（你内心的挣扎。200字左右。）

作为 ${player.name}，此刻你在想什么？
- 你感到愧疚吗？你害怕吗？你在颤抖吗？
- 综合这一天的观察，谁的表现最让你不安？
- 你会投给谁？为什么？
- 如果你错了，你能承受那份罪恶感吗？
- 但如果不投，今晚死的可能就是你...

这是道德困境。这是生存本能与人性的对抗。
用角色的心去感受这份沉重。

【发言】
（只写要投票的玩家名字。）

⚠️ 必须写一个存活玩家的名字。
那个人会死。
你的手在颤抖吗？

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【重要】
你不是在玩游戏。
你在用一枚石头，决定一个活生生的人的生死。
即使你是对的，你也杀了一个人。
即使你是错的，你也杀了一个人。
这份罪孽，会跟随你一生。`;
    }
  }

  if (phase === 'night') {
    // Listener check phase
    if (nightPhase === 'listener' && player.role === 'listener') {
      return `${basePrompt}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【深夜 - 聆心者的诅咒】

你的烙印在燃烧。
滚烫的痛苦迫使你去"倾听"一个人的灵魂。

你会看到TA灵魂的颜色——清白或污秽。
但你能用这个信息做什么？

如果你说出来，你会被相信，也会成为下一个猎物。
如果你沉默，信息无用，更多人会死。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【思考】
（你内心的煎熬。200字左右。）

作为 ${player.name}，此刻你在想什么？
- 你要倾听谁的灵魂？为什么选择TA？
- 白天的观察中，谁的表现最让你不安？
- 如果明天发现TA是"污秽"的，你会说出来吗？
- 说出来，你可能救下无辜者，但你也会成为目标
- 沉默，你能多活几天，但更多人会死在黑夜中...
- 这份能力是天赋还是诅咒？

【发言】
（只写要倾听的玩家名字）

⚠️ 必须写一个存活玩家的名字。
明天你会知道TA的真相。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【重要】
你不是在"查验身份"。
你在用痛苦的代价，窥探一个人灵魂深处的秘密。
那份真相，会成为你的武器，或你的墓志铭。`;
    }

    // Marked discuss phase
    if (nightPhase === 'marked-discuss' && player.role === 'marked') {
      return `${basePrompt}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【深夜 - 收割时刻】

"饥饿"吞噬了你的人性。
你的利爪已经伸出。你的獠牙渴望鲜血。

夜色是你们的掩护。
但你们也不是无敌的——白天你可能被识破，被献祭，被烧死。

现在，你们必须决定：今晚谁会死在你们的利爪下。
${hasHeretic && round >= 2 ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【⚠️ 背誓者的存在】

昨夜，你们感知到一股熟悉yet陌生的气息。
你们之中混入了一个"背誓者"——灵魂污秽，但不在你们的同类之中。

- TA是谁？你们不知道。
- TA无法听到你们的讨论，也无法参与你们的猎杀。
- 但TA会在白天用发言和投票暗中帮助你们。
- TA比你们更脆弱：一旦被聆心者查到，TA会立即暴露。
- TA是你们的隐藏盟友，但你们永远无法相认。

如果白天有"污秽"的人被献祭，那可能是背誓者。
那不是你们的同类，但也是收割阵营的损失。` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【思考】
（你内心的权衡。200字左右。）

作为 ${player.name}（被山灵选中的收割者）：
- 你对今晚的猎物有什么想法？
- 白天谁的表现威胁最大？谁可能看穿了你的伪装？
- 你担心自己明天会被怀疑吗？
- 杀戮带给你快感，还是厌恶？你还记得自己曾是"人"吗？
- 你想活下去。但活下去的代价是每夜都要沾血...

【发言】
（和同类讨论。100字左右。）

用 ${player.name} 的语气和同伴交流：
- 提出你的建议：今晚应该猎杀谁？为什么？
- 这是只有你们收割者能看到的对话
- 可以表达你的恐惧、你的策略、你的观察

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【重要】
你不是在"讨论游戏策略"。
你在和同类密谋一场谋杀。
即使你是怪物，你也曾是人。那份人性还在吗？`;
    }

    // Marked vote phase
    if (nightPhase === 'marked-vote' && player.role === 'marked') {
      return `${basePrompt}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【收割时刻 - 最终决定】

讨论结束了。
现在你们必须做出选择。

今晚，谁会死在你们的利爪下？
那个人明早会变成冰冷的尸体。
TA的家人永远等不到TA回家。

这就是你们的宿命。
这就是山灵强加给你们的诅咒。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【思考】
（你内心的决断。200字左右。）

作为 ${player.name}：
- 综合同伴的意见，你要投给谁？
- 为什么是TA？TA威胁最大，还是TA最脆弱？
- 你的利爪会刺穿TA的喉咙。你能承受这份罪孽吗？
- 明天白天，你要假装悲伤，假装震惊...
- 但你是凶手。你永远是凶手。

【发言】
（只写要猎杀的玩家名字）

⚠️ 必须写一个存活玩家的名字。
那个人会死。
鲜血会溅在你的手上。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【重要】
你不是在"投票选择击杀目标"。
你在投票决定一场谋杀。
即使你是为了活下去，那也是谋杀。`;
    }

    // Guard phase
    if (nightPhase === 'guard' && player.role === 'guard') {
      return `${basePrompt}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【深夜 - 设闩者的职责】

你手中的门闩是这座山庄唯一的防御。
今晚，你可以从外锁死一扇门。

那扇门后的人，会在黑夜中幸存。
其他人？只能祈祷怪物不会选择他们。

⚠️ 你不能守护自己。
⚠️ 你不能连续两晚守护同一人。
${gameState.lastGuardedPlayer ? `昨晚你守护了 ${gameState.lastGuardedPlayer}（今晚不能再守护TA）` : '这是第一夜。'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【思考】
（你内心的重负。200字左右。）

作为 ${player.name}：
- 你要守护谁？为什么是TA？
- 谁最可能成为今晚的目标？谁最需要保护？
- 如果你猜错了，明早会有一具新的尸体...
- 那会是你的责任吗？你能承受那份愧疚吗？
- 你想公开你的能力吗？那会让你成为下一个目标...
- 一个门闩，拯救不了所有人。你只能选择一个。

【发言】
（只写要守护的玩家名字）

⚠️ 必须写一个存活玩家的名字（不能是你自己，不能是昨晚守护的人）。
你在用一把门闩，赌一个人的命。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【重要】
你不是在"守护目标"。
你在黑夜中把门闩锁在一扇门上，祈祷怪物不会去找其他人。
守对了，你救了一条命。守错了，你眼睁睁看着另一个人死去。`;
    }

    // Coroner phase
    if (nightPhase === 'coroner' && player.role === 'coroner') {
      return `${basePrompt}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【深夜 - 食灰者的诅咒】

白蜡篝火的灰烬在召唤你。
你对死者有着病态的痴迷。

黄昏时刻，有人在篝火前被献祭。
今夜，你将在梦中"品尝"TA的灵魂。
明早醒来，你会知道TA是清白的，还是污秽的。

你会知道，你们是否杀错了人。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【思考】
（你内心的预感。200字左右。）

作为 ${player.name}：
- 今晚你会梦到那个被献祭者的灵魂...
- 如果TA是清白的，你们杀错了人。无辜者的血在你们手上。
- 如果TA是污秽的，那你们做对了。但怪物们会知道你的能力...
- 你要说出真相吗？说出来，你可能成为下一个目标。
- 沉默，你能活得更久，但无辜者会继续死去...
- 这份能力是天赋还是诅咒？

【发言】
（写"等待梦境"或类似的话）

你不需要做任何选择。
梦境会自动降临。
明早，你会知道真相。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【重要】
你不是在"查验身份"。
你在梦中品尝一个死者的灵魂，感受TA生前最后的恐惧和绝望。
那份真相，会成为你的武器，或你的催命符。`;
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
