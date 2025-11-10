/**
 * Main game board component - orchestrates the entire game UI
 */

'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/stores/game-store';
import { PlayerCard } from './PlayerCard';
import { MessageFlow } from './MessageFlow';
import { ControlPanel } from './ControlPanel';
import { VoteTracker } from './VoteTracker';
import { VotingProgress } from './VotingProgress';
import { CurrentSpeaker } from './CurrentSpeaker';
import { StartMenu } from './StartMenu';
import { GameTransition } from './GameTransition';
import { CluesPanel } from './CluesPanel';
import { Mountain, Gamepad2, Moon, Sun, Users as UsersIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
    case 'setup':
      return {
        gradient: 'from-slate-950 via-purple-950/50 to-slate-950',
        border: 'border-purple-400/40',
        icon: <Gamepad2 className="w-8 h-8 text-purple-300" />,
        label: '准备中',
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
  const { gameState, clues, markClueAsRead } = useGameStore();
  const phase = gameState?.phase || 'setup';
  const theme = getPhaseTheme(phase);
  const [showTransition, setShowTransition] = useState(false);
  const [previousPhase, setPreviousPhase] = useState<string>('setup');
  const [isGameEntering, setIsGameEntering] = useState(false);

  // Detect phase change from setup to game - show transition
  useEffect(() => {
    if (previousPhase === 'setup' && phase !== 'setup' && gameState) {
      setShowTransition(true);
      setIsGameEntering(true);
    }
    setPreviousPhase(phase);
  }, [phase, previousPhase, gameState]);

  // Game entry animation
  useEffect(() => {
    if (isGameEntering) {
      const timer = setTimeout(() => {
        setIsGameEntering(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isGameEntering]);

  // Show start menu if no active game
  if (!gameState || phase === 'setup') {
    return <StartMenu />;
  }

  // Show transition animation
  if (showTransition) {
    return <GameTransition onComplete={() => setShowTransition(false)} />;
  }

  return (
    <>
      <div
        className={cn(
          "h-screen w-screen overflow-hidden flex flex-col bg-gradient-to-br transition-all duration-1000 ease-in-out",
          theme.gradient,
          isGameEntering ? 'opacity-0' : 'opacity-100'
        )}
      >
      {/* Fixed Header */}
      <header className={cn(
        "flex-shrink-0 border-b border-border/50 backdrop-blur-sm bg-background/10 shadow-lg transition-all duration-1000 ease-out",
        isGameEntering ? 'translate-y-[-100%]' : 'translate-y-0'
      )}>
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mountain className="w-8 h-8 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
            <div>
              <h1 className="text-2xl font-bold text-foreground font-cinzel text-glow tracking-wider">
                白烬山口
              </h1>
              <p className="text-xs text-muted-foreground font-serif">
                15名旅人被困于寂静山庄，在山灵的契约下展开生死博弈
              </p>
            </div>
          </div>

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
      </header>

      {/* Main Content Area - No Scroll */}
      <div className={cn(
        "flex-1 flex gap-4 p-4 overflow-hidden transition-all duration-1000 ease-out delay-300",
        isGameEntering ? 'opacity-0 translate-y-8' : 'opacity-100 translate-y-0'
      )}>
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
                  const isCurrent =
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
    </>
  );
}
