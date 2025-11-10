/**
 * Story introduction component with diary/journal format
 * Displays the story of the "16th person" through diary entries
 */

'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Skull, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface StoryIntroProps {
  open: boolean;
  onComplete: () => void;
}

/**
 * Diary entries - Testament from one of the original 15 travelers
 * The first lamb to be sacrificed in their ritual
 * Format: {keyword:type}text{/keyword}
 * {redacted:text}███{/redacted} for redacted content
 */
const DIARY_ENTRIES = [
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
];

/**
 * Parse story text and identify keywords
 * Format: {category:type}text{/category}
 * Example: {fear:terror}恐惧{/fear} -> applies "terror" style
 */
function parseStoryText(text: string) {
  const segments: Array<{ text: string; type?: string }> = [];
  let currentIndex = 0;
  // Use [\s\S] instead of . to match newlines
  const regex = /\{(\w+):(\w+)\}([\s\S]*?)\{\/\1\}/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > currentIndex) {
      segments.push({ text: text.slice(currentIndex, match.index) });
    }
    // Add the keyword with its type (match[2] is the style type after colon)
    segments.push({ text: match[3], type: match[2] });
    currentIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (currentIndex < text.length) {
    segments.push({ text: text.slice(currentIndex) });
  }

  return segments;
}

/**
 * Get CSS classes for keyword types (diary theme)
 */
function getKeywordClasses(type: string): string {
  const classes: Record<string, string> = {
    // Redacted content - black blocks
    redacted: 'bg-slate-900 text-slate-900 select-none px-1 rounded',

    // Places
    white: 'text-cyan-300 font-bold animate-pulse drop-shadow-[0_0_8px_rgba(165,243,252,0.8)]',
    lodge: 'text-amber-200 font-semibold tracking-wider',
    place: 'text-amber-200 font-semibold',

    // Evil/Danger
    evil: 'text-red-500 font-bold drop-shadow-[0_0_10px_rgba(239,68,68,1)]',
    hunger: 'text-red-500 font-bold animate-pulse drop-shadow-[0_0_10px_rgba(239,68,68,1)]',
    marked: 'text-red-500 font-bold underline decoration-wavy',
    mark: 'text-red-400 font-bold animate-pulse drop-shadow-[0_0_10px_rgba(248,113,113,1)]',
    dark: 'text-red-600 font-bold italic',
    eyes: 'text-red-400 font-semibold',
    frame: 'text-red-400 font-semibold italic',
    hunt: 'text-red-600 font-semibold',
    hunter: 'text-slate-400 font-semibold',
    kill: 'text-red-700 font-bold',
    lie: 'text-red-400 font-semibold italic',
    truth: 'text-red-500 font-bold drop-shadow-[0_0_12px_rgba(239,68,68,1)]',
    cycle: 'text-red-400 font-bold italic drop-shadow-[0_0_8px_rgba(248,113,113,0.8)]',
    fake: 'text-red-400 italic line-through',
    blend: 'text-red-400 italic',
    coordinate: 'text-red-400 font-semibold',
    deflect: 'text-red-400 font-semibold',

    // Sacrifice/Death
    sacrifice: 'text-red-700 font-bold drop-shadow-[0_0_8px_rgba(127,29,29,0.9)]',
    blood: 'text-red-700 font-bold',
    first: 'text-red-600 font-bold underline',
    balance: 'text-amber-600 font-bold',
    hope: 'text-slate-400 italic',
    night: 'text-slate-600 font-semibold italic',
    price: 'text-amber-600 font-bold',
    dead: 'text-slate-500 font-bold line-through decoration-double',
    last: 'text-slate-400 italic',
    wound: 'text-red-500 italic',
    half: 'text-amber-500 font-bold',
    vote: 'text-blue-300 font-semibold',
    count: 'text-amber-400 font-bold',
    altar: 'text-purple-500 font-bold drop-shadow-[0_0_8px_rgba(168,85,247,0.7)]',

    // Contract/Rule
    contract: 'text-amber-400 font-bold tracking-wide drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]',
    pact: 'text-amber-400 font-bold italic',
    rule: 'text-amber-300 font-semibold underline decoration-dotted',

    // Fear/Terror/Despair
    fear: 'text-slate-400 font-semibold italic',
    terror: 'text-slate-300 font-bold animate-pulse',
    panic: 'text-slate-400 font-bold italic',
    despair: 'text-slate-500 font-bold italic',
    freeze: 'text-cyan-400 italic',
    doubt: 'text-slate-400 italic',
    guilt: 'text-slate-400 italic underline',
    sorry: 'text-slate-400 italic',
    footsteps: 'text-slate-400 italic underline decoration-wavy',
    shadow: 'text-slate-500 font-semibold italic',
    stare: 'text-slate-300 font-bold',
    whisper: 'text-slate-400 italic drop-shadow-[0_0_6px_rgba(148,163,184,0.5)]',
    tremble: 'text-slate-400 italic underline decoration-wavy',
    strange: 'text-amber-400 font-semibold underline decoration-wavy',
    avoid: 'text-slate-400 italic',
    hollow: 'text-slate-500 font-semibold italic',
    trapped: 'text-slate-500 font-bold',
    prepare: 'text-slate-400 font-semibold',
    many: 'text-slate-500 italic',
    run: 'text-red-500 font-bold underline decoration-double',
    feel: 'text-slate-400 italic',
    eyes: 'text-slate-300 font-semibold',
    chaos: 'text-red-400 font-bold italic',
    collapse: 'text-red-500 font-bold',
    guess: 'text-slate-400 italic',
    vocal: 'text-slate-400 italic underline',
    target: 'text-red-500 font-bold underline',
    die: 'text-red-600 font-bold',
    frame: 'text-red-400 font-semibold italic',

    // Cold/Ice
    cold: 'text-cyan-300 font-semibold drop-shadow-[0_0_6px_rgba(165,243,252,0.6)]',
    ice: 'text-cyan-400 font-bold animate-pulse drop-shadow-[0_0_8px_rgba(165,243,252,0.8)]',
    fire: 'text-cyan-300 font-semibold drop-shadow-[0_0_6px_rgba(165,243,252,0.5)]',
    burning: 'text-cyan-300 italic',

    // Warning/Danger
    warning: 'text-red-400 font-bold drop-shadow-[0_0_10px_rgba(248,113,113,0.8)]',
    fifteen: 'text-amber-400 font-bold',
    painting: 'text-amber-300 font-semibold italic',
    seal: 'text-purple-400 font-semibold',
    close: 'text-red-500 font-bold',
    signal: 'text-slate-400 line-through',
    door: 'text-red-400 font-bold',
    times: 'text-slate-400 italic',
    change: 'text-amber-400 font-bold',
    storm: 'text-slate-400 font-bold',
    howl: 'text-slate-500 italic',
    chill: 'text-cyan-400 font-semibold',
    corpse: 'text-slate-600 font-semibold',
    frozen: 'text-cyan-400 italic',
    accuse: 'text-red-400 italic',
    broken: 'text-red-500 font-bold',
    watch: 'text-amber-500 italic',
    certain: 'text-slate-400 font-bold',
    nightmare: 'text-purple-500 font-bold italic',
    betrayal: 'text-red-500 font-bold italic',
    cursed: 'text-purple-500 font-bold italic drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]',
    punishment: 'text-red-500 font-bold',

    // Curse/Storm
    curse: 'text-amber-500 font-semibold drop-shadow-[0_0_8px_rgba(245,158,11,0.7)]',
    storm: 'text-slate-400 font-semibold drop-shadow-[0_0_6px_rgba(148,163,184,0.6)]',

    // Good/Observation/Survival
    lamb: 'text-blue-400 font-semibold drop-shadow-[0_0_6px_rgba(96,165,250,0.6)]',
    observe: 'text-blue-400 font-semibold underline decoration-dotted',
    survive: 'text-blue-400 font-bold underline',
    trust: 'text-blue-400 font-semibold italic',
    seer: 'text-purple-400 font-semibold',
    coroner: 'text-cyan-500 font-semibold',
    twin: 'text-teal-400 font-semibold',
    guard: 'text-amber-400 font-semibold',
    special: 'text-blue-300 italic',
    innocent: 'text-blue-300 font-semibold',

    // Cult/Mystery
    cult: 'text-purple-400 font-semibold italic',

    // Pain
    pain: 'text-red-500 font-bold animate-pulse',
    burn: 'text-red-500 font-bold',
  };
  return classes[type] || '';
}

