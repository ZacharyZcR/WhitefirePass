/**
 * Story introduction component with diary/journal format
 * Displays the story of the "16th person" through diary entries
 */

'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Skull } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface StoryIntroProps {
  open: boolean;
  onComplete: () => void;
}

/**
 * Diary entries - A lost traveler's testament from the previous ritual
 * Format: {keyword:type}text{/keyword}
 */
const DIARY_ENTRIES = [
  {
    date: '10月27日',
    text: `我迷路了。

手机没有信号，GPS也失灵。暴风雪来得太突然，我只能沿着{place:white}白烬山口{/place}的山路向下走。

天快黑了。气温骤降。我知道如果找不到避难所，今晚我会{fear:freeze}冻死在山里{/freeze}。

就在我快要{fear:despair}绝望{/despair}的时候，我看到了{cold:fire}白光{/fire}。

一座{place:lodge}山庄{/place}，孤零零地立在山坳里。透过窗户，我能看到里面有光，有{cold:white}白色的火焰{/white}在燃烧。

我敲门。门开了。

一个面容憔悴的男人站在门口，身后还有十几个人，他们都{fear:stare}看着我{/stare}，眼神...很奇怪。

"快进来，"男人说，"外面太危险了。"

他的声音在{fear:tremble}颤抖{/tremble}。`,
  },
  {
    date: '10月28日',
    text: `这座山庄里有{warning:fifteen}十五个人{/fifteen}。

他们说自己是一周前被{curse:storm}暴风雪{/curse}困在这里的旅行团。向导早就跑了，只剩下他们。

但我总觉得不对劲。

他们看我的眼神太{fear:strange}诡异{/strange}了。有些人看我时眼里闪烁着{evil:hunger}某种饥渴{/hunger}，有些人则满是{fear:fear}恐惧{/fear}，还有人一直在{fear:avoid}躲避我的视线{/avoid}。

大厅里的{cold:fire}白色火焰{/fire}从来不灭。我试着靠近，想要取暖，却发现{cold:cold}它散发的不是热量，而是寒意{/cold}。

墙上挂着一幅{warning:painting}古老的画{/painting}。画面破损严重，但我能辨认出：十五个人围成一圈，中间是{sacrifice:blood}一滩血迹{/blood}。

我问那是什么画。

"不知道，"有人回答，"这房子本来就有的。"

但他在{evil:lie}说谎{/lie}。我看得出来。`,
  },
  {
    date: '10月29日',
    text: `今天我试图离开。

门打不开了。窗户也是。就像被{warning:seal}某种力量封印{/seal}了一样。

我开始{fear:panic}恐慌{/panic}，质问他们发生了什么。

"山灵的契约，"一个女人终于说话了，声音{fear:hollow}空洞得可怕{/hollow}。

"{contract:pact}十五个人，困于此地。必须献祭过半，方能离开。{/pact}"

我以为她疯了。但其他人的表情告诉我，她说的是{evil:truth}真话{/truth}。

"我们已经{fear:trapped}困在这里十二天了{/trapped}，"另一个男人说，"我们以为...以为再也出不去了。"

"直到你来。"

我突然明白了那些眼神的含义。

{evil:hunger}饥饿{/hunger}——因为我是他们的{sacrifice:hope}希望{/hope}。

{fear:terror}恐惧{/terror}——因为他们知道接下来会发生什么。

{contract:contract}我的到来，重启了这场仪式。{/contract}`,
  },
  {
    date: '10月30日',
    text: `昨晚我听到了{fear:whisper}低语{/whisper}。

不是从任何人口中传来的，而是从{cold:fire}白色火焰{/fire}里。

"{contract:contract}第十六人...平衡已成...献祭之夜...即将开始...{/contract}"

我试图和他们谈判，求他们放我走。但没有用。

"我们也不想这样，"有个女孩哭着说，"但{warning:warning}契约一旦启动，就无法停止{/warning}。"

她告诉我规则：

每天晚上，{evil:marked}被山灵标记的人{/marked}会{evil:hunt}集体投票杀死一个人{/hunt}。

每天白天，所有人会{lamb:vote}投票献祭一个人{/vote}。

{contract:rule}当献祭的人数超过半数，幸存者可以离开。{/rule}

"你是第十六个人，"她说，"{sacrifice:first}按照惯例，第一个被献祭的...总是打破平衡的那个人。{/first}"

我问她什么是"惯例"。她没有回答。

但我在她眼中看到了{fear:guilt}愧疚{/guilt}。

她经历过这个。她知道{evil:truth}这一切都会重复{/truth}。`,
  },
  {
    date: '10月31日 凌晨',
    text: `今晚就是{sacrifice:night}献祭之夜{/night}。

他们在{fear:prepare}准备{/prepare}了。我能感觉到。

有三个人眼睛里闪烁着{evil:mark}异样的光{/mark}——那是{evil:marked}被烙印者{/marked}。他们会在夜里{evil:kill}杀死一个人{/kill}。

而白天，剩下的人会{lamb:vote}投票决定由谁去死{/vote}。

我想我会是第一个。

{warning:warning}不，我一定是第一个。{/warning}

因为我是{sacrifice:balance}打破平衡的第十六人{/balance}。因为{contract:contract}契约需要一个开端{/contract}。因为{evil:truth}这就是规则{/truth}。

我在墙上看到了{warning:mark}划痕{/mark}——之前的受害者留下的。

一道道。一层层。

{fear:many}不知道有多少人，死在了这里。{/many}

这不是第一次仪式。

{evil:cycle}这是一个永无止境的循环。{/cycle}`,
  },
  {
    date: '10月31日 黄昏',
    text: `{warning:warning}如果有人读到这封遗书...{/warning}

{fear:run}逃。立刻逃。{/run}

远离{place:white}白烬山口{/place}。远离那座{place:lodge}山庄{/lodge}。

如果你已经进去了，如果{curse:storm}暴风雪封锁了门{/storm}，如果你听到了{fear:whisper}白色火焰的低语{/whisper}...

那么{fear:sorry}对不起，已经太迟了{/sorry}。

但你还有机会{lamb:survive}活下来{/survive}。

{lamb:observe}仔细观察他们的行为。{/observe}被{evil:marked}烙印的人{/marked}会在夜晚暴露真面目。他们会{evil:lie}说谎，会伪装，会互相配合{/lie}。

{lamb:trust}寻找可以信任的人。{/trust}有些角色会在夜里得到信息。{lamb:seer}聆心者能看穿污秽{/seer}，{lamb:coroner}食灰者能验明死者{/coroner}，{lamb:twin}共誓者彼此相知{/twin}。

但{warning:warning}不要轻易相信任何人。{/warning}

{evil:lie}谎言是这场游戏的核心。{/lie}

我听到{fear:footsteps}脚步声{/footsteps}了。

他们来了。

{sacrifice:blood}白色火焰在等待血祭。{/blood}

{warning:warning}对不起，我尽力了。{/warning}

——{dead:last}一个迷路旅人的最后遗言{/last}

{contract:contract}仪式永不停息。{/contract}

{evil:cycle}下一个第十六人，正在路上。{/cycle}`,
  },
];

