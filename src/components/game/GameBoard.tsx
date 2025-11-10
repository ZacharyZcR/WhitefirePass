/**
 * Main game board component - orchestrates the entire game UI
 */

'use client';

import { useGameStore } from '@/stores/game-store';
import { PlayerCard } from './PlayerCard';
import { MessageFlow } from './MessageFlow';
import { ControlPanel } from './ControlPanel';
import { VoteTracker } from './VoteTracker';
import { VotingProgress } from './VotingProgress';
import { CurrentSpeaker } from './CurrentSpeaker';
import { StartMenu } from './StartMenu';
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
  const { gameState, clues, markClueAsRead } = useGameStore();
  const phase = gameState?.phase || 'setup';
  const theme = getPhaseTheme(phase);

  // Show start menu if no active game
  if (!gameState) {
    return <StartMenu />;
  }

  return (
    <>
      <div
        className={cn(
          "h-screen w-screen overflow-hidden flex flex-col bg-gradient-to-br transition-all duration-1000 ease-in-out relative",
          theme.gradient
        )}
      >
      {/* Gothic Corner Decorations - Subtle and elegant */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-8">
        {/* Top-left corner */}
        <div className="absolute top-0 left-0 text-foreground/30">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="0.5">
            <path d="M0,60 Q15,35 30,20 Q45,5 60,0" opacity="0.6" />
            <path d="M0,60 Q10,45 20,30 Q30,15 40,10" opacity="0.4" />
            <path d="M0,60 Q5,40 10,20 Q15,10 20,5" opacity="0.3" />
            <path d="M0,60 Q0,30 0,0" opacity="0.5" />
            <circle cx="12" cy="12" r="1.5" fill="currentColor" opacity="0.3" />
            <circle cx="24" cy="24" r="1.2" fill="currentColor" opacity="0.25" />
            <circle cx="36" cy="36" r="1" fill="currentColor" opacity="0.2" />
            <circle cx="48" cy="48" r="0.8" fill="currentColor" opacity="0.15" />
          </svg>
        </div>
        {/* Top-right corner */}
        <div className="absolute top-0 right-0 text-foreground/30 scale-x-[-1]">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="0.5">
            <path d="M0,60 Q15,35 30,20 Q45,5 60,0" opacity="0.6" />
            <path d="M0,60 Q10,45 20,30 Q30,15 40,10" opacity="0.4" />
            <path d="M0,60 Q5,40 10,20 Q15,10 20,5" opacity="0.3" />
            <path d="M0,60 Q0,30 0,0" opacity="0.5" />
            <circle cx="12" cy="12" r="1.5" fill="currentColor" opacity="0.3" />
            <circle cx="24" cy="24" r="1.2" fill="currentColor" opacity="0.25" />
            <circle cx="36" cy="36" r="1" fill="currentColor" opacity="0.2" />
            <circle cx="48" cy="48" r="0.8" fill="currentColor" opacity="0.15" />
          </svg>
        </div>
        {/* Bottom-left corner */}
        <div className="absolute bottom-0 left-0 text-foreground/30 scale-y-[-1]">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="0.5">
            <path d="M0,60 Q15,35 30,20 Q45,5 60,0" opacity="0.6" />
            <path d="M0,60 Q10,45 20,30 Q30,15 40,10" opacity="0.4" />
            <path d="M0,60 Q5,40 10,20 Q15,10 20,5" opacity="0.3" />
            <path d="M0,60 Q0,30 0,0" opacity="0.5" />
            <circle cx="12" cy="12" r="1.5" fill="currentColor" opacity="0.3" />
            <circle cx="24" cy="24" r="1.2" fill="currentColor" opacity="0.25" />
            <circle cx="36" cy="36" r="1" fill="currentColor" opacity="0.2" />
            <circle cx="48" cy="48" r="0.8" fill="currentColor" opacity="0.15" />
          </svg>
        </div>
        {/* Bottom-right corner */}
        <div className="absolute bottom-0 right-0 text-foreground/30 scale-[-1]">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="0.5">
            <path d="M0,60 Q15,35 30,20 Q45,5 60,0" opacity="0.6" />
            <path d="M0,60 Q10,45 20,30 Q30,15 40,10" opacity="0.4" />
            <path d="M0,60 Q5,40 10,20 Q15,10 20,5" opacity="0.3" />
            <path d="M0,60 Q0,30 0,0" opacity="0.5" />
            <circle cx="12" cy="12" r="1.5" fill="currentColor" opacity="0.3" />
            <circle cx="24" cy="24" r="1.2" fill="currentColor" opacity="0.25" />
            <circle cx="36" cy="36" r="1" fill="currentColor" opacity="0.2" />
            <circle cx="48" cy="48" r="0.8" fill="currentColor" opacity="0.15" />
          </svg>
        </div>
      </div>

      {/* Fixed Header */}
      <header className="flex-shrink-0 border-b border-border/50 backdrop-blur-sm bg-background/10 shadow-lg relative z-10">
        <div className="px-6 py-4 flex items-center justify-between relative">
          {/* Header decorative underline */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-px pointer-events-none">
            <div className="w-full h-full bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <svg width="32" height="16" viewBox="0 0 32 16" className="text-foreground/10" fill="none" stroke="currentColor" strokeWidth="0.5">
                <circle cx="16" cy="8" r="2.5" opacity="0.4" />
                <circle cx="16" cy="8" r="4.5" opacity="0.2" />
                <path d="M4,8 L10,8" opacity="0.3" />
                <path d="M22,8 L28,8" opacity="0.3" />
              </svg>
            </div>
          </div>

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
      <div className="flex-1 flex gap-4 p-4 overflow-hidden relative z-10">
        {/* Left Sidebar - Players & Controls */}
        <div className="w-96 flex flex-col gap-4 overflow-hidden relative">
          {/* Vertical decorative line on the right edge */}
          <div className="absolute top-0 bottom-0 -right-2 w-px pointer-events-none">
            <div className="w-full h-full bg-gradient-to-b from-transparent via-foreground/10 to-transparent" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <svg width="16" height="48" viewBox="0 0 16 48" className="text-foreground/10" fill="none" stroke="currentColor" strokeWidth="0.5">
                <circle cx="8" cy="24" r="2.5" opacity="0.4" />
                <circle cx="8" cy="24" r="4.5" opacity="0.2" />
                <path d="M8,8 L8,16" opacity="0.3" />
                <path d="M8,32 L8,40" opacity="0.3" />
              </svg>
            </div>
          </div>
          {/* Players List - Scrollable */}
          <div className="flex-1 rounded-lg bg-card/90 backdrop-blur-sm border border-border shadow-xl shadow-inner-glow overflow-hidden flex flex-col">
            <div className="flex-shrink-0 px-4 py-3 border-b border-border bg-gradient-to-r from-card via-card/50 to-card relative">
              {/* Title decorative elements */}
              <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-foreground/20" />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-foreground/20" />
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
    </>
  );
}
