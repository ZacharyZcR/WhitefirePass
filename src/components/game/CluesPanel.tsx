/**
 * Clues Panel - Investigation board for collecting and reading documents
 */

'use client';

import { useState } from 'react';
import { BookOpen, FileText, Scroll, File, Archive, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { StoryIntro } from './StoryIntro';
import type { Clue, ClueCategory } from '@/types/game';

interface CluesPanelProps {
  clues: Clue[];
  onClueRead?: (clueId: string) => void;
}

/**
 * Get icon for clue category
 */
function getCategoryIcon(category: ClueCategory) {
  switch (category) {
    case 'diary':
      return <BookOpen className="w-5 h-5" />;
    case 'letter':
      return <Scroll className="w-5 h-5" />;
    case 'note':
      return <FileText className="w-5 h-5" />;
    case 'document':
      return <File className="w-5 h-5" />;
    case 'artifact':
      return <Archive className="w-5 h-5" />;
  }
}

/**
 * Get category display name
 */
function getCategoryName(category: ClueCategory): string {
  const names: Record<ClueCategory, string> = {
    diary: '日记',
    letter: '书信',
    note: '笔记',
    document: '文档',
    artifact: '物品',
  };
  return names[category];
}

/**
 * Get category color
 */
function getCategoryColor(category: ClueCategory): string {
  const colors: Record<ClueCategory, string> = {
    diary: 'bg-amber-600',
    letter: 'bg-purple-600',
    note: 'bg-blue-600',
    document: 'bg-slate-600',
    artifact: 'bg-red-600',
  };
  return colors[category];
}

export function CluesPanel({ clues, onClueRead }: CluesPanelProps) {
  const [selectedClue, setSelectedClue] = useState<Clue | null>(null);

  const handleClueClick = (clue: Clue) => {
    setSelectedClue(clue);
    if (!clue.isRead && onClueRead) {
      onClueRead(clue.id);
    }
  };

  const handleClueClose = () => {
    setSelectedClue(null);
  };

  return (
    <>
      {/* Clue viewer - using StoryIntro for diary type */}
      {selectedClue && selectedClue.category === 'diary' && (
        <StoryIntro open={true} onComplete={handleClueClose} />
      )}

      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex-shrink-0 px-4 py-3 border-b border-border bg-gradient-to-r from-card via-card/50 to-card">
          <h2 className="text-lg font-bold text-card-foreground font-cinzel tracking-wide">
            线索收集
            <span className="block text-[10px] text-muted-foreground font-normal tracking-widest opacity-60 mt-0.5">
              INVESTIGATION
            </span>
          </h2>
        </div>

        {/* Clues list */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-4 space-y-3">
            {clues.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Archive className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-sm">暂无线索</p>
                <p className="text-xs mt-1 opacity-60">随着游戏进行，你将发现更多秘密</p>
              </div>
            ) : (
              clues.map((clue) => (
                <Card
                  key={clue.id}
                  className={cn(
                    'cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] relative',
                    !clue.isRead && 'ring-2 ring-amber-400/50'
                  )}
                  onClick={() => handleClueClick(clue)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 flex-1">
                        <div className={cn('p-2 rounded-lg text-white', getCategoryColor(clue.category))}>
                          {getCategoryIcon(clue.category)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base flex items-center gap-2">
                            {clue.title}
                            {!clue.isRead && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-amber-600 border-amber-400">
                                NEW
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription className="text-xs mt-1">
                            {getCategoryName(clue.category)}
                            {clue.date && ` · ${clue.date}`}
                          </CardDescription>
                        </div>
                      </div>
                      <Eye className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {clue.description}
                    </p>
                  </CardContent>

                  {/* Unread indicator */}
                  {!clue.isRead && (
                    <div className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                  )}
                </Card>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Footer stats */}
        <div className="flex-shrink-0 px-4 py-3 border-t border-border bg-card/50">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>共 {clues.length} 条线索</span>
            <span>{clues.filter((c) => !c.isRead).length} 条未读</span>
          </div>
        </div>
      </div>
    </>
  );
}
