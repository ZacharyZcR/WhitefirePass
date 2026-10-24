/**
 * Story text - opening line, prologue and intro pages
 * 白烬山口 (Whitefire Pass) - 寂静山庄 (Silent Lodge)
 */

import { TESTAMENT_PAGES } from './clues-data';

export interface StoryMessage {
  from: string;
  content: string;
}

/** Replaces the first system message in createGame */
export const OPENING_LINE = `1913年，深冬。

十四封信，寄到了十四个地址。山上却摆好了十五把椅子。

点击「下一步」，故事将会开始……`;

/**
 * Diary pages shown by StoryIntro (same shape as its DIARY_ENTRIES: { date, text }).
 * Single source: the 1903 testament in clues-data.
 */
export const STORY_INTRO_PAGES: { date: string; text: string }[] = TESTAMENT_PAGES;

/** Narrative part of the prologue (without the role announcement) */
export const PROLOGUE_MESSAGES: StoryMessage[] = [
  {
    from: '叙述者',
    content: `1913年11月，十四封信在同一个星期里，寄到了十四个地址。

奶油色的信纸，灰色火漆，火漆上压着一个谁也认不出的符号。没有回信地址。邮戳被雨水洇开了，只辨得出"白烬"两个字。

每封信开出的条件都不一样。有的许以五百英镑，有的许以一卷古籍、一座舞台、一份赦免。有一封只写了一句：你失去的东西，在山上。

后来他们在火边对过信，才发现一件事：每一封信开出的，都恰好是收信人最缺的那样东西。

信上的字迹工整，有点老派。墨水是褐色的，像是放了很多年。`,
  },
  {
    from: '叙述者',
    content: `他们从伦敦、爱丁堡、曼彻斯特，从米德兰的矿镇出发，在约克换乘马车，沿着越来越窄的山路往北。

车夫把他们放在山口下的岔路，不肯再往上走。他说那座山庄十年没人住了，又说，上一次有人雇他送客上山，也是十五个。

可他们推开门的时候，大厅的壁炉里燃着火。

火是白的。没有柴，没有烟，靠近了只觉得冷。长桌上摆好了十五副餐具，每张椅背上别着一张卡片，写着他们的名字。

十五个人里，有一个并没有收到信。她的椅子也摆在那里。

委托人没有出现。`,
  },
  {
    from: '叙述者',
    content: `第二天夜里，雪下来了。

不是从天上落的那种雪，是横着走的，像有人在背后推。到天亮，下山的路已经认不出来。马库斯·霍克出去探路，走了不到半里就折回来。他说雪地上只有他自己的脚印——他们来时留下的车辙和脚印，一夜之间全不见了。

第三天，有人在书房的写字台里找到一本旧日记，日期是1903年10月。

日记的主人和他们一样，是十五个人里的一个。越往后，字迹越乱。最后几页有暗红的指印，书页里夹着一枝压干的石南花。

墙上那幅油画里，也是十五个人。`,
  },
  {
    from: '叙述者',
    content: `同一天，他们擦去壁炉上方一块铜牌上的积灰。

诺拉·格雷认出那是拉丁文，夹着窗棂上那种更古老的符号——和信封上火漆的符号是同一个。她推了推眼镜，念出来，声音很平：

"十五人入此门，契约即成。
其中有兽，披人之皮，夜里进食。
人中有一，第二日背誓，从兽。
白昼，以石择一人，献于白火。
兽尽，门开。人尽，雪止。"

最后一行，她念了两遍。`,
  },
  {
    from: '叙述者',
    content: `起初没有人信。

托马斯·克劳利说这是一出排得很用心的戏。夏洛特·温特斯说不，戏比这有分寸。亚历山大·莫里斯什么也没说，在黑皮本子上记下了日期。

第四天，第五天，第六天。面包切得越来越薄，煤油灯只点一盏。有人开始咳嗽，有人整夜不睡，有人在门边一坐就是一个下午，像在等谁来敲门。

雪没有停。白火也没有灭。`,
  },
  {
    from: '叙述者',
    content: `第七天清晨，长桌上多了十五块石头。

灰白色，河滩上常见的那种，握在手里是温的。每块石头压着一张卡片，和椅背上的名字一一对应。

没有人记得是谁放的。

他们围着白火站了很久。最后是神父先开口，引了一句经文。事后诺拉想起来，那一句的出处，他说错了。

献祭，从今天开始。`,
  },
];

const ROLE_LABELS: [key: string, label: string][] = [
  ['listener', '聆心者'],
  ['coroner', '食灰者'],
  ['twin', '共誓者'],
  ['guard', '设闩者'],
  ['innocent', '无知者'],
];

/** Final prologue message: faction counts and role notes */
export function buildRoleAnnouncement(roleCounts: Record<string, number>): string {
  const count = (role: string): number => roleCounts[role] || 0;
  const lambLine = ROLE_LABELS.map(([key, label]) => `${count(key)}名${label}`).join('、');

  return `【契约已成 · 身份已烙】

收割阵营：${count('marked')}名烙印者，另有${count('heretic')}人将会背誓
羔羊阵营：${lambLine}

铜牌上说："人中有一，第二日背誓，从兽。"
此刻，那个人还站在羔羊之中，连自己也不知道。

【角色说明】

▸ 烙印者（收割阵营）
  - 彼此知晓身份，每晚集体选择一名猎物
  - 白天必须伪装成羔羊
  - 目标：让收割者的人数不少于羔羊

▸ 背誓者（收割阵营）
  - 第一天仍是羔羊，灵魂清白，本人也毫不知情
  - 第一夜过后誓言断裂，从第二天起灵魂转为"污秽"
  - 不知道烙印者是谁；烙印者只知道"有这样一个人"
  - 不参与夜晚的猎杀，只能用白天的言语和石头帮助收割

▸ 聆心者（羔羊阵营）
  - 每晚可查验一名玩家是"清白"还是"污秽"
  - 掌握关键信息，也最容易成为目标

▸ 食灰者（羔羊阵营）
  - 每次白天献祭后，当晚会得知被献祭者是"清白"还是"污秽"

▸ 共誓者（羔羊阵营）
  - 两名共誓者互相知晓身份
  - 是彼此唯一的绝对信任

▸ 设闩者（羔羊阵营）
  - 每晚可守护一名玩家（不能是自己）
  - 被守护者当晚不会被杀
  - 不能连续两晚守护同一人

▸ 无知者（羔羊阵营）
  - 没有特殊能力
  - 依靠观察和推理找出收割者

天亮了。第一个白天，开始讨论……`;
}

/** Convenience: full prologue including the role announcement */
export function buildPrologueMessages(roleCounts: Record<string, number>): StoryMessage[] {
  return [...PROLOGUE_MESSAGES, { from: '叙述者', content: buildRoleAnnouncement(roleCounts) }];
}
