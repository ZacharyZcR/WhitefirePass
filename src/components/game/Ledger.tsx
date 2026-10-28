/**
 * The ledger: a slide-out record book holding the full log, inner
 * monologues, oracle prompts, vote records and clues.
 * Kept mounted while closed so filters survive.
 */

'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import type { Clue, GameState, Message } from '@/types/game';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { MessageFlow } from './MessageFlow';
import { MessageFilter } from './MessageFilter';
import { VoteTracker } from './VoteTracker';
import { CluesPanel } from './CluesPanel';

export type LedgerTab = 'log' | 'thinking' | 'prompt' | 'votes' | 'clues';

const MESSAGE_TABS: { value: LedgerTab; label: string; types: string[] }[] = [
  { value: 'log', label: '记录', types: ['system', 'speech', 'vote', 'death', 'action'] },
  { value: 'thinking', label: '独白', types: ['thinking'] },
  { value: 'prompt', label: '神谕', types: ['prompt'] },
];

interface LedgerProps {
  tab: LedgerTab | null;
  onTabChange: (tab: LedgerTab) => void;
  onClose: () => void;
  state: GameState;
  clues: Clue[];
  onClueRead: (id: string) => void;
}

export function Ledger({ tab, onTabChange, onClose, state, clues, onClueRead }: LedgerProps) {
  const [filtered, setFiltered] = useState<Message[]>([]);
  const messages = filtered.length > 0 ? filtered : state.messages;
  const unread = clues.filter((c) => !c.isRead).length;
  const isMessageTab = MESSAGE_TABS.some((t) => t.value === tab);

  return (
    <>
      <div
        onClick={onClose}
        className={cn(
          'fixed inset-0 z-30 bg-black/40 transition-opacity duration-500',
          tab ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />
      <aside
        aria-hidden={!tab}
        className={cn(
          'panel-ink fixed inset-y-0 right-0 z-40 flex w-[min(600px,92vw)] flex-col border-l border-brass/30 shadow-[-30px_0_60px_rgba(0,0,0,0.6)] transition-transform duration-500 ease-out',
          tab ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="grain absolute inset-0" />
        <header className="relative flex items-end justify-between px-6 pb-2 pt-5">
          <div>
            <div className="font-serif text-xl font-semibold tracking-[0.4em] text-parchment">记录簿</div>
            <div className="font-latin text-xs italic tracking-wider text-brass/60">Chronicon Ludi</div>
          </div>
          <button onClick={onClose} className="mb-1 text-brass/70 transition-colors hover:text-brass-light" aria-label="合上记录簿">
            <X className="h-5 w-5" />
          </button>
        </header>

        <Tabs value={tab ?? 'log'} onValueChange={(v) => onTabChange(v as LedgerTab)} className="relative flex min-h-0 flex-1 flex-col">
          <TabsList className="mx-4 flex-shrink-0 justify-start">
            {MESSAGE_TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>
            ))}
            <TabsTrigger value="votes">票决</TabsTrigger>
            <TabsTrigger value="clues">
              线索
              {unread > 0 && <span className="ml-1.5 rounded-full bg-seal px-1.5 text-[10px] text-parchment">{unread}</span>}
            </TabsTrigger>
          </TabsList>

          <div className={cn('flex-shrink-0', !isMessageTab && 'hidden')}>
            <MessageFilter messages={state.messages} players={state.players} onFilterChange={setFiltered} />
          </div>

          {MESSAGE_TABS.map((t) => (
            <TabsContent key={t.value} value={t.value} className="m-0 min-h-0 flex-1 overflow-hidden">
              <MessageFlow messages={messages} players={state.players} filterTypes={t.types} />
            </TabsContent>
          ))}
          <TabsContent value="votes" className="m-0 min-h-0 flex-1 overflow-hidden">
            <VoteTracker gameState={state} />
          </TabsContent>
          <TabsContent value="clues" className="m-0 min-h-0 flex-1 overflow-hidden">
            <CluesPanel clues={clues} onClueRead={onClueRead} />
          </TabsContent>
        </Tabs>
      </aside>
    </>
  );
}
