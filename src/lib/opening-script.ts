/**
 * 开场 CG 的分镜脚本。旁白一律摘自原版序章原句，十五人的话摘自各自原版自述的结尾。
 * 原版序章本身不动：CG 播完后照常写进记录。
 *
 * 每个镜头的 id 给音频用：开场组件在镜头开始时派发 `whitefire:opening` 事件（detail: { shot, seconds }）。
 */

export interface OpeningLine {
  /** 说话的人；旁白不填 */
  who?: string;
  zh: string;
}

export interface OpeningShot {
  id: string;
  /** artSrc 的路径，如 'scenes/cellar'；不填是黑场 */
  art?: string;
  seconds: number;
  lines: OpeningLine[];
  /** 标题镜头：大字显示「白烬山口」 */
  title?: boolean;
}

// 十五人按抵达的先后：猎人第一个到，女仆最后一个
const ARRIVALS: [string, string, OpeningLine[]][] = [
  [
    'arrive_marcus',
    'arrivals/marcus',
    [{ who: '马库斯·霍克', zh: '我不指望活着回去。' }],
  ],
  [
    'arrive_nora',
    'arrivals/nora',
    [
      {
        who: '诺拉·格雷',
        zh: '至于山口中流传的诅咒和怪谈？那不过是无知者的迷信罢了。',
      },
    ],
  ],
  [
    'arrive_eileen',
    'arrivals/eileen',
    [
      {
        who: '艾琳·哈钦斯',
        zh: '如果我真的死在这里，至少我不是空着手去见他们。',
      },
    ],
  ],
  [
    'arrive_crowley',
    'arrivals/crowley',
    [
      { who: '托马斯·克劳利', zh: '一个男人要失败多少次，才有资格被原谅？' },
      {
        who: '莉迪亚·克劳利',
        zh: '我只需要确保托马斯活着回去——即使我讨厌他，即使他不值得。',
      },
    ],
  ],
  [
    'arrive_white',
    'arrivals/white',
    [
      {
        who: '本杰明·怀特',
        zh: '如果必须有人死在这座山里，我会确保那不是我。',
      },
      { who: '亚历山大·莫里斯', zh: '只要我还拿着账本，我就能活下去。' },
    ],
  ],
  [
    'arrive_victor',
    'arrivals/victor',
    [
      {
        who: '维克多·斯通',
        zh: '我的目标是拿到钱，买够一辈子的酒，然后找个安静的地方喝到死。',
      },
    ],
  ],
  [
    'arrive_emily',
    'arrivals/emily',
    [{ who: '艾米莉·卡特', zh: '为什么好人总是死得最惨，而恶人却能苟活？' }],
  ],
  [
    'arrive_samuel',
    'arrivals/samuel',
    [{ who: '塞缪尔·布莱克伍德', zh: '这是我最后的救赎机会。' }],
  ],
  [
    'arrive_oliver',
    'arrivals/oliver',
    [
      {
        who: '奥利弗·佩恩',
        zh: '也许这次旅行能让我证明，即使是懦夫也能做点有用的事。',
      },
    ],
  ],
  [
    'arrive_sophia',
    'arrivals/sophia',
    [
      { who: '索菲亚·阿什福德', zh: '我会活下去。' },
      { who: '索菲亚·阿什福德', zh: '我会拿到报酬。' },
      { who: '索菲亚·阿什福德', zh: '我会重新成为索菲亚·阿什福德小姐。' },
    ],
  ],
  [
    'arrive_isabella',
    'arrivals/isabella',
    [
      {
        who: '伊莎贝拉·费尔法克斯',
        zh: '至于其他人？他们只是这场游戏中的棋子。',
      },
    ],
  ],
  [
    'arrive_charlotte',
    'arrivals/charlotte',
    [
      {
        who: '夏洛特·温特斯',
        zh: '我要成为明星。这座山只是我传奇故事的开始。',
      },
    ],
  ],
  [
    'arrive_claire',
    'arrivals/claire',
    [
      {
        who: '克莱尔·沃伦',
        zh: '我只想拿到那十英镑，然后找个没人认识我的小镇，重新开始。这个愿望很过分吗？',
      },
    ],
  ],
];