/**
 * Parse story text and identify keywords
 */
function parseStoryText(text: string) {
  const segments: Array<{ text: string; type?: string }> = [];
  let currentIndex = 0;
  const regex = /\{(\w+):(\w+)\}(.*?)\{\/\1\}/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > currentIndex) {
      segments.push({ text: text.slice(currentIndex, match.index) });
    }
    // Add the keyword with its type
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
    kill: 'text-red-700 font-bold',
    lie: 'text-red-400 font-semibold italic',
    truth: 'text-red-500 font-bold drop-shadow-[0_0_12px_rgba(239,68,68,1)]',
    cycle: 'text-red-400 font-bold italic drop-shadow-[0_0_8px_rgba(248,113,113,0.8)]',

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

    // Curse/Storm
    curse: 'text-amber-500 font-semibold drop-shadow-[0_0_8px_rgba(245,158,11,0.7)]',
    storm: 'text-slate-400 font-semibold drop-shadow-[0_0_6px_rgba(148,163,184,0.6)]',

    // Good/Observation/Survival
    lamb: 'text-blue-400 font-semibold drop-shadow-[0_0_6px_rgba(96,165,250,0.6)]',
    observe: 'text-blue-400 font-semibold underline decoration-dotted',
    vote: 'text-blue-300 font-semibold',
    survive: 'text-blue-400 font-bold underline',
    trust: 'text-blue-400 font-semibold italic',
    seer: 'text-purple-400 font-semibold',
    coroner: 'text-cyan-500 font-semibold',
    twin: 'text-teal-400 font-semibold',

    // Cult/Mystery
    cult: 'text-purple-400 font-semibold italic',
    hunter: 'text-slate-400 font-semibold',

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

  // Typewriter effect with slower speed
  useEffect(() => {
    if (!open) return;

    // Allow skipping after 3 seconds
    const skipTimer = setTimeout(() => setCanSkip(true), 3000);

    if (displayedChars < fullText.length) {
      // Slower speed: spaces fast, punctuation pause, normal chars moderate
      const currentChar = fullText[displayedChars];
      const delay = currentChar === ' ' ? 30 :
                    currentChar === '\n' ? 400 :
                    currentChar.match(/[,。，、！!？?：:]/) ? 500 :
                    currentChar.match(/["'「」『』【】]/) ? 200 :
                    80;

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
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-4xl bg-amber-50/95 backdrop-blur-xl border-4 border-amber-900/50 shadow-2xl"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="relative" onClick={handleSkip}>
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