export function StoryIntro({ open, onComplete }: StoryIntroProps) {
  const [currentEntryIndex, setCurrentEntryIndex] = useState(0);
  const [displayedChars, setDisplayedChars] = useState(0);
  const [isEntryComplete, setIsEntryComplete] = useState(false);

  const currentEntry = DIARY_ENTRIES[currentEntryIndex];
  const segments = parseStoryText(currentEntry.text.trim());
  const fullText = segments.map((s) => s.text).join('');

  // Reset when dialog opens or entry changes
  useEffect(() => {
    if (open) {
      setDisplayedChars(0);
      setIsEntryComplete(false);
    }
  }, [open, currentEntryIndex]);

  // Typewriter effect with faster speed
  useEffect(() => {
    if (!open) return;

    if (displayedChars < fullText.length) {
      // Faster speed: spaces fast, punctuation pause, normal chars moderate
      const currentChar = fullText[displayedChars];
      const delay = currentChar === ' ' ? 15 :
                    currentChar === '\n' ? 200 :
                    currentChar.match(/[,。，、！!？?：:]/) ? 250 :
                    currentChar.match(/["'「」『』【】]/) ? 100 :
                    40;

      const timer = setTimeout(() => {
        setDisplayedChars((prev) => prev + 1);
      }, delay);

      return () => clearTimeout(timer);
    } else {
      setIsEntryComplete(true);
    }
  }, [displayedChars, fullText, open]);

  const handleSkip = () => {
    setDisplayedChars(fullText.length);
    setIsEntryComplete(true);
  };

  const handleNext = () => {
    if (currentEntryIndex < DIARY_ENTRIES.length - 1) {
      setCurrentEntryIndex((prev) => prev + 1);
    } else {
      onComplete();
    }
  };

  // Build displayed text with keyword styling
  const renderText = () => {
    const result: JSX.Element[] = [];
    let charCount = 0;

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const segmentLength = segment.text.length;
      const segmentEnd = charCount + segmentLength;

      if (charCount >= displayedChars) {
        break;
      }

      const displayedInSegment = Math.min(displayedChars - charCount, segmentLength);
      const displayedText = segment.text.slice(0, displayedInSegment);

      if (segment.type) {
        result.push(
          <span key={i} className={cn('transition-all duration-300', getKeywordClasses(segment.type))}>
            {displayedText}
          </span>
        );
      } else {
        result.push(<span key={i}>{displayedText}</span>);
      }

      charCount = segmentEnd;
    }

    return result;
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => !newOpen && onComplete()}>
      <DialogContent className="max-w-4xl bg-amber-50/95 backdrop-blur-xl border-4 border-amber-900/50 shadow-2xl">
        <div className="relative" onClick={handleSkip}>
          {/* Close button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onComplete();
            }}
            className="absolute top-2 right-2 z-10 p-2 rounded-full hover:bg-amber-900/10 transition-colors group"
            aria-label="关闭"
          >
            <X className="w-5 h-5 text-amber-700 group-hover:text-amber-900" />
          </button>

          {/* Diary header */}
          <div className="flex items-center justify-center gap-2 mb-4 pb-3 border-b-2 border-amber-800/30">
            <BookOpen className="w-6 h-6 text-amber-800" />
            <div className="text-center">
              <h3 className="text-xl font-bold text-amber-900 font-serif tracking-wide">
                迷路旅人的遗书
              </h3>
              <p className="text-[10px] text-amber-700 mt-0.5 font-cinzel tracking-widest opacity-60">
                THE LOST TRAVELER'S TESTAMENT
              </p>
            </div>
            <Skull className="w-6 h-6 text-red-800/70" />
          </div>

          {/* Date stamp */}
          <div className="text-center mb-4">
            <div className="inline-block px-3 py-1.5 bg-amber-900/10 border border-amber-800/30 rounded">
              <p className="text-sm font-semibold text-amber-900 font-serif tracking-wide">
                {currentEntry.date}
              </p>
            </div>
          </div>

          {/* Diary text - paper texture background */}
          <div className="relative min-h-[280px] flex items-start justify-center px-6 py-4 bg-amber-50/50 border-l-4 border-amber-800/20">
            {/* Paper lines effect */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
              {Array.from({ length: 15 }).map((_, i) => (
                <div
                  key={i}
                  className="h-px bg-amber-800/20 mb-6"
                  style={{ marginTop: i === 0 ? '0' : '24px' }}
                />
              ))}
            </div>

            <div className="relative text-amber-950 text-sm leading-relaxed whitespace-pre-wrap font-serif tracking-wide text-left w-full">
              {renderText()}
              {!isEntryComplete && (
                <span className="inline-block w-0.5 h-4 bg-amber-900 ml-1 animate-pulse" />
              )}
            </div>
          </div>

          {/* Blood stain effect on last entry */}
          {currentEntryIndex === DIARY_ENTRIES.length - 1 && isEntryComplete && (
            <div className="absolute top-4 right-4 w-16 h-16 bg-red-900/20 rounded-full blur-xl animate-pulse" />
          )}

          {/* Controls */}
          <div className="mt-5 flex flex-col items-center gap-3">
            {!isEntryComplete ? (
              <Button
                onClick={handleSkip}
                size="lg"
                variant="outline"
                className="border-2 border-amber-700 text-amber-900 hover:bg-amber-100 font-serif"
              >
                立即显示全部
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                size="lg"
                className="bg-gradient-to-r from-amber-800 to-amber-900 hover:from-amber-700 hover:to-amber-800 text-amber-50 font-cinzel tracking-wider border-2 border-amber-700 shadow-lg animate-fade-in"
              >
                {currentEntryIndex < DIARY_ENTRIES.length - 1 ? (
                  <>
                    <BookOpen className="w-5 h-5 mr-2" />
                    继续阅读
                  </>
                ) : (
                  <>
                    <Skull className="w-5 h-5 mr-2" />
                    合上遗书
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Entry indicator */}
          <div className="mt-4 flex justify-center gap-1.5">
            {DIARY_ENTRIES.map((_, index) => (
              <div
                key={index}
                className={cn(
                  'w-1.5 h-1.5 rounded-full transition-all duration-300',
                  index === currentEntryIndex
                    ? 'bg-amber-800 w-6'
                    : index < currentEntryIndex
                    ? 'bg-amber-600'
                    : 'bg-amber-300'
                )}
              />
            ))}
          </div>
        </div>

        {/* Paper texture overlay */}
        <div className="absolute inset-0 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuOSIgbnVtT2N0YXZlcz0iNCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNub2lzZSkiIG9wYWNpdHk9IjAuMDUiLz48L3N2Zz4=')] rounded-lg" />
      </DialogContent>
    </Dialog>
  );
}
