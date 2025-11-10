/**
 * Story introduction component with typewriter effect
 * Displays game intro story as a dialog after game starts
 */

'use client';

import { useState, useEffect } from 'react';
import { Mountain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface StoryIntroProps {
  open: boolean;
  onComplete: () => void;
}

/**
 * Story segments with special keyword markers
 * Format: {keyword:type}text{/keyword}
 */
const STORY_SEGMENTS = [
  {
    speaker: '山灵',
    speakerType: 'spirit',
    text: `{place:white}白烬山口{/place}，{place:lodge}寂静山庄{/place}。

一场{curse:storm}非自然的暴风雪{/curse}，将 15 名旅人驱赶至此。

大门{warning:close}轰然关闭{/warning}。篝火散发着{cold:fire}无温度的冰冷白光{/cold}。`,
  },
  {
    speaker: '山灵',
    speakerType: 'spirit',
    text: `"{contract:contract}契约已成。盛宴开始。{/contract}"

"在你们之中，我播撒了'{evil:hunger}饥饿{/evil}'。"

"现在，用你们的{fear:fear}猜疑和恐惧{/fear}，来取悦我。"`,
  },
  {
    speaker: '旁白',
    speakerType: 'narrator',
    text: `【{brand:mark}身份已被烙印{/brand}】

{evil:harvest}收割阵营{/evil}：3名烙印者
{lamb:lamb}羔羊阵营{/lamb}：1名聆心者、1名食灰者、2名共誓者、1名设闩者、6名无知者

{warning:warning}夜幕即将降临。第一个夜晚开始...{/warning}`,
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
 * Get CSS classes for keyword types
 */
function getKeywordClasses(type: string): string {
  const classes: Record<string, string> = {
    white: 'text-cyan-300 font-bold animate-pulse drop-shadow-[0_0_8px_rgba(165,243,252,0.8)]',
    lodge: 'text-slate-300 font-semibold tracking-wider',
    spirit: 'text-blue-400 font-bold animate-pulse drop-shadow-[0_0_12px_rgba(96,165,250,0.9)]',
    evil: 'text-red-500 font-bold drop-shadow-[0_0_10px_rgba(239,68,68,1)]',
    harvest: 'text-red-600 font-bold drop-shadow-[0_0_8px_rgba(220,38,38,0.9)]',
    hunger: 'text-red-500 font-bold animate-pulse drop-shadow-[0_0_10px_rgba(239,68,68,1)]',
    marked: 'text-red-500 font-bold drop-shadow-[0_0_10px_rgba(239,68,68,1)]',
    curse: 'text-amber-500 font-semibold drop-shadow-[0_0_8px_rgba(245,158,11,0.7)]',
    storm: 'text-slate-400 font-semibold drop-shadow-[0_0_6px_rgba(148,163,184,0.6)]',
    contract: 'text-amber-400 font-bold tracking-wide drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]',
    brand: 'text-amber-500 font-bold drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]',
    mark: 'text-amber-500 font-bold',
    lamb: 'text-blue-400 font-semibold drop-shadow-[0_0_6px_rgba(96,165,250,0.6)]',
    fear: 'text-slate-400 font-semibold italic',
    cold: 'text-cyan-300 font-semibold drop-shadow-[0_0_6px_rgba(165,243,252,0.6)]',
    fire: 'text-cyan-300 font-semibold',
    close: 'text-red-400 font-semibold',
    warning: 'text-red-400 font-bold drop-shadow-[0_0_10px_rgba(248,113,113,0.8)] animate-pulse',
  };
  return classes[type] || '';
}

/**
 * Get speaker name styling
 */
function getSpeakerClasses(type: string): string {
  const classes: Record<string, string> = {
    spirit: 'text-blue-400 drop-shadow-[0_0_12px_rgba(96,165,250,0.9)]',
    narrator: 'text-slate-400 drop-shadow-[0_0_6px_rgba(148,163,184,0.6)]',
  };
  return classes[type] || 'text-slate-400';
}

export function StoryIntro({ open, onComplete }: StoryIntroProps) {
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [displayedChars, setDisplayedChars] = useState(0);
  const [isSegmentComplete, setIsSegmentComplete] = useState(false);
  const [canSkip, setCanSkip] = useState(false);

  const currentSegment = STORY_SEGMENTS[currentSegmentIndex];
  const segments = parseStoryText(currentSegment.text.trim());
  const fullText = segments.map((s) => s.text).join('');

  // Reset when dialog opens or segment changes
  useEffect(() => {
    if (open) {
      setDisplayedChars(0);
      setIsSegmentComplete(false);
      setCanSkip(false);
    }
  }, [open, currentSegmentIndex]);

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
      setIsSegmentComplete(true);
      return () => clearTimeout(skipTimer);
    }
  }, [displayedChars, fullText, open]);

  const handleSkip = () => {
    if (canSkip) {
      setDisplayedChars(fullText.length);
      setIsSegmentComplete(true);
    }
  };

  const handleNext = () => {
    if (currentSegmentIndex < STORY_SEGMENTS.length - 1) {
      setCurrentSegmentIndex((prev) => prev + 1);
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
        className="max-w-3xl bg-slate-950/95 backdrop-blur-xl border-2 border-slate-700/50 shadow-2xl"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="relative" onClick={handleSkip}>
          {/* Mountain icon */}
          <div className="flex justify-center mb-8">
            <Mountain className="w-16 h-16 text-cyan-300 drop-shadow-[0_0_20px_rgba(165,243,252,0.8)] animate-pulse" />
          </div>

          {/* Speaker name */}
          <div className="text-center mb-6">
            <h3 className={cn(
              'text-2xl font-cinzel font-bold tracking-wider',
              getSpeakerClasses(currentSegment.speakerType)
            )}>
              {currentSegment.speaker}
            </h3>
          </div>

          {/* Story text */}
          <div className="relative min-h-[240px] flex items-center justify-center px-8">
            <div className="text-slate-200 text-lg leading-relaxed whitespace-pre-wrap font-serif tracking-wide text-center">
              {renderText()}
              {!isSegmentComplete && (
                <span className="inline-block w-0.5 h-6 bg-slate-400 ml-1 animate-pulse" />
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="mt-8 flex flex-col items-center gap-4">
            {!isSegmentComplete && canSkip && (
              <button
                onClick={handleSkip}
                className="text-sm text-slate-400 hover:text-slate-300 transition-colors"
              >
                点击任意处跳过当前段落...
              </button>
            )}

            {isSegmentComplete && (
              <Button
                onClick={handleNext}
                size="lg"
                className="bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-cinzel tracking-wider border-2 border-slate-600 shadow-glow-amber animate-fade-in"
              >
                {currentSegmentIndex < STORY_SEGMENTS.length - 1 ? '继续' : '开始游戏'}
                <Mountain className="w-5 h-5 ml-2" />
              </Button>
            )}
          </div>

          {/* Segment indicator */}
          <div className="mt-6 flex justify-center gap-2">
            {STORY_SEGMENTS.map((_, index) => (
              <div
                key={index}
                className={cn(
                  'w-2 h-2 rounded-full transition-all duration-300',
                  index === currentSegmentIndex
                    ? 'bg-cyan-400 w-8'
                    : index < currentSegmentIndex
                    ? 'bg-slate-600'
                    : 'bg-slate-800'
                )}
              />
            ))}
          </div>
        </div>

        {/* Vignette effect */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-radial from-transparent via-transparent to-slate-950/50 rounded-lg" />
      </DialogContent>
    </Dialog>
  );
}
