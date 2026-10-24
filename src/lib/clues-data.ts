/**
 * Clue data - predefined documents and artifacts
 */

import type { Clue } from '@/types/game';

/**
 * The traveler's testament - written by one of the previous fifteen (1903).
 * Markup: {category:type}text{/category}; {redacted:x}███{/redacted} for blacked-out words.
 */
export const TESTAMENT_PAGES: { date: string; text: string }[] = [
  {
    date: '1903年10月24日',
    text: `我们一行{warning:fifteen}十五人{/warning}，在约克雇了两辆马车，北上{place:white}白烬山口{/place}考察矿脉。

委托书是寄到领队手上的。奶油色的信纸，没有回信地址，封口是一枚灰色火漆，压着一个谁也认不出的符号。领队说对方出手阔绰，不必多问。

领队说这里的地质构造很特殊，可能蕴藏着{redacted:rich}███{/redacted}。大家都很兴奋。

队里最小的是托米，说自己二十岁。他下巴上连胡茬都没有，我猜顶多十七。上山的路上他跳下车，在路边采了一把石南，说要压平了带回去给他母亲——他走的时候答应过她，回去给她带山上的野花。

他胸前口袋里总塞着一块叠得方方正正的手帕，角上绣着一朵歪歪扭扭的蓝花。他说是他十岁时自己绣的，一共两块，另一块在他母亲那里，一人一块。车夫笑了他一路，他也不恼。

下午四时许，我们抵达半山腰的{place:lodge}避难山庄{/place}。窗棂上刻着奇怪的符文——我看了很久才想起来，委托书的火漆上就是这个符号。

门楣挂着褪色的{redacted:strange}███{/redacted}。

晚上八点，风雪{warning:storm}骤起{/warning}，呼啸声像{fear:howl}野兽在哀嚎{/fear}。

领队一直望着窗外。他说{redacted:bad}███{/redacted}。`,
  },
  {
    date: '1903年10月25日',
    text: `{warning:door}门打不开了{/warning}。所有的门窗都打不开。

我们用斧头劈、用肩膀撞，木门纹丝不动。像有{redacted:seal}███{/redacted}把我们封在了里面。

领队说这不合常理。他来过这里{redacted:times}███{/redacted}次，从未遇到这种情况。说这话的时候，他没有看我们。

大厅的壁炉里燃着{cold:white}苍白的火焰{/cold}。没有柴薪，没有煤炭，没有烟。靠近了，只觉得{cold:chill}冷{/cold}。我们昨夜进门时，它就已经在那里了。

墙上挂着一幅油画。画中{warning:fifteen}十五个人{/warning}围成一圈，中央是{sacrifice:blood}一滩暗红色的东西{/sacrifice}。

我凑近看过。那十五张脸，每一张都像是被刮掉又重新画上去的，颜料一层压着一层。最上面那层，还没干透。

托米说画里有个人像他。我们都笑了。后来我又去看了一眼，没有笑出来。

夜里，我听到了{fear:whisper}呢喃{/fear}。不是风，不是人。是从那团{cold:white}白火{/cold}里传出来的。`,
  },
  {
    date: '1903年10月26日',
    text: `清晨醒来，我察觉到某种{fear:change}变化{/fear}。

有些人不一样了。眼神、说话的腔调、呼吸的节奏——都{redacted:wrong}███{/redacted}。

上午十点，领队把所有人叫到大厅。他手里握着一本{redacted:old}███{/redacted}的笔记本，说是昨夜在阁楼找到的。

"{contract:contract}山灵的契约{/contract}。"

笔记本上是拉丁文，夹着窗棂上那种更古老的文字。

据记载，很久以前，这座山庄的主人违背了{redacted:taboo}███{/redacted}，在山中犯下了{redacted:sin}███{/redacted}。山灵没有收走他的命，只收走了他的门。从此，{warning:cursed}这座山庄替山灵收账{/warning}。

{warning:fifteen}十五人同入此门{/warning}，契约即成。

{contract:pact}你们之中混入了三个非人者{/contract}。他们是{evil:marked}山魔的化身{/evil}，会在夜里{evil:hunt}猎杀真正的人{/evil}。

{contract:rule}白昼，找出他们，献祭于白火{/contract}。否则{evil:kill}所有人都会死{/evil}。

{contract:pact}非人者尽，门开{/contract}。

我想说领队疯了。可{cold:white}白火{/cold}还在烧，{warning:door}门还关着{/warning}。

夜里我睡不着，一直在想：我们这十五个人是怎么凑到一起的？领队说是他挑的人。可他挑人的时候，好像专挑身上背着东西的——测量员欠着一屁股赌债；厨子是从济贫院跑出来的；我{redacted:mine}███{/redacted}。连托米也是瞒着家里、多报了三岁才混进来的。

{fear:doubt}山灵要的，也许本来就不是随便哪十五个人{/fear}。`,
  },
  {
    date: '1903年10月27日',
    text: `{warning:warning}仪式开始了{/warning}。

昨夜，死的是托米。

考察队里最年轻的助手。他说自己二十岁——到最后，我们也只知道他报的这个岁数。

清晨我们在二楼走廊发现他。他{dead:corpse}蜷在墙角{/dead}，双眼圆睁，身上没有伤口，皮肤{cold:frozen}冰冷如霜{/cold}。屋里并不冷。

守夜的人说，后半夜听见走廊里有人轻轻叫了一声，像是在叫谁。

他右手攥着那块绣蓝花的手帕，攥得太紧，我们掰不开，就让他攥着了。

那把石南从他口袋里掉了出来，散在地板上。我一枝一枝捡起来，夹进了这本日记。

白天，我们必须{lamb:vote}投票决定献祭谁{/lamb}。这是{contract:rule}契约的铁律{/contract}：{sacrifice:vote}白昼审判，黑夜狩猎{/sacrifice}。

有几个人声称得到了{redacted:gift}███{/redacted}。有人说他能{redacted:see}███{/redacted}，看穿谁是{evil:marked}非人者{/evil}；有两个人说他们{redacted:bond}███{/redacted}；有人说他能{redacted:know}███{/redacted}，验明死者的底细。

谁说的是真话？谁在{evil:lie}编织谎言{/evil}？

争吵持续了五个小时。

最后，我们{sacrifice:vote}投票献祭了一个一直沉默的女孩{/sacrifice}。她是我的朋友，我们一起从约克来的。

我也举了手。

因为我{fear:survive}想活下来{/fear}。

天黑后，我们在{cold:white}白火{/cold}旁，将她{redacted:sacrifice}███{/redacted}。`,
  },
  {
    date: '1903年10月28日',
    text: `又死了两个。一个在夜里，一个在白昼的石头下面。

我们还剩{sacrifice:count}十一个人{/sacrifice}。

没有人相信任何人了。那些声称能{redacted:see}███{/redacted}的人，可能在说谎；那些宣称彼此{redacted:bond}███{/redacted}的人，可能在演戏。

{evil:marked}那三个{/evil}藏得太好。他们{fear:doubt}和我们一样害怕{/fear}，一样流泪，一样举手。

今晚领队喝醉了。他说了一句我到现在还在想的话。

他说他不是第一次来。{redacted:year}███{/redacted}年前，他也在这座山庄里，也是十五个人。那一次，他活下来了。

我问他：活下来的人，后来怎么样？

他盯着火看了很久，只说了两个字："欠着。"

我一直在{redacted:question}███{/redacted}，一直在提不同的意见。{evil:eyes}我感觉到有人在看我{/evil}。

今夜，如果那个声称能{redacted:protect}███{/redacted}的人不守着我的门——

{cold:white}白火{/cold}还在烧。它好像在{fear:watch}看着我{/fear}。`,
  },
  {
    date: '1903年10月29日 清晨四时',
    text: `如果有人找到这本日记——

我活不过今天。白昼的石头也会落在我身上。{evil:frame}他们已经让其他人相信，我是怪物{/evil}。

我想把知道的写下来。

{warning:warning}这座山庄不是避难所{/warning}。它是{sacrifice:altar}祭坛{/sacrifice}，是一本账。

委托书不是什么公司寄的。领队昨夜终于承认了：是他写的。字是他亲手写的，名字却不是他挑的。他说活下来的人欠山一笔债，十年以后，要替山庄把信寄出去。他说写信那天夜里，他坐在一张空桌子前，名字一个接一个，自己从纸上浮出来——每一个名字底下，都压着一件那人不肯说的事。

{contract:contract}每十年一次{/contract}。十五封信，十五个背着东西的人。

所以，读到这里的你——问问你自己：{fear:doubt}你的那封信，是谁写的{/fear}？还有：这一次活下来的人，十年以后，要替它写给谁？

如果你想活下来：仔细听每个人说话。{evil:marked}非人者{/evil}会彼此{redacted:signal}███{/redacted}，会把怀疑推给最安静的人。寻找那些得到{redacted:gift}███{/redacted}的人。

但{warning:warning}不要完全相信任何人{/warning}。

{fear:doubt}也许山灵在撒谎{/fear}。也许{evil:lie}真正的怪物，不是被指认的那几个{/evil}。

托米的石南还夹在这一页。要是有谁能活着出去，请替他把花带给他母亲。他说她住在米德兰，姓{redacted:surname}███{/redacted}。他说她会一直等。

我听到{fear:footsteps}脚步声{/fear}了。在走廊上。在门外。

原谅我。

{redacted:name}███{/redacted}

——一个即将被{sacrifice:sacrifice}献祭{/sacrifice}的羔羊

{contract:contract}仪式会继续{/contract}。

十年。又十年。

直到{redacted:end}███{/redacted}。`,
  },
];

export const TRAVELER_TESTAMENT: Clue = {
  id: 'testament-001',
  title: '迷路旅人的遗书',
  category: 'diary',
  description: '一本沾满灰尘的日记本，记录了前一批旅人的遭遇。最后几页有暗红色的指印，书页间夹着一枝压干的石南花……',
  date: '1903年10月24日 - 10月29日',
  unlockedAt: Date.now(),
  isRead: false,
  content: TESTAMENT_PAGES,
};

/**
 * Get initial clues that should be available at game start
 */
export function getInitialClues(): Clue[] {
  return [TRAVELER_TESTAMENT];
}
