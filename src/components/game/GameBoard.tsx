/**
 * Game screen: backdrop · HUD · seats flanking the stage · ledger · modals.
 */

'use client';

import { useEffect, useState } from 'react';
import { useCaption } from '@/lib/audio/player';
import { useGameStore } from '@/stores/game-store';
import { useBGM } from '@/hooks/useBGM';
import { TooltipProvider } from '@/components/ui/tooltip';
import { getNextActor, isHarvestNow, isNightScene } from '@/lib/design-tokens';
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
import { PersonalityEditor } from './PersonalityEditor';
import { PromptViewer } from './PromptViewer';
import { GameGuide } from './GameGuide';
import { DeathNotice } from './DeathNotice';
import { OpeningCinematic } from './OpeningCinematic';
import { ChosenCinematic } from './ChosenCinematic';
import { DaySevenScene } from './DaySevenScene';
import { GameAudio } from '@/components/audio/GameAudio';
import { asSeen, useGodView } from '@/hooks/useGodView';

export function GameBoard() {
  const {
    gameState,
    clues,
    markClueAsRead,
    executeNextStep,
    finishCutscene,
    isProcessing,
    lastError,
    showTransition,
    transitionPhase,
    transitionRound,
    completeTransition,
    clearPendingStateChanges,
  } = useGameStore();

  const godView = useGodView((s) => s.godView);
  const phase = gameState?.phase ?? 'setup';

  // 美德/堕落：等讣告停完、死者的台词念完，再弹出来
  const speaking = useCaption((s) => s.caption !== null);
  const deathCount = gameState?.deathLog?.length ?? 0;
  const [mourned, setMourned] = useState(true);
  useEffect(() => {
    setMourned(false);
    const timer = setTimeout(() => setMourned(true), 4500);
    return () => clearTimeout(timer);
  }, [deathCount]);
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
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;
      if (e.code === 'Escape') setLedgerTab(null);
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        if (
          gameState &&
          !isProcessing &&
          gameState.phase !== 'end' &&
          gameState.phase !== 'prologue' && // 序章在放开场 CG，空格由 CG 自己处理
          !lastError
        )
          void executeNextStep();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [gameState, isProcessing, lastError, executeNextStep]);

  if (!gameState) return <StartMenu />;

  const mood: SceneMood =
    phase === 'voting' ? 'vote' : isNightScene(phase) ? 'night' : 'day';
  // 不开上帝视角时，夜里私密行动的人不亮座位，否则一看就知道谁是烙印者
  const staged = pickStageMessage(gameState.messages).message;
  const speakerName = staged && asSeen(staged, godView).from;
  const nextActor =
    godView || !isNightScene(phase) ? getNextActor(gameState) : undefined;
  const half = Math.ceil(gameState.players.length / 2);

  const openTraveler = (id: string | null) => {
    setFocusPlayerId(id);
    setTravelersOpen(true);
  };

  const seats = (side: 'left' | 'right') => {
    const list =
      side === 'left'
        ? gameState.players.slice(0, half)
        : gameState.players.slice(half);
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
            reveal={godView}
            harvest={godView && isNightScene(phase) && isHarvestNow(p.role, gameState.round)}
            onSelect={() => openTraveler(p.id)}
          />
        ))}
      </aside>
    );
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="relative h-screen w-screen overflow-hidden bg-ink text-parchment">
        <SceneBackdrop
          mood={mood}
        />
        <DeathNotice state={gameState} />
        <GameAudio state={gameState} />
        {gameState.cutscenes?.[0] === 'chosen' && (
          <ChosenCinematic
            marked={gameState.players.filter((p) => p.role === 'marked')}
            godView={godView}
            onDone={finishCutscene}
          />
        )}
        {gameState.cutscenes?.[0] === 'dayseven' && <DaySevenScene onDone={finishCutscene} />}
        {phase === 'prologue' && (
          <OpeningCinematic onDone={() => void executeNextStep()} />
        )}

        <div className="relative z-10 grid h-full grid-rows-[auto_1fr]">
          <TopHud
            state={gameState}
            unreadClues={clues.filter((c) => !c.isRead).length}
            ledgerTab={ledgerTab}
            onLedger={(tab) =>
              setLedgerTab((cur) => (cur === tab ? null : tab))
            }
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
        <PhaseTransition
          phase={transitionPhase}
          round={transitionRound}
          onComplete={completeTransition}
        />
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
      <PersonalityEditor
        open={travelersOpen}
        onOpenChange={setTravelersOpen}
        focusPlayerId={focusPlayerId}
      />

      {gameState.phase === 'end' && gameState.winner && (
        <GameEndDialog
          gameState={gameState}
          open={showEndDialog}
          onOpenChange={setShowEndDialog}
        />
      )}

      {gameState.pendingStateChanges?.length > 0 && mourned && !speaking && (
        <EmotionalStateDialog
          stateChanges={gameState.pendingStateChanges}
          onComplete={clearPendingStateChanges}
        />
      )}
    </TooltipProvider>
  );
}
