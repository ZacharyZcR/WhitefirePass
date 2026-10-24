/**
 * Clues - documents found in the lodge, shown as sealed papers.
 */

'use client';

import { useState } from 'react';
import { Archive, BookOpen, File, FileText, Scroll } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StoryIntro } from './StoryIntro';
import type { Clue, ClueCategory } from '@/types/game';

const CATEGORY: Record<ClueCategory, { name: string; icon: typeof BookOpen }> = {
  diary: { name: '日记', icon: BookOpen },
  letter: { name: '书信', icon: Scroll },
  note: { name: '笔记', icon: FileText },
  document: { name: '文档', icon: File },
  artifact: { name: '物品', icon: Archive },
};

interface CluesPanelProps {
  clues: Clue[];
  onClueRead?: (clueId: string) => void;
}

export function CluesPanel({ clues, onClueRead }: CluesPanelProps) {
  const [selected, setSelected] = useState<Clue | null>(null);

  const open = (clue: Clue) => {
    setSelected(clue);
    if (!clue.isRead) onClueRead?.(clue.id);
  };

  return (
    <>
      {selected?.category === 'diary' && <StoryIntro open onComplete={() => setSelected(null)} />}

      <div className="flex h-full flex-col">
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-6 py-4">
          {clues.length === 0 ? (
            <div className="py-16 text-center font-serif text-frost-dim">
              <Archive className="mx-auto mb-4 h-10 w-10 opacity-30" strokeWidth={1} />
              <p className="text-sm tracking-widest">暂无线索</p>
              <p className="mt-1 text-xs opacity-60">随着游戏进行，你将发现更多秘密</p>
            </div>
          ) : (
            clues.map((clue) => {
              const { name, icon: Icon } = CATEGORY[clue.category];
              return (
                <button
                  key={clue.id}
                  onClick={() => open(clue)}
                  className={cn(
                    'relative w-full rounded-sm px-4 py-3 text-left transition-all hover:-translate-y-0.5',
                    'bg-gradient-to-br from-[#e8dcc0] to-[#cbb98f] text-[#2a1f12] shadow-[0_6px_18px_rgba(0,0,0,0.5)]',
                    clue.isRead && 'opacity-80',
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Icon className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#6b5434]" strokeWidth={1.5} />
                    <div className="min-w-0 flex-1">
                      <div className="font-serif text-sm font-semibold tracking-wider">{clue.title}</div>
                      <div className="text-[11px] text-[#6b5434]">
                        {name}
                        {clue.date && ` · ${clue.date}`}
                      </div>
                      <p className="mt-1.5 line-clamp-2 font-serif text-xs leading-relaxed text-[#3d2f1c]">{clue.description}</p>
                    </div>
                  </div>
                  {!clue.isRead && (
                    <span className="absolute -right-2 -top-2 flex h-8 w-8 rotate-12 items-center justify-center rounded-full bg-seal font-serif text-[10px] text-parchment shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
                      新
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>

        <div className="flex flex-shrink-0 justify-between border-t border-brass/10 px-6 py-2 font-serif text-xs text-frost-dim">
          <span>共 {clues.length} 条线索</span>
          <span>{clues.filter((c) => !c.isRead).length} 条未读</span>
        </div>
      </div>
    </>
  );
}