// 各镜头时长按日语配音实测（每句时长 + 句间 0.3 秒 + 约 1.5 秒余量）定，开场曲 opening.ogg 按这条时间轴制作：
// 27 秒开始抵达，133 秒暴雪，192 秒出标题，全长约 198 秒。改这里要同步改 scripts/audio/music.json 的 opening.parts
const SECONDS: Record<string, number> = {
  dark: 4,
  letter: 15,
  pass: 8,
  arrive_marcus: 5,
  arrive_nora: 7,
  arrive_eileen: 7,
  arrive_crowley: 14,
  arrive_white: 10,
  arrive_victor: 8,
  arrive_emily: 7,
  arrive_samuel: 5,
  arrive_oliver: 8,
  arrive_sophia: 11,
  arrive_isabella: 7,
  arrive_charlotte: 7,
  arrive_claire: 11,
  storm: 14,
  cellar: 6,
  testament: 17,
  days: 12,
  stones: 10,
  title: 6,
};

const SHOTS: OpeningShot[] = [
  { id: 'dark', seconds: 4, lines: [{ zh: '1913年，深冬。' }] },
  {
    id: 'letter',
    art: 'clues/letter',
    seconds: 7,
    lines: [
      { zh: '一份神秘的委托书，将十五个陌生人聚集在一起。' },
      { zh: '委托人承诺：完成任务，每人可得五百英镑——足以改变命运的金额。' },
    ],
  },
  {
    id: 'pass',
    art: 'scenes/mountain_pass',
    seconds: 6,
    lines: [{ zh: '有人为了钱，有人为了逃避，有人为了寻找，有人为了赎罪。' }],
  },
  ...ARRIVALS.map(
    ([id, art, lines]): OpeningShot => ({
      id,
      art,
      seconds: 3 + lines.length * 2,
      lines,
    })
  ),
  {
    id: 'storm',
    art: 'scenes/lodge_exterior',
    seconds: 7,
    lines: [
      { zh: '第二天，委托人没有出现。' },
      {
        zh: '取而代之的是，暴风雪如约而至——一场诡异的、不合时节的暴雪，封死了下山的所有道路。',
      },
    ],
  },
  {
    id: 'cellar',
    art: 'scenes/cellar',
    seconds: 5,
    lines: [{ zh: '第三天，他们在山庄的地窖里发现了一封遗书。' }],
  },
  {
    id: 'testament',
    art: 'clues/diary',
    seconds: 9,
    lines: [
      {
        zh: '"山灵警告：你们之中混入了三个非人者。它们会在夜晚猎杀真正的人类。"',
      },
      { zh: '"在收割与羔羊的对抗结束之前，暴风雪永远不会停止。"' },
    ],
  },
  {
    id: 'days',
    art: 'scenes/hall_night',
    seconds: 7,
    lines: [
      { zh: '第四天、第五天、第六天……食物越来越少，寒冷越来越深。' },
      { zh: '这样下去，所有人都会饿死，或冻死。' },
    ],
  },
  {
    id: 'stones',
    art: 'clues/stones',
    seconds: 8,
    lines: [
      { zh: '今天，是第七天。' },
      { zh: '在绝望与恐惧的驱使下，他们决定：按照遗书的指示，举行献祭仪式。' },
    ],
  },
  {
    id: 'title',
    art: 'scenes/title',
    seconds: 6,
    title: true,
    lines: [{ zh: '黎明到来。游戏，正式开始。' }],
  },
];

export const OPENING_SHOTS: OpeningShot[] = SHOTS.map((shot) => ({
  ...shot,
  seconds: SECONDS[shot.id] ?? shot.seconds,
}));
