/**
 * Secret Meeting Selector - UI for selecting two players for secret meeting
 */

'use client';

import { useState } from 'react';
import type { Player } from '@/types/game';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Check, Flame, Ghost, Ear, Search, Users as UsersIcon, Shield, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SecretMeetingSelectorProps {
  players: Player[];
  timing: 'before_discussion' | 'after_sacrifice';
  onConfirm: (participants: [string, string]) => void;
}

/**
 * Role names with English/Latin subtitles
 */
const roleNames: Record<string, { name: string; subtitle: string }> = {
  marked: { name: '烙印者', subtitle: 'The Marked' },
  heretic: { name: '背誓者', subtitle: 'The Heretic' },
  listener: { name: '聆心者', subtitle: 'The Listener' },
  coroner: { name: '食灰者', subtitle: 'Ash-Walker' },
  twin: { name: '共誓者', subtitle: 'The Twin' },
  guard: { name: '设闩者', subtitle: 'Guardian' },
  innocent: { name: '无知者', subtitle: 'The Innocent' },
};

/**
 * Role icon components
 */
const roleIconComponents: Record<string, React.ComponentType<{ className?: string }>> = {
  marked: Flame,
  heretic: Ghost,
  listener: Ear,
  coroner: Search,
  twin: UsersIcon,
  guard: Shield,
  innocent: User,
};

/**
 * Role colors
 */
const roleColors: Record<string, string> = {
  marked: 'text-red-400 bg-red-950/30 border-red-500/40',
  heretic: 'text-slate-400 bg-slate-950/30 border-slate-500/40',
  listener: 'text-purple-400 bg-purple-950/30 border-purple-500/40',
  coroner: 'text-cyan-400 bg-cyan-950/30 border-cyan-500/40',
  twin: 'text-teal-400 bg-teal-950/30 border-teal-500/40',
  guard: 'text-amber-400 bg-amber-950/30 border-amber-500/40',
  innocent: 'text-blue-400 bg-blue-950/30 border-blue-500/40',
};

export function SecretMeetingSelector({
  players,
  timing,
  onConfirm,
}: SecretMeetingSelectorProps) {
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);

  const alivePlayers = players.filter(p => p.isAlive);

  const handlePlayerClick = (playerName: string) => {
    if (selectedPlayers.includes(playerName)) {
      // Deselect
      setSelectedPlayers(selectedPlayers.filter(p => p !== playerName));
    } else if (selectedPlayers.length < 2) {
      // Select (max 2)
      setSelectedPlayers([...selectedPlayers, playerName]);
    }
  };

  const handleConfirm = () => {
    if (selectedPlayers.length === 2) {
      onConfirm(selectedPlayers as [string, string]);
    }
  };

  const timingText = timing === 'before_discussion'
    ? '白天讨论开始前'
    : '投票献祭后';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <Card className="w-full max-w-4xl max-h-[80vh] overflow-y-auto border-2 border-amber-500/50 bg-slate-900/95 shadow-2xl">
        <CardHeader className="border-b border-amber-500/30 bg-gradient-to-r from-slate-900 via-amber-900/20 to-slate-900">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Users className="w-8 h-8 text-amber-400" />
            <div>
              <div className="text-amber-100">密会选择</div>
              <div className="text-sm text-amber-300/70 font-normal mt-1">
                {timingText} · 选择两位旅者进行私密会谈
              </div>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Instructions */}
          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <p className="text-sm text-amber-100/90 leading-relaxed">
              密会中的对话只会存在于这两位旅者的记忆中，其他人无法得知谈话内容。
              选择两位存活的旅者，他们将在暗中进行一次私密的交流。
            </p>
          </div>

          {/* Selection Info */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              已选择：{selectedPlayers.length} / 2
            </div>
            {selectedPlayers.length > 0 && (
              <div className="flex gap-2">
                {selectedPlayers.map(name => (
                  <Badge key={name} className="bg-amber-500/30 text-amber-100 border-amber-500/50">
                    {name}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Player Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {alivePlayers.map(player => {
              const isSelected = selectedPlayers.includes(player.name);
              const canSelect = !isSelected && selectedPlayers.length < 2;
              const RoleIcon = roleIconComponents[player.role];
              const roleInfo = roleNames[player.role];
              const roleColor = roleColors[player.role];

              return (
                <button
                  key={player.id}
                  onClick={() => handlePlayerClick(player.name)}
                  disabled={!isSelected && !canSelect}
                  className={cn(
                    'relative p-4 rounded-lg border-2 transition-all duration-200',
                    'hover:shadow-lg hover:scale-105',
                    isSelected
                      ? 'border-amber-500 bg-amber-500/20 shadow-amber-500/50'
                      : canSelect
                      ? 'border-slate-600 bg-slate-800/50 hover:border-amber-400/50'
                      : 'border-slate-700 bg-slate-800/30 opacity-50 cursor-not-allowed',
                  )}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}

                  <div className="space-y-2">
                    {/* Player Name */}
                    <div className="font-bold text-foreground text-center">
                      {player.name}
                    </div>

                    {/* Role Info */}
                    <div className={cn(
                      'flex items-center justify-center gap-2 py-2 px-3 rounded border',
                      roleColor
                    )}>
                      {RoleIcon && <RoleIcon className="w-4 h-4" />}
                      <div className="text-xs font-semibold font-cinzel">
                        {roleInfo?.name}
                      </div>
                    </div>

                    {/* Role Subtitle */}
                    <div className="text-[10px] text-center text-muted-foreground font-serif italic">
                      {roleInfo?.subtitle}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Buttons */}
          <div className="pt-4">
            <Button
              onClick={handleConfirm}
              disabled={selectedPlayers.length !== 2}
              className={cn(
                'w-full',
                selectedPlayers.length === 2
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : 'bg-slate-700 text-slate-400 cursor-not-allowed',
              )}
            >
              确认密会
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
