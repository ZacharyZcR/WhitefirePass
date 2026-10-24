/**
 * Game screen: backdrop · HUD · seats flanking the stage · ledger · modals.
 */

'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/stores/game-store';
import { useBGM } from '@/hooks/useBGM';
import { TooltipProvider } from '@/components/ui/tooltip';
import { getNextActor, isNightScene } from '@/lib/design-tokens';
import { StartMenu } from './StartMenu';
import { SceneBackdrop, type SceneMood } from './SceneBackdrop';
import { TopHud } from './TopHud';
import { Stage, pickStageMessage } from './Stage';
import { TravelerSeat } from './TravelerSeat';
import { Ledger, type LedgerTab } from './Ledger';
import { GameMenu } from './GameMenu';
import { PhaseTransition } from './PhaseTransition';
import { GameEndDialog } from './GameEndDialog';
import { EmotionalStateDialog } from './EmotionalStateDialog';
import { SecretMeetingSelector } from './SecretMeetingSelector';
import { PersonalityEditor } from './PersonalityEditor';
import { PromptViewer } from './PromptViewer';
import { GameGuide } from './GameGuide';

export function GameBoard() {
  const {
    gameState,
    clues,
    markClueAsRead,
    executeNextStep,
    isProcessing,
    lastError,
    showTransition,
    transitionPhase,
    transitionRound,
    completeTransition,
    clearPendingStateChanges,
    showSecretMeetingSelector,
    setSecretMeetingParticipants,
    executeSecretMeeting,
  } = useGameStore();

  const phase = gameState?.phase ?? 'setup';
  const bgm = useBGM(gameState ? phase : 'menu', true);

  const [ledgerTab, setLedgerTab] = useState<LedgerTab | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [oracleOpen, setOracleOpen] = useState(false);
  const [travelersOpen, setTravelersOpen] = useState(false);
  const [focusPlayerId, setFocusPlayerId] = useState<string | null>(null);
  const [showEndDialog, setShowEndDialog] = useState(false);

  // Open the end dialog shortly after the game ends
  useEffect(() => {
    if (gameState?.phase === 'end' && gameState.winner && !showEndDialog) {
      const timer = setTimeout(() => setShowEndDialog(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [gameState?.phase, gameState?.winner, showEndDialog]);

  // Space / Enter: next step. Esc: close the ledger.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Escape') setLedgerTab(null);
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        if (gameState && !isProcessing && gameState.phase !== 'end' && !lastError) void executeNextStep();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [gameState, isProcessing, lastError, executeNextStep]);

  if (!gameState) return <StartMenu />;

  const mood: SceneMood = phase === 'voting' ? 'vote' : isNightScene(phase) ? 'night' : 'day';
  const speakerName = pickStageMessage(gameState.messages).message?.from;
  const nextActor = getNextActor(gameState);
  const half = Math.ceil(gameState.players.length / 2);

  const openTraveler = (id: string | null) => {
    setFocusPlayerId(id);
    setTravelersOpen(true);
  };

  const seats = (side: 'left' | 'right') => {
    const list = side === 'left' ? gameState.players.slice(0, half) : gameState.players.slice(half);
    const offset = side === 'left' ? 0 : half;
    return (
      <aside className="flex min-h-0 flex-col gap-1.5 py-1">
        {list.map((p, i) => (
          <TravelerSeat
            key={p.id}
            player={p}
            seat={offset + i + 1}
            side={side}
            speaking={p.name === speakerName}
            next={p.id === nextActor?.id && !gameState.waitingForNextStep}
            onSelect={() => openTraveler(p.id)}
          />
        ))}
      </aside>
    );
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="relative h-screen w-screen overflow-hidden bg-ink text-parchment">
        <SceneBackdrop mood={mood} />

        <div className="relative z-10 grid h-full grid-rows-[auto_1fr]">
          <TopHud
            state={gameState}
            unreadClues={clues.filter((c) => !c.isRead).length}
            ledgerTab={ledgerTab}
            onLedger={(tab) => setLedgerTab((cur) => (cur === tab ? null : tab))}
            onTravelers={() => openTraveler(null)}
            onOracle={() => setOracleOpen(true)}
            onMenu={() => setMenuOpen(true)}
            bgm={bgm}
          />
          <main className="grid min-h-0 grid-cols-[clamp(190px,16vw,290px)_1fr_clamp(190px,16vw,290px)] gap-5 px-4 pb-4">
            {seats('left')}
            <Stage state={gameState} />
            {seats('right')}
          </main>
        </div>

        <Ledger
          tab={ledgerTab}
          onTabChange={setLedgerTab}
          onClose={() => setLedgerTab(null)}
          state={gameState}
          clues={clues}
          onClueRead={markClueAsRead}
        />
      </div>

      {showTransition && transitionPhase && (
        <PhaseTransition phase={transitionPhase} round={transitionRound} onComplete={completeTransition} />
      )}

      <GameMenu
        open={menuOpen}
        onOpenChange={setMenuOpen}
        onOpenGuide={() => {
          setMenuOpen(false);
          setGuideOpen(true);
        }}
      />
      <GameGuide open={guideOpen} onOpenChange={setGuideOpen} />
      <PromptViewer open={oracleOpen} onOpenChange={setOracleOpen} />
      <PersonalityEditor open={travelersOpen} onOpenChange={setTravelersOpen} focusPlayerId={focusPlayerId} />

      {gameState.phase === 'end' && gameState.winner && (
        <GameEndDialog gameState={gameState} open={showEndDialog} onOpenChange={setShowEndDialog} />
      )}

      {gameState.pendingStateChanges?.length > 0 && (
        <EmotionalStateDialog stateChanges={gameState.pendingStateChanges} onComplete={clearPendingStateChanges} />
      )}

      {gameState.phase === 'secret_meeting' &&
        gameState.pendingSecretMeeting &&
        !gameState.pendingSecretMeeting.selectedParticipants &&
        showSecretMeetingSelector && (
          <SecretMeetingSelector
            players={gameState.players}
            timing={gameState.pendingSecretMeeting.timing}
            onConfirm={(participants) => {
              setSecretMeetingParticipants(participants);
              void executeSecretMeeting();
            }}
          />
        )}
    </TooltipProvider>
  );
}
