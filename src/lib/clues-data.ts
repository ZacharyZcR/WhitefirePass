/**
 * Clue data - predefined documents and artifacts
 */

import type { Clue } from '@/types/game';

/**
 * The traveler's testament - first clue
 * This diary tells the story of the previous 15-person group
 * Set in early 20th century (1913, before WWI)
 */
export const TRAVELER_TESTAMENT: Clue = {
  id: 'testament-001',
  title: '迷路旅人的遗书',
  category: 'diary',
  description: '一本沾满灰尘的日记本，记录了前一批旅人的遭遇。最后几页带有暗红色的痕迹...',
  date: '1913年10月24日 - 10月29日',
  unlockedAt: Date.now(),
  isRead: false,
  content: [
    {
      date: '1913年10月24日',
      text: `我们一行{warning:fifteen}十五人{/warning}，从省城雇了马车来{place:white}白烬山口{/place}考察矿脉。

领队说这里的地质构造很特殊，可能蕴藏着{redacted:rich}███{/redacted}。大家都很兴奋，憧憬着发财的前景。

晚报说会有暴雪，但领队说山里的天气变化无常，不必太过担忧。我们带了足够一周的补给。

下午四时许，我们抵达半山腰的{place:lodge}避难山庄{/place}。这是一座古旧的木屋，窗棂上刻着奇怪的符文，门楣挂着褪色的{redacted:strange}███{/redacted}。

领队说我们会在此过夜，待明日天气转晴再继续上山。

现在是晚上八点。风雪突然{warning:storm}骤起{/warning}，呼啸声如同{fear:howl}野兽的哀嚎{/fear}。

煤油灯的光芒摇曳不定。领队的脸色很难看，一直望着窗外。

他说{redacted:bad}███{/redacted}。`,
    },
    {
      date: '10月25日',
      text: `暴雪依旧肆虐。更可怕的事发生了。

{warning:door}门打不开了{/warning}。所有的门窗都打不开。

我们用斧头劈、用身体撞，木门纹丝不动。就像有{redacted:seal}███{/redacted}把我们封在了这里。

领队说这不合常理。他来过这里{redacted:times}███{/redacted}次，从未遇到这种情况。

大厅中央的壁炉里，燃烧着{cold:white}苍白的火焰{/cold}。

那不是寻常的火。它散发的不是温暖，而是{cold:chill}彻骨的寒意{/cold}。

我问这是什么火，没人知道。昨夜我们抵达时，它就在那里燃烧着。没有柴薪，没有煤炭，{redacted:eternal}███{/redacted}。

墙上挂着一幅油画。画中{warning:fifteen}十五个人{/warning}围成圆圈，中央是{sacrifice:blood}一滩暗红色的液体{/sacrifice}。画框上刻着我看不懂的文字。

夜里，我听到了{fear:whisper}呢喃{/fear}。

不是风声，不是人声。

是从那{cold:white}苍白的火焰{/cold}中传来的，像是在召唤什么。`,
    },
    {
      date: '10月26日',
      text: `清晨醒来，我察觉到某种{fear:change}可怕的变化{/fear}。

有些人不一样了。

他们的眼神，言谈举止，甚至呼吸的节奏...都{redacted:wrong}███{/redacted}。

上午十点，领队将所有人召集到大厅。他的手在颤抖，握着一本{redacted:old}███{/redacted}的笔记本。

"昨夜，"他说，声音嘶哑，"昨夜我在阁楼找到了这个。"

"{contract:contract}山灵的契约{/contract}。"

他念出了笔记本上的内容。那是用拉丁文和古汉语混合写成的诅咒。

据记载，很久以前，这座山庄的主人违背了{redacted:taboo}███{/redacted}，在山中犯下了{redacted:sin}███{/redacted}的罪行。

山灵降下了{warning:cursed}永恒的诅咒{/warning}。

任何{warning:fifteen}十五人一同进入这座山庄{/warning}的群体，都会触发这古老的契约。

{contract:pact}必须献祭过半数，幸存者方可离开{/contract}。

契约会{evil:marked}标记其中三人{/evil}，赋予他们{redacted:power}███{/redacted}的力量，让他们成为收割者。

其余的人是羔羊，必须找出收割者并将他们献祭，否则会在{redacted:nights}███{/redacted}夜之内被逐一猎杀。

我想说他疯了。

但那{cold:white}苍白的火焰{/cold}仍在燃烧，{warning:door}门窗依旧紧闭{/warning}。

而某些人的眼睛里，确实有某种{evil:dark}黑暗的东西{/evil}在闪烁。`,
    },
    {
      date: '10月27日',
      text: `{warning:warning}仪式开始了{/warning}。

昨夜，有人死了。

是考察队里最年轻的助手，才二十岁。清晨我们在二楼走廊发现他时，他{dead:corpse}蜷缩在墙角{/dead}，双眼圆睁，已经没有了呼吸。

尸体上没有伤口，没有挣扎的痕迹。但他的表情{fear:terror}扭曲得可怕{/fear}，仿佛在死前看到了{redacted:horror}███{/redacted}。

他的皮肤{cold:frozen}冰冷如霜{/cold}，就像被冻死的。但屋里并不冷。

那三个被标记的人，在昨夜做了这件事。

但我们不知道他们是谁。

白天，我们必须{lamb:vote}投票决定献祭谁{/lamb}。

这是{contract:rule}契约的铁律{/contract}：白昼审判，黑夜狩猎。要么{evil:hunt}猎杀所有羔羊{/evil}，要么{sacrifice:half}献祭过半数{/sacrifice}。

队伍中有几个人声称得到了{redacted:gift}███{/redacted}。

有人说他能看穿谁是{evil:marked}被标记者{/evil}，有人说他们两个心灵相连，有人说他能验明死者的身份。

但契约的力量扭曲了一切。谁说的是真话？谁又在{evil:lie}编织谎言{/evil}？

争吵持续了整整五个小时。所有人都在{fear:accuse}互相指责{/fear}，互相怀疑。

最后，我们{sacrifice:vote}投票决定献祭一个一直沉默的女孩{/sacrifice}。

她是我的朋友。我们一起从省城来的。

但我也举起了手，投了她。

因为我{fear:survive}想活下来{/fear}。

天黑后，我们在那{cold:white}苍白的火焰{/cold}旁，将她{redacted:sacrifice}███{/redacted}。`,
    },
    {
      date: '10月28日',
      text: `又一个白昼与黑夜的循环。

又死了两个人。昨夜一个，今日白昼被献祭一个。

我们还剩{sacrifice:count}十一个活人{/sacrifice}。

考察队已经{fear:broken}彻底瓦解{/fear}了。没有人相信任何人。

那些声称能{redacted:see}███{/redacted}的人，可能在说谎。

那些宣称彼此{redacted:bond}███{/redacted}的人，可能在伪装。

{evil:marked}被烙印的三人{/evil}隐藏得太好了。他们混在我们中间，{evil:lie}编织谎言{/evil}，引导猜疑，制造混乱。

而我们这些羔羊，只能凭借{fear:guess}猜测和恐惧{/fear}做出判断。

我开始怀疑，我会是下一个。

因为我一直在{redacted:question}███{/redacted}，在提出不同的意见。

收割者不会放过这样的人。我看到了{evil:eyes}他们的眼神{/evil}。

{fear:target}我成了他们的目标{/fear}。

今夜，如果那个声称能{redacted:protect}███{/redacted}的人不保护我...

我恐怕活不过明天的太阳。

{cold:white}苍白的火焰{/cold}依旧在燃烧。它好像在{fear:watch}注视着我{/fear}。`,
    },
    {
      date: '1913年10月29日 清晨四时',
      text: `如果有人找到这本日记...

我在天亮前会死。

我{fear:certain}确信无疑{/fear}。昨夜我看到了{evil:eyes}他们的眼神{/evil}，那种{redacted:hunger}███{/redacted}的眼神。

白昼的投票也会指向我。他们已经成功地在众人面前{evil:frame}将我塑造成了威胁{/evil}。

我想在生命的最后时刻，把真相记录下来。

{warning:warning}这座山庄从来不是什么避难所{/warning}。

它是{sacrifice:altar}祭坛{/sacrifice}。一座用{redacted:bones}███{/redacted}和{redacted:blood}███{/redacted}筑成的祭坛。

{contract:contract}山灵的契约是真实存在的{/contract}。{warning:fifteen}每当有十五人同时踏入这里{/warning}，{warning:cursed}古老的诅咒{/warning}就会苏醒。

如果你想在这场{fear:nightmare}噩梦{/fear}中幸存：

仔细观察每个人。{evil:marked}被烙印者{/evil}会在言语中露出破绽，会彼此{redacted:signal}███{/redacted}，会转移怀疑。

寻找那些得到{redacted:gift}███{/redacted}的人。有人能{redacted:see}███{/redacted}，有人能{redacted:know}███{/redacted}，有人能{redacted:protect}███{/redacted}。

但{warning:warning}永远不要完全相信任何人{/warning}。

这场仪式的本质就是{evil:lie}谎言{/evil}和{fear:betrayal}背叛{/fear}。

我听到{fear:footsteps}脚步声{/fear}了。在走廊上。在门外。

{cold:white}苍白的火焰{/cold}在{redacted:calling}███{/redacted}。

原谅我。

{redacted:name}███{/redacted}

1913年10月29日清晨

——一个即将被{sacrifice:sacrifice}献祭{/sacrifice}的羔羊

{contract:contract}仪式会继续{/contract}。

一代又一代。

直到{redacted:end}███{/redacted}。`,
    },
  ],
};

/**
 * Get initial clues that should be available at game start
 */
export function getInitialClues(): Clue[] {
  return [TRAVELER_TESTAMENT];
}
