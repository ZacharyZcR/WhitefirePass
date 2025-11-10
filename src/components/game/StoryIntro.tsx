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
 */
const DIARY_ENTRIES = [
  {
    date: '10月24日',
    text: `我们一行{warning:fifteen}十五人{/warning}，是从城里来{place:white}白烬山口{/place}登山的旅行团。

导游说这条路线很经典，秋天的景色最美。大家都很兴奋。

天气预报说有{curse:storm}暴风雪{/curse}，但导游说问题不大。我们准备充分，有足够的补给。

下午四点，我们抵达半山腰的{place:lodge}避难山庄{/place}。这是一座很古老的木屋，据说以前是{cult:hunter}猎人的驻地{/cult}。

导游说我们会在这里过夜，明天继续上山。

现在是晚上八点。风雪突然{warning:warning}大得可怕{/warning}。

导游的脸色{fear:strange}很难看{/fear}。他一直在看手机，但{warning:signal}已经没有信号了{/warning}。`,
  },
  {
    date: '10月25日',
    text: `暴风雪还没停。

更糟的是，{warning:door}门打不开了{/warning}。

我们所有人都试过。窗户也是。就像有{warning:seal}什么东西把我们封在里面{/warning}。

导游说这很不正常。他说自己来过这里{warning:times}很多次{/warning}，从来没遇到过这种情况。

大厅里有个{cold:fire}壁炉{/cold}，火焰是{cold:white}白色的{/cold}。我问导游这是什么，他说不知道，{warning:strange}这火昨晚就在这里燃烧{/warning}，也不知道是谁点的。

{cold:cold}火焰散发的是寒意，不是温暖{/cold}。

墙上有一幅画。十五个人围成一圈，中间是{sacrifice:blood}一滩血{/sacrifice}。画很旧，很模糊，但让人{fear:fear}不安{/fear}。

晚上，我听到{fear:whisper}低语{/fear}。

不是风声，也不是人声。

是从{cold:fire}白色的火焰{/cold}里传来的。`,
  },
  {
    date: '10月26日',
    text: `今天早上，{warning:change}有些人变了{/warning}。

我说不清是哪里不对，但我能{fear:feel}感觉到{/fear}。

他们的眼神，说话的方式，看彼此的表情...都{fear:strange}不太一样了{/fear}。

导游把大家召集起来。他的声音在{fear:tremble}颤抖{/fear}。

"昨晚，"他说，"昨晚我听到了声音。"

"{contract:contract}山灵的契约。{/contract}"

他说这座山庄是{warning:cursed}被诅咒的{/warning}。据说很久以前，这里的{cult:hunter}猎人违背了山灵的禁忌{/cult}，屠杀了山中的生灵。

{warning:punishment}山灵降下了惩罚。{/warning}

任何{warning:fifteen}十五人一同进入这座山庄{/warning}的群体，都会触发{contract:contract}契约{/contract}。

{contract:pact}必须献祭过半数，幸存者才能离开。{/contract}

{evil:marked}其中三人会被山灵标记{/evil}，成为{evil:hunter}收割者{/evil}。

{lamb:innocent}剩下的人是羔羊{/lamb}，必须找出收割者，否则会被一个个{evil:kill}杀死{/evil}。

我以为他疯了。

但{cold:fire}白色的火焰{/cold}还在燃烧。

{warning:door}门还是打不开{/warning}。

而且...{fear:eyes}有些人的眼神确实变了{/fear}。`,
  },
  {
    date: '10月27日',
    text: `{warning:warning}仪式开始了。{/warning}

昨晚有人死了。

是团里的{sacrifice:first}一个年轻人{/sacrifice}。我们早上发现他的时候，他躺在走廊里，{dead:dead}已经没有呼吸{/dead}。

身上{sacrifice:wound}没有伤口{/sacrifice}，但表情{fear:terror}极度恐惧{/fear}。

就像被{cold:freeze}冻死的{/cold}。

{evil:marked}被标记的三个人{/evil}在夜里做了这件事。

但我们不知道是谁。

白天，我们要{lamb:vote}投票决定献祭谁{/lamb}。

这是{contract:rule}契约的规则{/contract}：白天投票，晚上猎杀。直到一方全灭，或者{sacrifice:half}献祭过半{/sacrifice}。

团里有些人有{lamb:special}特殊能力{/lamb}。{lamb:seer}聆心者说他昨晚看到了某人是"污秽"{/lamb}。{lamb:twin}两个共誓者认出了彼此{/lamb}。

但{evil:lie}谁说的是真话？谁又在说谎？{/evil}

{fear:chaos}所有人都在互相指责，互相怀疑{/fear}。

最后，投票的结果是{sacrifice:vote}一个一直沉默的女孩{/sacrifice}。

{warning:warning}而那个女孩，是我的朋友。{/warning}

{fear:guilt}我也投了她。{/fear}

因为{fear:survive}我想活下来{/fear}。`,
  },
  {
    date: '10月28日',
    text: `又过了一天。

又死了两个人。昨晚死了一个，今天白天被献祭了一个。

{sacrifice:count}我们还剩十一个人{/sacrifice}。

{fear:collapse}团队已经崩溃了{/fear}。没有人相信任何人。{lamb:seer}声称能看穿真相的人{/lamb}可能在{evil:lie}说谎{/evil}。{lamb:twin}说自己是共誓者的人{/lamb}可能在{evil:fake}伪装{/evil}。

{evil:marked}被烙印的三个人{/evil}隐藏得很好。他们{evil:blend}混在人群中{/evil}，{evil:lie}说谎、引导、制造混乱{/evil}。

而我们这些{lamb:innocent}羔羊{/lamb}，只能{fear:guess}靠猜测和恐惧{/fear}来做出判断。

{warning:warning}我怀疑我会是下一个。{/warning}

因为我{fear:vocal}一直在质疑，在提出不同意见{/fear}。

{evil:marked}收割者不会放过这样的人{/evil}。

{fear:target}我成了他们的目标。{/fear}

今晚，如果{lamb:guard}设闩者{/lamb}不保护我...

我可能{dead:die}活不过明天{/dead}。`,
  },
  {
    date: '10月29日 清晨',
    text: `{warning:warning}如果有人读到这封遗书...{/warning}

{fear:die}我今晚会死{/fear}。

我能感觉到。{evil:marked}他们的眼神已经锁定了我{/evil}。

白天的投票也会{sacrifice:vote}指向我{/sacrifice}。因为{evil:frame}他们成功地把我塑造成了威胁{/evil}。

{fear:sorry}对不起，我想把真相记录下来{/fear}。

{warning:warning}这座{place:lodge}山庄{/place}不是避难所，是{sacrifice:altar}祭坛{/sacrifice}。{/warning}

{contract:contract}山灵的契约是真实的。{/contract}{warning:fifteen}每当有十五人进入这里{/warning}，{evil:curse}诅咒就会启动{/evil}。

{lamb:survive}如果你想活下来：{/lamb}

{lamb:observe}仔细观察每个人的行为{/lamb}。{evil:marked}被烙印的人{/evil}会在{evil:lie}言语上露出破绽{/evil}，会{evil:coordinate}相互配合{/evil}，会{evil:deflect}转移怀疑{/evil}。

{lamb:trust}寻找可以信任的角色{/lamb}。{lamb:seer}聆心者能验人{/lamb}，{lamb:coroner}食灰者能验尸{/lamb}，{lamb:twin}共誓者互相知晓{/lamb}，{lamb:guard}设闩者能保护{/lamb}。

但{warning:warning}永远不要完全相信任何人{/warning}。{evil:lie}这场游戏的核心就是谎言和伪装{/evil}。

我听到{fear:footsteps}脚步声{/fear}了。

{cold:fire}白色的火焰在等待。{/cold}

{warning:warning}对不起。{/warning}

——{dead:last}一个即将被献祭的羔羊的最后遗言{/dead}

{contract:contract}仪式会继续。{/contract}

{evil:cycle}直到这座山庄被彻底摧毁。{/evil}`,
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
    // Places
    white: 'text-cyan-300 font-bold animate-pulse drop-shadow-[0_0_8px_rgba(165,243,252,0.8)]',
    lodge: 'text-amber-200 font-semibold tracking-wider',
    place: 'text-amber-200 font-semibold',

    // Evil/Danger
    evil: 'text-red-500 font-bold drop-shadow-[0_0_10px_rgba(239,68,68,1)]',
    hunger: 'text-red-500 font-bold animate-pulse drop-shadow-[0_0_10px_rgba(239,68,68,1)]',
    marked: 'text-red-500 font-bold underline decoration-wavy',
    mark: 'text-red-400 font-bold animate-pulse drop-shadow-[0_0_10px_rgba(248,113,113,1)]',
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
  const [canSkip, setCanSkip] = useState(false);

  const currentEntry = DIARY_ENTRIES[currentEntryIndex];
  const segments = parseStoryText(currentEntry.text.trim());
  const fullText = segments.map((s) => s.text).join('');

  // Reset when dialog opens or entry changes
  useEffect(() => {
    if (open) {
      setDisplayedChars(0);
      setIsEntryComplete(false);
      setCanSkip(false);
    }
  }, [open, currentEntryIndex]);

  // Typewriter effect with faster speed
  useEffect(() => {
    if (!open) return;

    // Allow skipping after 1.5 seconds
    const skipTimer = setTimeout(() => setCanSkip(true), 1500);

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

      return () => {
        clearTimeout(timer);
        clearTimeout(skipTimer);
      };
    } else {
      setIsEntryComplete(true);
      return () => clearTimeout(skipTimer);
    }
  }, [displayedChars, fullText, open]);

  const handleSkip = () => {
    if (canSkip) {
      setDisplayedChars(fullText.length);
      setIsEntryComplete(true);
    }
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
          <div className="flex items-center justify-center gap-3 mb-6 pb-4 border-b-2 border-amber-800/30">
            <BookOpen className="w-8 h-8 text-amber-800" />
            <div className="text-center">
              <h3 className="text-2xl font-bold text-amber-900 font-serif tracking-wide">
                迷路旅人的遗书
              </h3>
              <p className="text-xs text-amber-700 mt-1 font-cinzel tracking-widest opacity-60">
                THE LOST TRAVELER'S TESTAMENT
              </p>
            </div>
            <Skull className="w-8 h-8 text-red-800/70" />
          </div>

          {/* Date stamp */}
          <div className="text-center mb-6">
            <div className="inline-block px-4 py-2 bg-amber-900/10 border border-amber-800/30 rounded">
              <p className="text-sm font-semibold text-amber-900 font-serif tracking-wide">
                {currentEntry.date}
              </p>
            </div>
          </div>

          {/* Diary text - paper texture background */}
          <div className="relative min-h-[320px] flex items-start justify-center px-8 py-6 bg-amber-50/50 border-l-4 border-amber-800/20">
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

            <div className="relative text-amber-950 text-base leading-loose whitespace-pre-wrap font-serif tracking-wide text-left w-full">
              {renderText()}
              {!isEntryComplete && (
                <span className="inline-block w-0.5 h-5 bg-amber-900 ml-1 animate-pulse" />
              )}
            </div>
          </div>

          {/* Blood stain effect on last entry */}
          {currentEntryIndex === DIARY_ENTRIES.length - 1 && isEntryComplete && (
            <div className="absolute top-4 right-4 w-20 h-20 bg-red-900/20 rounded-full blur-xl animate-pulse" />
          )}

          {/* Controls */}
          <div className="mt-8 flex flex-col items-center gap-4">
            {!isEntryComplete && canSkip && (
              <button
                onClick={handleSkip}
                className="text-sm text-amber-700 hover:text-amber-900 transition-colors font-serif"
              >
                点击任意处跳过当前页...
              </button>
            )}

            {isEntryComplete && (
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
          <div className="mt-6 flex justify-center gap-2">
            {DIARY_ENTRIES.map((_, index) => (
              <div
                key={index}
                className={cn(
                  'w-2 h-2 rounded-full transition-all duration-300',
                  index === currentEntryIndex
                    ? 'bg-amber-800 w-8'
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
