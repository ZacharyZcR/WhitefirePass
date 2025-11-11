/**
 * Main game board component - orchestrates the entire game UI
 */

'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/stores/game-store';
import { PlayerCard } from './PlayerCard';
import { MessageFlow } from './MessageFlow';
import { ControlPanel } from './ControlPanel';
import { VoteTracker } from './VoteTracker';
import { VotingProgress } from './VotingProgress';
import { CurrentSpeaker } from './CurrentSpeaker';
import { StartMenu } from './StartMenu';
import { CluesPanel } from './CluesPanel';
import { PhaseTransition } from './PhaseTransition';
import { GameEndDialog } from './GameEndDialog';
import { Mountain, Gamepad2, Moon, Sun, Users as UsersIcon, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useBGM } from '@/hooks/useBGM';

/**
 * Get phase-specific background gradient and theme
 */
function getPhaseTheme(phase: string) {
  switch (phase) {
    case 'night':
      return {
        gradient: 'from-slate-950 via-blue-950/50 to-slate-950',
        border: 'border-blue-400/40',
        icon: <Moon className="w-8 h-8 text-blue-300" />,
        label: '夜晚',
      };
    case 'day':
      return {
        gradient: 'from-slate-900 via-slate-800 to-slate-900',
        border: 'border-amber-400/40',
        icon: <Sun className="w-8 h-8 text-amber-300" />,
        label: '白天',
      };
    case 'voting':
      return {
        gradient: 'from-slate-950 via-orange-950/60 to-slate-950',
        border: 'border-orange-400/40',
        icon: <UsersIcon className="w-8 h-8 text-orange-300" />,
        label: '投票阶段',
      };
    case 'end':
      return {
        gradient: 'from-slate-950 via-cyan-950/40 to-slate-950',
        border: 'border-cyan-400/40',
        icon: <Mountain className="w-8 h-8 text-cyan-300" />,
        label: '游戏结束',
      };
    case 'prologue':
      return {
        gradient: 'from-slate-950 via-slate-900 to-slate-950',
        border: 'border-slate-400/40',
        icon: <Mountain className="w-8 h-8 text-slate-300" />,
        label: '序章',
      };
    case 'setup':
      return {
        gradient: 'from-slate-950 via-slate-900 to-slate-950',
        border: 'border-slate-400/40',
        icon: <Mountain className="w-8 h-8 text-slate-300" />,
        label: '序章',
      };
    default:
      return {
        gradient: 'from-slate-950 via-purple-950/50 to-slate-950',
        border: 'border-purple-400/40',
        icon: <Gamepad2 className="w-8 h-8 text-purple-300" />,
        label: '准备中',
      };
  }
}

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
  } = useGameStore();
  const phase = gameState?.phase || 'setup';
  const theme = getPhaseTheme(phase);

  // BGM system
  const bgmPhase = gameState ? phase : 'menu';
  const { volume, setVolume, isMuted, toggleMute } = useBGM(bgmPhase, true);

  // Game end dialog state
  const [showEndDialog, setShowEndDialog] = useState(false);

  // Auto-open game end dialog when game ends
  useEffect(() => {
    if (gameState?.phase === 'end' && gameState.winner && !showEndDialog) {
      // Delay slightly to allow the ending message to show first
      const timer = setTimeout(() => {
        setShowEndDialog(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [gameState?.phase, gameState?.winner, showEndDialog]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Space or Enter: Next step
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        const canExecuteNext = gameState && !isProcessing && gameState.phase !== 'end' && !lastError;
        if (canExecuteNext) {
          void executeNextStep();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, isProcessing, lastError, executeNextStep]);

  // Show start menu if no active game
  if (!gameState) {
    return <StartMenu />;
  }

  return (
    <>
      {/* Phase transition animation */}
      {showTransition && transitionPhase && (
        <PhaseTransition
          phase={transitionPhase}
          round={transitionRound}
          onComplete={completeTransition}
        />
      )}

      <div
        className={cn(
          "h-screen w-screen overflow-hidden flex flex-col bg-gradient-to-br transition-all duration-1000 ease-in-out",
          theme.gradient
        )}
      >
      {/* Fixed Header */}
      <header className="flex-shrink-0 border-b border-border/50 backdrop-blur-sm bg-background/10 shadow-lg">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mountain className="w-8 h-8 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
            <div>
              <h1 className="text-2xl font-bold text-foreground font-cinzel text-glow tracking-wider">
                白烬山口
              </h1>
              <p className="text-xs text-muted-foreground font-serif">
                1913年深冬 · 寂静山庄 · 收割与羔羊的生死博弈
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* BGM Volume Control */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-background/20"
                  onClick={(e) => {
                    // Toggle mute on right click
                    if (e.button === 2) {
                      e.preventDefault();
                      toggleMute();
                    }
                  }}
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-foreground" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48" align="end">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">BGM音量</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={toggleMute}
                    >
                      {isMuted ? (
                        <VolumeX className="w-3 h-3" />
                      ) : (
                        <Volume2 className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <VolumeX className="w-3 h-3 text-muted-foreground" />
                    <Slider
                      value={[volume * 100]}
                      onValueChange={(value) => setVolume(value[0] / 100)}
                      max={100}
                      step={1}
                      className="flex-1"
                      disabled={isMuted}
                    />
                    <Volume2 className="w-3 h-3 text-muted-foreground" />
                  </div>
                  <div className="text-xs text-center text-muted-foreground">
                    {isMuted ? '静音' : `${Math.round(volume * 100)}%`}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {gameState && (
              <div className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full border-2 backdrop-blur-md bg-background/20 shadow-glow-amber",
                theme.border
              )}>
                {theme.icon}
                <div>
                  <div className="text-sm font-bold text-foreground font-cinzel">{theme.label}</div>
                  <div className="text-xs text-muted-foreground font-serif">第 {gameState.round} 回合</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area - No Scroll */}
      <div className="flex-1 flex gap-4 p-4 overflow-hidden">
        {/* Left Sidebar - Players & Controls */}
        <div className="w-96 flex flex-col gap-4 overflow-hidden">
          {/* Players List - Scrollable */}
          <div className="flex-1 rounded-lg bg-card/90 backdrop-blur-sm border border-border shadow-xl shadow-inner-glow overflow-hidden flex flex-col">
            <div className="flex-shrink-0 px-4 py-3 border-b border-border bg-gradient-to-r from-card via-card/50 to-card">
              <h2 className="text-lg font-bold text-card-foreground font-cinzel tracking-wide">
                玩家列表
                <span className="block text-[10px] text-muted-foreground font-normal tracking-widest opacity-60 mt-0.5">
                  TRAVELERS
                </span>
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {gameState ? (
                gameState.players.map((player, index) => {
                  // Determine if this player is currently speaking
                  // No current player during prologue/setup phases
                  const isCurrent =
                    gameState.phase !== 'prologue' &&
                    gameState.phase !== 'setup' &&
                    !gameState.waitingForNextStep &&
                    index === gameState.currentPlayerIndex &&
                    player.isAlive;

                  return (
                    <PlayerCard
                      key={player.id}
                      player={player}
                      showRole={true}
                      isCurrent={isCurrent}
                    />
                  );
                })
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <p>暂无进行中的游戏</p>
                  <p className="text-sm mt-2">开始新游戏以开始</p>
                </div>
              )}
            </div>
          </div>

          {/* Voting Progress */}
          {gameState && (
            <div className="flex-shrink-0">
              <VotingProgress gameState={gameState} />
            </div>
          )}

          {/* Control Panel - Fixed */}
          <div className="flex-shrink-0">
            <ControlPanel />
          </div>
        </div>

        {/* Right Main Area - Game Log & Sidebar */}
        <div className="flex-1 flex gap-4 overflow-hidden">
          {/* Game Log with Tabs */}
          <div className="flex-1 rounded-lg bg-card/90 backdrop-blur-sm border border-border shadow-xl shadow-inner-glow overflow-hidden flex flex-col">
            <div className="flex-shrink-0 px-4 py-3 border-b border-border bg-gradient-to-r from-card via-card/50 to-card">
              <h2 className="text-lg font-bold text-card-foreground font-cinzel tracking-wide">
                游戏日志
                <span className="block text-[10px] text-muted-foreground font-normal tracking-widest opacity-60 mt-0.5">
                  CHRONICLE
                </span>
              </h2>
            </div>
            <div className="flex-1 overflow-hidden">
              {gameState ? (
                <Tabs defaultValue="game" className="h-full flex flex-col">
                  <TabsList className="flex-shrink-0 w-full justify-start rounded-none border-b bg-background/50">
                    <TabsTrigger value="game">游戏记录</TabsTrigger>
                    <TabsTrigger value="thinking">内心独白</TabsTrigger>
                    <TabsTrigger value="prompt">神谕指引</TabsTrigger>
                  </TabsList>
                  <TabsContent value="game" className="flex-1 overflow-hidden m-0">
                    <MessageFlow
                      messages={gameState.messages}
                      players={gameState.players}
                      filterTypes={['system', 'speech', 'vote', 'death', 'action']}
                    />
                  </TabsContent>
                  <TabsContent value="thinking" className="flex-1 overflow-hidden m-0">
                    <MessageFlow
                      messages={gameState.messages}
                      players={gameState.players}
                      filterTypes={['thinking']}
                    />
                  </TabsContent>
                  <TabsContent value="prompt" className="flex-1 overflow-hidden m-0">
                    <MessageFlow
                      messages={gameState.messages}
                      players={gameState.players}
                      filterTypes={['prompt']}
                    />
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Gamepad2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-semibold mb-2">准备好开始了吗？</p>
                    <p className="text-sm">
                      输入你的 Gemini API 密钥并开始新游戏
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Current Speaker & Tabs (Vote Tracker / Clues) */}
          {gameState && (
            <div className="w-80 flex flex-col gap-4 overflow-hidden">
              {/* Current Speaker - Upper section */}
              <div className="flex-shrink-0 rounded-lg bg-card/90 backdrop-blur-sm border border-border shadow-xl shadow-inner-glow">
                <CurrentSpeaker gameState={gameState} />
              </div>

              {/* Tabs - Lower section (Vote Tracker / Clues Panel) */}
              <div className="flex-1 rounded-lg bg-card/90 backdrop-blur-sm border border-border shadow-xl shadow-inner-glow overflow-hidden flex flex-col">
                <Tabs defaultValue="votes" className="h-full flex flex-col">
                  <TabsList className="flex-shrink-0 w-full justify-start rounded-none border-b bg-background/50">
                    <TabsTrigger value="votes">投票记录</TabsTrigger>
                    <TabsTrigger value="clues" className="relative">
                      线索收集
                      {clues.filter((c) => !c.isRead).length > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white text-[10px] rounded-full flex items-center justify-center">
                          {clues.filter((c) => !c.isRead).length}
                        </span>
                      )}
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="votes" className="flex-1 overflow-hidden m-0">
                    <VoteTracker gameState={gameState} />
                  </TabsContent>
                  <TabsContent value="clues" className="flex-1 overflow-hidden m-0">
                    <CluesPanel clues={clues} onClueRead={markClueAsRead} />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

      {/* Game End Dialog */}
      {gameState && gameState.phase === 'end' && gameState.winner && (
        <GameEndDialog
          gameState={gameState}
          open={showEndDialog}
          onOpenChange={setShowEndDialog}
        />
      )}
    </>
  );
}
