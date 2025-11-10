/**
 * Story introduction component with typewriter effect
 */

'use client';

import { useState, useEffect } from 'react';
import { Mountain, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface StoryIntroProps {
  onComplete: () => void;
}

/**
 * Story text with special keyword markers
 * Format: {keyword:type}text{/keyword}
 */
const STORY_TEXT = `
夜幕降临，{place:white}白烬山口{/place}的风雪愈发猛烈。

15名旅人被困于这座荒凉的{place:lodge}寂静山庄{/place}，四周是无尽的雪原与冰封的山峦。

传说中，这里曾是{spirit:mountain}山灵{/spirit}栖息之地。数百年前，贪婪的猎人闯入禁地，屠戮山中生灵，{spirit:mountain}山灵{/spirit}因此暴怒...

如今，每当暴风雪封锁山口，{evil:marked}烙印者{/evil}便会在人群中觉醒——他们被{spirit:mountain}山灵{/spirit}选中，背负着{curse:curse}收割生命{/curse}的诅咒。

唯有献祭足够的{sacrifice:blood}羔羊之血{/sacrifice}，或是找出所有的{evil:marked}烙印者{/evil}，{contract:contract}契约{/contract}方能解除。

在这漫长的{dark:night}黑夜{/dark}中，没人知道谁能活到{dawn:dawn}黎明{/dawn}...

{warning:warning}白烬山口的审判，即将开始。{/warning}
`;

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
 * Get CSS classes for keyword types
 */
function getKeywordClasses(type: string): string {
  const classes: Record<string, string> = {
    white: 'text-cyan-300 font-bold animate-pulse drop-shadow-[0_0_8px_rgba(165,243,252,0.8)]',
    lodge: 'text-slate-300 font-semibold tracking-wider',
    mountain: 'text-blue-400 font-bold animate-pulse drop-shadow-[0_0_12px_rgba(96,165,250,0.9)]',
    evil: 'text-red-500 font-bold drop-shadow-[0_0_10px_rgba(239,68,68,1)] animate-pulse',
    marked: 'text-red-500 font-bold drop-shadow-[0_0_10px_rgba(239,68,68,1)]',
    curse: 'text-amber-500 font-semibold drop-shadow-[0_0_8px_rgba(245,158,11,0.7)]',
    sacrifice: 'text-red-600 font-bold drop-shadow-[0_0_8px_rgba(220,38,38,0.9)]',
    blood: 'text-red-600 font-bold',
    contract: 'text-amber-400 font-bold tracking-wide drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]',
    dark: 'text-slate-400 font-semibold',
    night: 'text-slate-400 font-semibold',
    dawn: 'text-amber-300 font-semibold drop-shadow-[0_0_6px_rgba(252,211,77,0.6)]',
    warning: 'text-red-400 font-bold text-lg drop-shadow-[0_0_12px_rgba(248,113,113,0.9)] animate-pulse',
  };
  return classes[type] || '';
}

export function StoryIntro({ onComplete }: StoryIntroProps) {
  const [displayedChars, setDisplayedChars] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [canSkip, setCanSkip] = useState(false);

  const segments = parseStoryText(STORY_TEXT.trim());
  const fullText = segments.map((s) => s.text).join('');

  // Typewriter effect
  useEffect(() => {
    // Allow skipping after 2 seconds
    const skipTimer = setTimeout(() => setCanSkip(true), 2000);

    if (displayedChars < fullText.length) {
      // Vary speed: faster for spaces and punctuation
      const currentChar = fullText[displayedChars];
      const delay = currentChar === ' ' ? 20 : currentChar.match(/[,。，、！!？?]/) ? 200 : 50;

      const timer = setTimeout(() => {
        setDisplayedChars((prev) => prev + 1);
      }, delay);

      return () => {
        clearTimeout(timer);
        clearTimeout(skipTimer);
      };
    } else {
      setIsComplete(true);
      return () => clearTimeout(skipTimer);
    }
  }, [displayedChars, fullText]);

  const handleSkip = () => {
    if (canSkip) {
      setDisplayedChars(fullText.length);
      setIsComplete(true);
    }
  };

  const handleContinue = () => {
    onComplete();
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black"
      onClick={handleSkip}
    >
      {/* Snow effect */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/50 via-transparent to-slate-950/50" />
      </div>

      {/* Content */}
      <div className="relative max-w-4xl mx-auto px-8">
        {/* Mountain icon */}
        <div className="flex justify-center mb-12 animate-fade-in">
          <Mountain className="w-20 h-20 text-cyan-300 drop-shadow-[0_0_20px_rgba(165,243,252,0.8)] animate-pulse" />
        </div>

        {/* Story text */}
        <div className="relative">
          <div className="text-slate-200 text-xl leading-relaxed whitespace-pre-wrap font-serif tracking-wide text-center">
            {renderText()}
            {!isComplete && (
              <span className="inline-block w-0.5 h-6 bg-slate-400 ml-1 animate-pulse" />
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="mt-12 flex flex-col items-center gap-4">
          {!isComplete && canSkip && (
            <button
              onClick={handleSkip}
              className="text-sm text-slate-400 hover:text-slate-300 transition-colors"
            >
              点击任意处跳过...
            </button>
          )}

          {!isComplete && !canSkip && (
            <div className="flex items-center gap-2 text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">故事正在展开...</span>
            </div>
          )}

          {isComplete && (
            <Button
              onClick={handleContinue}
              size="lg"
              className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-cinzel tracking-wider shadow-glow-amber animate-fade-in"
            >
              进入山庄
              <Mountain className="w-5 h-5 ml-2" />
            </Button>
          )}
        </div>
      </div>

      {/* Vignette effect */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-radial from-transparent via-transparent to-black opacity-60" />
    </div>
  );
}
