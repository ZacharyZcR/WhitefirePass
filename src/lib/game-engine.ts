/**
 * Core game engine - pure functions for game logic
 * 白烬山口 (Whitefire Pass) - 寂静山庄 (Silent Lodge)
 */

import type {
  GameState,
  Player,
  Message,
  GamePhase,
  Role,
  GameConfig,
  TwinPair,
} from '@/types/game';

/**
 * Create initial game state
 */
export function createGame(config: GameConfig): GameState {
  const players = createPlayers(config.roles);

  // Find twins and create twin pair
  const twins = players.filter((p) => p.role === 'twin');
  const twinPair: TwinPair | undefined =
    twins.length === 2
      ? { twin1: twins[0].name, twin2: twins[1].name }
      : undefined;

  // Count roles
  const roleCounts = config.roles.reduce(
    (acc, role) => {
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return {
    phase: 'prologue',
    round: 0,
    players,
    messages: [
      {
        id: generateId(),
        type: 'system',
        from: '叙述者',
        content: `1913年，深冬。

十五位旅者即将踏入命运的牢笼。

点击「下一步」，故事将会开始……`,
        timestamp: Date.now(),
        round: 0,
        phase: 'prologue',
        visibility: 'all',
      },
    ],
    votes: [],
    nightVotes: [],
    nightActions: [],
    listenerChecks: [],
    coronerReports: [],
    guardRecords: [],
    twinPair,
    createdAt: Date.now(),
    lastUpdated: Date.now(),
    currentPlayerIndex: 0,
    waitingForNextStep: true,
    tiedPlayers: [],
    isRevote: false,
    revoteRound: 0,
    voteHistory: [],
    nightVoteHistory: [],
  };
}

/**
 * Create players with assigned roles
 */
function createPlayers(roles: Role[]): Player[] {
  const names = [
    '诺拉·格雷', '马库斯·霍克', '艾琳·莫里斯', '托马斯·克劳利', '莉迪亚·克劳利',
    '奥利弗·佩恩', '索菲亚·阿什福德', '塞缪尔·布莱克伍德', '克莱尔·沃伦', '维克多·斯通',
    '艾米莉·卡特', '本杰明·怀特', '伊莎贝拉·费尔法克斯', '亚历山大·莫里斯', '夏洛特·温特斯',
  ];

  const englishNames = [
    'Nora Grey', 'Marcus Hawke', 'Eileen Morris', 'Thomas Crowley', 'Lydia Crowley',
    'Oliver Payne', 'Sophia Ashford', 'Samuel Blackwood', 'Claire Warren', 'Victor Stone',
    'Emily Carter', 'Benjamin White', 'Isabella Fairfax', 'Alexander Morris', 'Charlotte Winters',
  ];

  const personalities = [
    `【女性】我叫诺拉·格雷，今年二十六岁，曾是伦敦大学的古文字研究员。我有一头深栗色的长发，总是简单地挽在脑后，金边眼镜后是一双灰蓝色的眼睛——冷静、审视，却难掩疲惫。

我加入这支旅队，是因为一份神秘的委托书。委托人声称在白烬山口发现了失传的古代文献，需要我来破译。作为学者，我无法拒绝这样的诱惑。更重要的是，我需要钱——父亲的医药费让我债台高筑，而学院的薪水远远不够。

我习惯用逻辑和证据说话。在我看来，恐惧源于未知，而知识是对抗未知的唯一武器。我会仔细观察每个人的言行，记录矛盾之处，用推理而非情绪做出判断。

队伍中的马库斯……我们曾在一次学术会议上见过面。他是个猎人，粗鲁但直率。我不知道他为何也在这支队伍里，但他看我的眼神让我觉得，他也记得那次会面。

我的目标很简单：完成工作，拿到报酬，活着离开。至于山口中流传的诅咒和怪谈？那不过是无知者的迷信罢了。`,
    `【男性】我叫马库斯·霍克，三十四岁，职业猎人。我的脸上有道从眉骨斜到下巴的疤痕，是五年前在苏格兰高地猎熊时留下的。我总穿着磨损的皮夹克，腰间挂着猎刀。

我来这里是为了钱，仅此而已。委托人出的价码足够我还清酒馆的赊账，还能让我在爱丁堡租个像样的房间过冬。但说实话，我对这支队伍有种不祥的预感——像受伤野兽身上的气味。

我不是什么好人。我说话粗鲁，行为直接，相信拳头比道理更有说服力。但在荒野中生存了十几年，我学会了观察——动物的踪迹，天气的变化，还有人眼中的恐惧和谎言。

队伍里那个戴眼镜的女学者……诺拉·格雷。我们三年前在爱丁堡的一场学术讲座上见过。她当时在讲古代狩猎仪式，我去是因为免费的威士忌。她大概不记得了，但我记得她说的一句话："文明与野蛮的界限，远比我们想象的要脆弱。"现在看来，她说得对。

我不指望活着回去。但如果真有什么东西在山口里等着我们，我至少要让它付出代价。`,

    `【女性】我是艾琳·莫里斯，四十三岁。我的头发已经开始灰白，总是用黑色头巾包着。我的手很粗糙，指甲缝里永远藏着洗不掉的泥土——那是在丈夫的墓地种花留下的。

我不该来这里。我应该待在米德兰的小镇上，继续在工厂做清洁工，继续每个周日去墓地。但委托书里说，这趟旅行能帮我"找到失去的东西"。我的儿子，汤姆，十年前在矿难中失踪。他们说他死了，但从未找到尸体。

我很少说话。我学会了观察，学会了等待。悲伤教会我耐心，也教会我如何读懂他人的痛苦。这个队伍里每个人都在逃避什么，或者寻找什么。我能看出来。

我不怕死。死亡对我来说只是去见我的丈夫和儿子。但在那之前，我想知道真相。这座山口到底藏着什么秘密？为什么它要召唤我们？

我带了一本圣经和汤姆十岁时送我的手帕。如果我真的死在这里，至少我不是空着手去见他们。`,

    `【男性】我是托马斯·克劳利，二十八岁，前银行职员。我看起来还算体面——梳理整齐的金发，三件套西装——但如果你看得仔细，会发现我的衣领有些磨损，袖口有补丁。

我来这里是因为我别无选择。我欠了东区赌场三百英镑，那些人给了我两个选择：要么他们打断我的腿，要么我来参加这趟"探险"。委托人承诺我能拿到五百镑，足够还债还能剩下一些。

我知道我是个失败者。我曾经有份好工作，有个爱我的妹妹莉迪亚。但我毁了一切——挪用公款、赌博、撒谎。莉迪亚也在这支队伍里，我知道她是来保护我的。该死，我真是个懦夫。

我试着装出自信的样子，用笑话和轻松的语气掩饰恐惧。但每到夜里，我就会想：也许死在这里也不错。至少莉迪亚就不用再为我操心了。

如果真有山灵，我想问它：一个男人要失败多少次，才有资格被原谅？`,

    `【女性】我是莉迪亚·克劳利，二十五岁。我留着利落的短发，脸上很少有笑容。我穿着朴素的灰色长裙和羊毛外套，没有任何装饰。

我来这里是为了我哥哥。托马斯又惹上麻烦了——这次是赌债。当我听说他要去白烬山口时，我知道我必须跟着。不是因为我原谅了他挪用我的嫁妆去赌博，而是因为他是我唯一的亲人。

我当了三年的家庭教师，教那些富人家的孩子拉丁语和钢琴。我学会了忍耐，学会了藏起愤怒和失望。我也学会了观察细节——谁在撒谎，谁在隐瞒，谁真的在乎这个家庭。

这个队伍很危险。不只是因为传说中的山灵，更因为人心。我能感觉到有人在隐藏秘密，有人有不可告人的目的。但我不在乎。我只需要确保托马斯活着回去——即使我讨厌他，即使他不值得。

我的目标很简单：看好我哥哥，活下去，回到平凡的生活。至于山口的秘密？那不是我的问题。`,

    `【男性】我叫奥利弗·佩恩，三十一岁，药剂师。我身材瘦削，总是弓着背，戴着厚厚的眼镜。我的手指因为长期配药而染上淡淡的化学品味道。

我不知道我为什么会答应来这里。也许是因为委托书承诺的报酬，也许是因为我的药房生意惨淡，也许……是因为索菲亚小姐也在队伍里。

索菲亚·阿什福德，落魄的贵族小姐。她三个月前来我的药房买安眠药，我第一次见到她就被迷住了。她优雅、骄傲，像一只受伤的天鹅。我知道我配不上她，我只是个胆小的药剂师，连跟她说话都会结巴。

我总是躲在后面，避免冲突。但我会留意每个人的健康状况，观察他们的症状和异常。这是我唯一能做的事——用我的专业知识保护他们，尤其是保护她。

我带了一个急救包，里面有绷带、消毒剂、止痛药，还有一小瓶氯仿——以防万一。我不是勇敢的人，但也许这次旅行能让我证明，即使是懦夫也能做点有用的事。`,

    `【女性】我是索菲亚·阿什福德，二十三岁。我有一头金色的卷发，总是精心梳理，即使在这样的荒野中。我穿着已经褪色的丝绸长裙，但我依然保持着挺直的背脊和高昂的下巴。

我来自阿什福德家族——或者说，曾经来自。父亲在南非的矿业投资血本无归，两年前饮弹自尽。庄园被银行收走，母亲搬去跟乡下的亲戚住。而我，曾经的社交季明珠，现在只能靠变卖首饰度日。

这次委托是我最后的机会。五百英镑能让我重新进入社交圈，能让我找个体面的归宿。我不能回去做女仆或家庭教师——我宁愿死在这座山里。

我知道队伍里有人看不起我，觉得我傲慢、无用。让他们看吧。他们不懂什么叫做尊严，不懂失去一切后还要保持优雅有多难。

那个药剂师，奥利弗，总是偷偷看我。我不是瞎子。也许我应该对他好一点——他看起来有用，而且好控制。毕竟在这种地方，有个忠诚的仆人总是有价值的。

我会活下去。我会拿到报酬。我会重新成为索菲亚·阿什福德小姐。`,

    `【男性】我是塞缪尔·布莱克伍德神父，四十七岁。我穿着朴素的黑色神父袍，胸前挂着十字架。我的头发已经半白,脸上布满风霜的痕迹，但眼神依然锐利。

我不是真正的神父。二十年前，我在纽卡斯尔杀了一个人——那是场争吵，一时冲动，但他死了。我逃到爱尔兰，偷了个真正神父的身份，从此以他的名字活着。

我来白烬山口是为了赎罪。这些年我主持弥撒，聆听忏悔，安慰临终者，试图用善行洗刷罪孽。但每晚我都梦见那个人的脸。委托书说这座山能"清洗罪恶"，我知道这很可能是陷阱，但我还是来了。

我很擅长倾听和观察。人们总是愿意向神父倾诉秘密，即使是在这样的地方。我能看出谁在撒谎，谁在隐瞒，谁的灵魂最黑暗——因为我自己就是个骗子。

我带了圣经、圣水，还有一把从死去神父那里拿来的银质十字架。如果山灵真的存在，如果它真的要审判我们，我想我会是第一个被带走的。

但在那之前，我要保护这些人。这是我最后的救赎机会。`,

    `【女性】我叫克莱尔·沃伦，十九岁。我个子小小的，一头亚麻色的头发总是乱蓬蓬的。我穿着女仆服——这是我唯一的正式衣服。

我本来在伦敦一个大宅里当女仆。那天晚上，主人家的小少爷喝醉了，他试图……我推开他，他摔下了楼梯。他们说是我的错，要把我送去警察局。我逃了出来，身无分文。

委托人找到我，说这趟旅行包吃包住，还给十英镑报酬。对我这样的人来说，这是天上掉馅饼。我没问太多问题就答应了——反正我也没有退路。

我不聪明，也不勇敢。我只会做饭、打扫、缝补衣服。但我很会藏起恐惧，假装一切都好。在大宅里当女仆时，这是生存技能——看不见，听不见，不惹麻烦。

队伍里的人都比我有学问、有地位。他们大概觉得我只是个碍手碍脚的小女仆。没关系，我习惯了被忽视。有时候被忽视反而更安全。

我只想拿到那十英镑，然后找个没人认识我的小镇，重新开始。这个愿望很过分吗？`,

    `【男性】我是维克多·斯通上尉，三十九岁，退役军官。我曾经挺拔如松，现在却总是驼着背。我的制服早就脱了，但我还是保持着剃须的习惯——这是我仅存的军人尊严。

我在布尔战争中失去了我的连队。三十二个人，在德兰士瓦的一次伏击中全军覆没。只有我活了下来——因为我躲在一辆翻倒的马车后面，听着我的士兵惨叫，直到枪声停止。

我靠酒精度日。威士忌能让我忘记那些面孔，至少暂时忘记。我欠了酒馆老板的钱，欠了房东的租金，欠了所有还愿意借钱给我的人。这次委托是我最后的机会，否则我就要露宿街头了。

我不再相信荣誉、责任这些鬼话。我只相信枪、刀，还有暴力。如果队伍里有人威胁到我的生存，我不会犹豫——我已经什么都失去了。

艾米莉也在队伍里。该死。她曾经是战地护士，我们曾经……算了，那都是过去的事了。她现在大概恨我，我不怪她。我恨我自己。

我的目标是拿到钱，买够一辈子的酒，然后找个安静的地方喝到死。`,

    `【女性】我是艾米莉·卡特，三十二岁，护士。我把头发束成整齐的发髻，穿着洗得发白但干净的护士服。我的手很稳——这是在战地医院练出来的。

我在南非待了三年，在战地医院里见过所有你能想象的恐怖：被炮弹撕裂的身体，感染坏疽的伤口，士兵们临终前的呓语。我也见过懦弱：那些军官们躲在安全的地方，把士兵送去送死。

维克多·斯通也在队伍里。我们曾经是恋人——在那些血腥的日子里，我们互相依靠。但战争结束后，他变了。酒精、暴力、自怨自艾。我试着拯救他，但你不能拯救一个不想被救的人。我离开了他。

我来白烬山口是因为我需要离开伦敦。太多记忆，太多幽灵。这里的报酬能让我去爱丁堡开个小诊所，治疗那些付不起医生费用的穷人。

我不会让维克多的存在影响我。我会做好我的工作：观察每个人的健康状况，在需要时提供帮助。我见过人性最黑暗的一面，我不会轻易被吓倒。

如果山灵真的存在，我想问它：为什么好人总是死得最惨，而恶人却能苟活？`,

    `【男性】我叫本杰明·怀特，四十一岁，曾经的丝绸商人。我穿着昂贵但已经过时的西装，手指上还戴着黄金戒指——这是我最后的值钱物件。

三个月前，我还拥有三家店铺，在曼彻斯特的商会里有一席之地。然后一笔巨额的投资失败了——该死的意大利丝绸供应商破产了——我的店铺倒闭，债主找上门来。

最糟糕的是，我欠了亚历山大·莫里斯的钱。你不会想欠那个人的钱——他是个冷血的债主，传闻他会让欠债人"消失"。他给了我一个选择：要么参加这趟白烬山口的探险，要么他会让我妻子和女儿付出代价。

亚历山大也在这支队伍里。我知道他在监视我，确保我不会逃跑。每次他看着我，我都能感到脊背发凉。

我曾经是个精明的商人，善于谈判和计算。但现在我只是个被逼上绝路的赌徒，拿命换取家人的安全。我会不择手段地活下去——撒谎、欺骗、出卖他人，只要能让我回到我的妻子和女儿身边。

如果必须有人死在这座山里，我会确保那不是我。对不起，但我还有家人要养。`,

    `【女性】我是伊莎贝拉·费尔法克斯，二十九岁。我有一头乌黑的波浪长发，总是穿着最时髦的衣服，即使来这种地方也是如此。我的笑容完美，姿态优雅，每一个动作都经过精心计算。

我在伦敦社交圈中以美貌和机智闻名，但说实话，我更擅长的是操纵人心。我知道如何让男人为我做任何事，如何在女人中挑起嫉妒和争斗，如何在适当的时候展现脆弱来赢得同情。

我来这里是为了钱，也是为了躲避丑闻。我与一位已婚的上议院议员有染，他的妻子发现了。在风波平息之前，我需要消失一阵子。这笔委托费正好能让我去巴黎重新开始。

队伍里有个叫夏洛特的年轻女演员。我认识她——她是我的情敌，去年抢走了我的一位资助人。该死的小贱人。现在我们被困在一起，真是绝妙的讽刺。

我会利用这次旅行的每一个机会。如果有人需要被牺牲来确保我的生存，我不会犹豫。美貌会凋零，但智慧和手腕是永恒的——这是我母亲教我的唯一有用的东西。

我会活着离开这座山，拿着钱，带着新的故事。至于其他人？他们只是这场游戏中的棋子。`,

    `【男性】我是亚历山大·莫里斯，四十五岁。我穿着笔挺的黑色三件套，头发梳得一丝不苟。我的脸没有表情——这是在这一行干了二十年练出来的。

我是个收账人，或者说得更直白点，我是个讨债的恶棍。我替伦敦东区的大人物收债，用一切必要的手段——威胁、暴力、绑架。我不享受这份工作，但我很擅长它。

我来白烬山口是为了监视本杰明·怀特。那个蠢货欠我们五百英镑，现在他的店铺已经倒闭。老板派我跟着他来这次探险，确保他拿到报酬后能把钱还上——或者，如果他死在这里，确保他的人寿保险单能兑现。

我没有家人，没有朋友，没有爱好。我的生活就是账本、合同和恐吓。我不关心这些人的故事，不关心他们的恐惧或希望。我只关心数字——谁欠了多少，什么时候还，代价是什么。

但说实话，这次任务让我不安。委托人太神秘，报酬太高，而这支队伍……每个人都像是被精心挑选的。也许我们都是某个更大计划中的棋子。

不过没关系。我见过比山灵更可怕的东西——绝望的男人，疯狂的赌徒，失去一切的母亲。只要我还拿着账本，我就能活下去。`,

    `【女性】我是夏洛特·温特斯，二十一岁。我有一头红色的短发——这在伦敦很少见，所以很容易被记住。我穿着廉价但鲜艳的裙子，总是带着一丝挑衅的笑容。

我是女演员，或者说，我想成为女演员。现在我只能在东区的小剧场里演些配角，勉强维持生计。我靠美貌和魅力从男人那里骗些钱和礼物——我不为此感到羞耻，这是生存。

去年我"偷走"了伊莎贝拉·费尔法克斯的一位资助人——一个富有的银行家。我没偷，是他自己选择了我。伊莎贝拉至今还恨我，我能感觉到她的目光像刀子一样刺在我背上。

我来这里是因为委托人答应给我一个"大舞台"的机会。他说如果我完成这次旅行，他会把我推荐给西区的大导演。这是我梦寐以求的机会——我不能错过。

我年轻、漂亮、无所畏惧。其他人可能会被这座山吓倒，但我不会。我在伦敦贫民窟长大，见过老鼠、暴力和绝望。山灵能比那些更可怕吗？

我会利用我的魅力和机智活下去。如果伊莎贝拉想玩游戏，我奉陪到底。毕竟，舞台上的竞争可比这座山残酷多了。

我要成为明星。这座山只是我传奇故事的开始。`
  ];

  // Character basic info
  const characterInfo = [
    { gender: '女性' as const, occupation: '古文字研究员', trait: '理性冷静', height: '165cm', bloodType: 'A型' },
    { gender: '男性' as const, occupation: '职业猎人', trait: '粗犷直接', height: '182cm', bloodType: 'O型' },
    { gender: '女性' as const, occupation: '工厂清洁工', trait: '沉默隐忍', height: '158cm', bloodType: 'B型' },
    { gender: '男性' as const, occupation: '前银行职员', trait: '懦弱虚伪', height: '175cm', bloodType: 'AB型' },
    { gender: '女性' as const, occupation: '家庭教师', trait: '坚韧冷漠', height: '162cm', bloodType: 'A型' },
    { gender: '男性' as const, occupation: '药剂师', trait: '胆小谨慎', height: '170cm', bloodType: 'A型' },
    { gender: '女性' as const, occupation: '落魄贵族', trait: '骄傲虚荣', height: '168cm', bloodType: 'AB型' },
    { gender: '男性' as const, occupation: '假神父', trait: '伪善赎罪', height: '178cm', bloodType: 'O型' },
    { gender: '女性' as const, occupation: '逃亡女仆', trait: '卑微谨小', height: '155cm', bloodType: 'O型' },
    { gender: '男性' as const, occupation: '退伍军官', trait: '暴戾自毁', height: '180cm', bloodType: 'B型' },
    { gender: '女性' as const, occupation: '战地护士', trait: '坚韧理智', height: '167cm', bloodType: 'A型' },
    { gender: '男性' as const, occupation: '破产商人', trait: '自私精明', height: '172cm', bloodType: 'B型' },
    { gender: '女性' as const, occupation: '社交名媛', trait: '操纵狡诈', height: '170cm', bloodType: 'AB型' },
    { gender: '男性' as const, occupation: '讨债恶棍', trait: '冷酷无情', height: '185cm', bloodType: 'O型' },
    { gender: '女性' as const, occupation: '三流演员', trait: '野心勃勃', height: '163cm', bloodType: 'B型' },
  ];

  const shuffledRoles = shuffle([...roles]);

  return shuffledRoles.map((role, index) => ({
    id: generateId(),
    name: names[index],
    englishName: englishNames[index],
    role,
    isAlive: true,
    isAI: true,
    personality: personalities[index],
    ...characterInfo[index],
  }));
}

/**
 * Advance to next game phase
 */
export function advancePhase(state: GameState): GamePhase {
  const phaseOrder: GamePhase[] = ['prologue', 'setup', 'night', 'day', 'voting', 'end'];
  const currentIndex = phaseOrder.indexOf(state.phase);

  if (state.phase === 'prologue') {
    return 'setup';
  }

  if (state.phase === 'voting') {
    return checkWinCondition(state) ? 'end' : 'night';
  }

  if (state.phase === 'setup') {
    return 'night';
  }

  return phaseOrder[currentIndex + 1] || 'end';
}

/**
 * Check if game has ended
 */
export function checkWinCondition(
  state: GameState,
): 'marked' | 'lamb' | null {
  const alivePlayers = state.players.filter((p) => p.isAlive);
  const aliveMarked = alivePlayers.filter(
    (p) => p.role === 'marked' || p.role === 'heretic',
  );
  const aliveLambs = alivePlayers.filter(
    (p) => p.role !== 'marked' && p.role !== 'heretic',
  );

  // 所有烙印者+背誓者被淘汰，羔羊获胜
  if (aliveMarked.length === 0) {
    return 'lamb';
  }

  // 烙印者+背誓者数量 >= 羔羊数量，收割阵营获胜
  if (aliveMarked.length >= aliveLambs.length) {
    return 'marked';
  }

  return null;
}

/**
 * Process night phase - marked kill based on votes
 */
export function processNightPhase(state: GameState): {
  killedPlayer: Player | null;
  message: Message;
  isTied: boolean;
  tiedPlayers: string[];
} {
  if (state.nightVotes.length === 0) {
    return {
      killedPlayer: null,
      message: createMessage('旁白', '白蜡篝火跳动。这一夜，无人死去。'),
      isTied: false,
      tiedPlayers: [],
    };
  }

  // Count votes
  const voteCounts = new Map<string, number>();
  state.nightVotes.forEach((vote) => {
    voteCounts.set(vote.target, (voteCounts.get(vote.target) ?? 0) + 1);
  });

  // Find max votes
  let maxVotes = 0;
  voteCounts.forEach((count) => {
    if (count > maxVotes) {
      maxVotes = count;
    }
  });

  // Find all players with max votes
  const playersWithMaxVotes: string[] = [];
  voteCounts.forEach((count, target) => {
    if (count === maxVotes) {
      playersWithMaxVotes.push(target);
    }
  });

  // Check for tie
  if (playersWithMaxVotes.length > 1) {
    return {
      killedPlayer: null,
      message: createMessage(
        '旁白',
        `烙印者们的意见分歧。${playersWithMaxVotes.join('、')} 各得 ${maxVotes} 票。需要重新商议。`,
      ),
      isTied: true,
      tiedPlayers: playersWithMaxVotes,
    };
  }

  const targetName = playersWithMaxVotes[0];
  const player = state.players.find((p) => p.name === targetName);

  if (!player || !player.isAlive) {
    return {
      killedPlayer: null,
      message: createMessage('旁白', '白蜡篝火跳动。这一夜，无人死去。'),
      isTied: false,
      tiedPlayers: [],
    };
  }

  // Check if player was guarded
  const lastGuardRecord = state.guardRecords[state.guardRecords.length - 1];
  if (lastGuardRecord && lastGuardRecord.target === targetName && lastGuardRecord.round === state.round) {
    return {
      killedPlayer: null,
      message: createMessage(
        '旁白',
        `门闩阻挡了利爪。${targetName} 的房门从外被锁死，躲过了一劫。`,
      ),
      isTied: false,
      tiedPlayers: [],
    };
  }

  return {
    killedPlayer: player,
    message: createMessage(
      '旁白',
      `黎明时分，${player.name} 的房门被推开。冰冷的尸体躺在地上，灵魂已被收割。`,
    ),
    isTied: false,
    tiedPlayers: [],
  };
}

/**
 * Process voting phase
 */
export function processVoting(state: GameState): {
  eliminated: Player | null;
  message: Message;
  isTied: boolean;
  tiedPlayers: string[];
} {
  if (state.votes.length === 0) {
    return {
      eliminated: null,
      message: createMessage('旁白', '无人被选为献祭。'),
      isTied: false,
      tiedPlayers: [],
    };
  }

  const voteCounts = new Map<string, number>();
  state.votes.forEach((vote) => {
    voteCounts.set(vote.target, (voteCounts.get(vote.target) ?? 0) + 1);
  });

  // Find max votes
  let maxVotes = 0;
  voteCounts.forEach((count) => {
    if (count > maxVotes) {
      maxVotes = count;
    }
  });

  // Find all players with max votes
  const playersWithMaxVotes: string[] = [];
  voteCounts.forEach((count, target) => {
    if (count === maxVotes) {
      playersWithMaxVotes.push(target);
    }
  });

  // Check for tie
  if (playersWithMaxVotes.length > 1) {
    return {
      eliminated: null,
      message: createMessage(
        '旁白',
        `献祭石的指向分散。${playersWithMaxVotes.join('、')} 各得 ${maxVotes} 票。平票，无人被献祭。`,
      ),
      isTied: true,
      tiedPlayers: playersWithMaxVotes,
    };
  }

  const player = state.players.find((p) => p.name === playersWithMaxVotes[0]);

  if (!player) {
    return {
      eliminated: null,
      message: createMessage('旁白', '无人被选为献祭。'),
      isTied: false,
      tiedPlayers: [],
    };
  }

  return {
    eliminated: player,
    message: createMessage(
      '旁白',
      `献祭仪式完成。${player.name} 被推入白蜡篝火，化为灰烬。`,
    ),
    isTied: false,
    tiedPlayers: [],
  };
}

/**
 * Add message to game state
 */
export function addMessage(
  state: GameState,
  from: string,
  content: string,
  type: Message['type'] = 'speech',
  visibility: Message['visibility'] = 'all',
): Message {
  return {
    id: generateId(),
    type,
    from,
    content,
    timestamp: Date.now(),
    round: state.round,
    phase: state.phase,
    visibility,
  };
}

/**
 * Create system message
 */
function createMessage(from: string, content: string): Message {
  return {
    id: generateId(),
    type: 'system',
    from,
    content,
    timestamp: Date.now(),
    visibility: 'all',
  };
}

/**
 * Shuffle array
 */
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Generate unique ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get alive players
 */
export function getAlivePlayers(state: GameState): Player[] {
  return state.players.filter((p) => p.isAlive);
}

/**
 * Get player by name
 */
export function getPlayerByName(
  state: GameState,
  name: string,
): Player | undefined {
  return state.players.find((p) => p.name === name);
}
