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
import { STORY_INTRO_PAGES } from '@/lib/story-text';

interface StoryIntroProps {
  open: boolean;
  onComplete: () => void;
}

const DIARY_ENTRIES = STORY_INTRO_PAGES;

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
    redacted: 'bg-black text-transparent select-none px-1 rounded-[1px] shadow-[0_0_0_1px_rgba(180,147,90,0.15)]',

    // Places
    white: 'text-cyan-300 font-bold drop-shadow-[0_0_8px_rgba(165,243,252,0.8)]',
    lodge: 'text-amber-200 font-semibold tracking-wider',
    place: 'text-amber-200 font-semibold',

    // Evil/Danger
    evil: 'text-red-500 font-bold drop-shadow-[0_0_10px_rgba(239,68,68,1)]',
    hunger: 'text-red-500 font-bold drop-shadow-[0_0_10px_rgba(239,68,68,1)]',
    marked: 'text-red-500 font-bold underline decoration-wavy',
    mark: 'text-red-400 font-bold drop-shadow-[0_0_10px_rgba(248,113,113,1)]',
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
    terror: 'text-slate-300 font-bold',
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
    chaos: 'text-red-400 font-bold italic',
    collapse: 'text-red-500 font-bold',
    guess: 'text-slate-400 italic',
    vocal: 'text-slate-400 italic underline',
    target: 'text-red-500 font-bold underline',
    die: 'text-red-600 font-bold',

    // Cold/Ice
    cold: 'text-cyan-300 font-semibold drop-shadow-[0_0_6px_rgba(165,243,252,0.6)]',
    ice: 'text-cyan-400 font-bold drop-shadow-[0_0_8px_rgba(165,243,252,0.8)]',
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

    // Curse
    curse: 'text-amber-500 font-semibold drop-shadow-[0_0_8px_rgba(245,158,11,0.7)]',

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
    pain: 'text-red-500 font-bold',
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
      <DialogContent className="max-w-3xl p-0">
        <div
          className="relative overflow-hidden px-10 pb-6 pt-8"
          style={{ background: 'radial-gradient(ellipse at 50% 30%, #2a1f14 0%, #17110b 70%, #0d0906 100%)' }}
          onClick={handleSkip}
        >
          <div className="grain absolute inset-0" />
          <div className="burn-edge absolute inset-0 opacity-70" />

          <header className="relative mb-5 text-center">
            <div className="font-latin text-xs italic tracking-[0.4em] text-brass/60">Testamentum Viatoris</div>
            <h3 className="mt-1 flex items-center justify-center gap-3 font-serif text-xl font-semibold tracking-[0.4em] text-parchment">
              <BookOpen className="h-4 w-4 text-brass/70" />
              迷路旅人的遗书
              <Skull className="h-4 w-4 text-seal-light/70" />
            </h3>
            <div className="rule-brass mx-auto mt-3 w-56" />
            <p className="mt-3 font-serif text-sm tracking-[0.3em] text-brass-light">{currentEntry.date}</p>
          </header>

          <div className="relative h-[46vh] min-h-[280px] overflow-y-auto border-l border-brass/20 pl-6 pr-2">
            <div className="whitespace-pre-wrap text-left font-serif text-[15px] leading-[2] tracking-wide text-parchment/90">
              {renderText()}
              {!isEntryComplete && <span className="ml-1 inline-block h-4 w-[2px] translate-y-0.5 animate-pulse bg-brass-light" />}
            </div>
          </div>

          {currentEntryIndex === DIARY_ENTRIES.length - 1 && isEntryComplete && (
            <div className="pointer-events-none absolute right-10 top-10 h-24 w-24 rounded-full bg-seal/30 blur-2xl" />
          )}

          <footer className="relative mt-6 flex items-center justify-between">
            <div className="flex gap-1.5">
              {DIARY_ENTRIES.map((_, index) => (
                <span
                  key={index}
                  className={cn(
                    'h-1.5 rotate-45 transition-all duration-300',
                    index === currentEntryIndex ? 'w-1.5 bg-brass-light' : index < currentEntryIndex ? 'w-1.5 bg-brass/60' : 'w-1.5 bg-brass/20',
                  )}
                />
              ))}
            </div>
            {!isEntryComplete ? (
              <Button
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSkip();
                }}
              >
                立即显示全部
              </Button>
            ) : (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="animate-in fade-in"
              >
                {currentEntryIndex < DIARY_ENTRIES.length - 1 ? (
                  <>
                    <BookOpen className="mr-2 h-4 w-4" />
                    继续阅读
                  </>
                ) : (
                  <>
                    <Skull className="mr-2 h-4 w-4" />
                    合上遗书
                  </>
                )}
              </Button>
            )}
          </footer>
        </div>
      </DialogContent>
    </Dialog>
  );
}
