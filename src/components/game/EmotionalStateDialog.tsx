/**
 * Emotional State Change Dialog
 * Shows when a character's emotional state changes due to another character's death
 */

'use client';

import { useEffect, useState } from 'react';
import type { EmotionalStateChange } from '@/types/game';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Heart, Flame, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getStateChangeDescription } from '@/lib/emotional-prompts';
import { getRelationshipLabel } from '@/lib/relationships';
import { Portrait } from './Portrait';

interface EmotionalStateDialogProps {
  stateChanges: EmotionalStateChange[];
  onComplete: () => void;
}

// eslint-disable-next-line complexity
export function EmotionalStateDialog({ stateChanges, onComplete }: EmotionalStateDialogProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(stateChanges.length > 0);

  // Update when stateChanges prop changes
  useEffect(() => {
    if (stateChanges.length > 0) {
      setCurrentIndex(0);
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [stateChanges]);

  if (stateChanges.length === 0) return null;

  const currentChange = stateChanges[currentIndex];
  if (!currentChange) return null;

  const relationshipLabel = getRelationshipLabel(currentChange.relationshipType);
  const { title, description } = getStateChangeDescription(
    currentChange.character,
    currentChange.triggerCharacter,
    currentChange.newState,
    relationshipLabel,
  );

  const isVirtue = currentChange.newState === 'virtue';
  const isLast = currentIndex === stateChanges.length - 1;

  const handleNext = (): void => {
    if (isLast) {
      setIsOpen(false);
      onComplete();
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open && isLast) {
        onComplete();
      }
    }}>
      <DialogContent className={cn('max-w-2xl overflow-hidden', isVirtue ? 'border-pyre/50' : 'border-seal-light/60')}>
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className={cn('flex items-center gap-3 font-serif text-xl tracking-[0.4em]', isVirtue ? 'text-pyre' : 'text-seal-light')}>
            {isVirtue ? <Heart className="h-5 w-5" /> : <Flame className="h-5 w-5" />}
            心境异变
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2 font-serif tracking-wider">
            <Users className="h-4 w-4" />
            {currentChange.character} 的 {relationshipLabel} {currentChange.triggerCharacter} 已死亡
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-5 py-2">
          <div className="relative w-40 flex-shrink-0">
            <Portrait name={currentChange.character} className="aspect-[832/1216] w-full rounded-sm brass-frame" />
            <Portrait
              name={currentChange.triggerCharacter}
              dead
              zoom={1.8}
              className="absolute -bottom-3 -right-4 h-20 w-16 rounded-sm border border-brass/40"
            />
          </div>
          <div className="min-w-0 flex-1 space-y-3">
            <div className={cn('border-y py-2 text-center font-serif text-lg font-semibold tracking-[0.3em]', isVirtue ? 'border-pyre/30 text-pyre' : 'border-seal/50 text-seal-light')}>
              {title}
            </div>
            <p className="max-h-64 overflow-y-auto font-serif text-sm leading-loose text-parchment">{description}</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex gap-1.5">
            {stateChanges.length > 1 && stateChanges.map((_, idx) => (
              <span key={idx} className={cn('h-1.5 w-1.5 rotate-45 transition-all', idx === currentIndex ? 'bg-brass-light' : 'bg-brass/25')} />
            ))}
          </div>
          <Button onClick={handleNext}>
            {isLast ? '确认' : `下一个 (${currentIndex + 1}/${stateChanges.length})`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
