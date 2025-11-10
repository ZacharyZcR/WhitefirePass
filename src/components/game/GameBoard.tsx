/**
 * Main game board component - orchestrates the entire game UI
 */

'use client';

import { useGameStore } from '@/stores/game-store';
import { PlayerCard } from './PlayerCard';
import { MessageFlow } from './MessageFlow';
import { ControlPanel } from './ControlPanel';
import { VoteTracker } from './VoteTracker';
import { FactionStats } from './FactionStats';
import { VotingProgress } from './VotingProgress';
import { CurrentSpeaker } from './CurrentSpeaker';
import { Dog, Gamepad2, Moon, Sun, Users as UsersIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

/**
 * Get phase-specific background gradient and theme
 */
function getPhaseTheme(phase: string) {
  switch (phase) {
    case 'night':
      return {
        gradient: 'from-stone-950 via-stone-900 to-stone-950',
        border: 'border-blue-500/30',
        icon: <Moon className="w-8 h-8 text-blue-400" />,
        label: '夜晚',
      };
    case 'day':
      return {
        gradient: 'from-stone-800 via-stone-700 to-stone-800',
        border: 'border-amber-500/30',
        icon: <Sun className="w-8 h-8 text-amber-400" />,
        label: '白天',
      };
    case 'voting':
      return {
        gradient: 'from-stone-900 via-orange-950 to-stone-900',
        border: 'border-orange-500/30',
        icon: <UsersIcon className="w-8 h-8 text-orange-400" />,
        label: '投票阶段',
      };
    case 'end':
      return {
        gradient: 'from-stone-900 via-emerald-950 to-stone-900',
        border: 'border-emerald-500/30',
        icon: <Dog className="w-8 h-8 text-emerald-400" />,
        label: '游戏结束',
      };
    case 'setup':
      return {
        gradient: 'from-stone-900 via-purple-950 to-stone-900',
        border: 'border-purple-500/30',
        icon: <Gamepad2 className="w-8 h-8 text-purple-400" />,
        label: '准备中',
      };
    default:
      return {
        gradient: 'from-stone-900 via-purple-950 to-stone-900',
        border: 'border-purple-500/30',
        icon: <Gamepad2 className="w-8 h-8 text-purple-400" />,
        label: '准备中',
      };
  }
}

export function GameBoard() {
  const { gameState } = useGameStore();
  const phase = gameState?.phase || 'setup';
  const theme = getPhaseTheme(phase);

  return (
    <div className={cn(
      "h-screen w-screen overflow-hidden flex flex-col bg-gradient-to-br transition-all duration-1000 ease-in-out",
      theme.gradient
    )}>
      {/* Fixed Header */}
      <header className="flex-shrink-0 border-b border-border/50 backdrop-blur-sm bg-background/10">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Dog className="w-8 h-8 text-stone-300" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">白烬山口</h1>
              <p className="text-xs text-muted-foreground">
                15名旅人被困于寂静山庄，在山灵的契约下展开生死博弈
              </p>
            </div>
          </div>

          {gameState && (
            <div className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full border-2 backdrop-blur-md bg-background/20",
              theme.border
            )}>
              {theme.icon}
              <div>
                <div className="text-sm font-bold text-foreground">{theme.label}</div>
                <div className="text-xs text-muted-foreground">第 {gameState.round} 回合</div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area - No Scroll */}
      <div className="flex-1 flex gap-4 p-4 overflow-hidden">
        {/* Left Sidebar - Players & Controls */}
        <div className="w-96 flex flex-col gap-4 overflow-hidden">
          {/* Players List - Scrollable */}
          <div className="flex-1 rounded-lg bg-card/90 backdrop-blur-sm border border-border shadow-xl overflow-hidden flex flex-col">
            <div className="flex-shrink-0 px-4 py-3 border-b border-border">
              <h2 className="text-lg font-bold text-card-foreground">玩家列表</h2>
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

          {/* Faction Stats */}
          {gameState && gameState.phase !== 'setup' && (
            <div className="flex-shrink-0">
              <FactionStats gameState={gameState} />
            </div>
          )}

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
          <div className="flex-1 rounded-lg bg-card/90 backdrop-blur-sm border border-border shadow-xl overflow-hidden flex flex-col">
            <div className="flex-shrink-0 px-4 py-3 border-b border-border">
              <h2 className="text-lg font-bold text-card-foreground">游戏日志</h2>
            </div>
            <div className="flex-1 overflow-hidden">
              {gameState ? (
                <Tabs defaultValue="game" className="h-full flex flex-col">
                  <TabsList className="flex-shrink-0 w-full justify-start rounded-none border-b bg-background/50">
                    <TabsTrigger value="game">游戏记录</TabsTrigger>
                    <TabsTrigger value="thinking">AI思考</TabsTrigger>
                    <TabsTrigger value="prompt">AI提示词</TabsTrigger>
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

          {/* Right Sidebar - Current Speaker & Vote Tracker */}
          {gameState && (
            <div className="w-80 flex flex-col gap-4 overflow-hidden">
              {/* Current Speaker - Upper section */}
              <div className="flex-shrink-0 rounded-lg bg-card/90 backdrop-blur-sm border border-border shadow-xl">
                <CurrentSpeaker gameState={gameState} />
              </div>

              {/* Vote Tracker - Lower section (scrollable) */}
              <div className="flex-1 rounded-lg bg-card/90 backdrop-blur-sm border border-border shadow-xl overflow-hidden">
                <VoteTracker gameState={gameState} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
