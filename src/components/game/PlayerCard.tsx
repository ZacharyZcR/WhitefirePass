/**
 * Player card component
 */

import type { Player } from '@/types/game';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PlayerCardProps {
  player: Player;
  showRole?: boolean;
}

/**
 * Role color mapping
 */
const roleColors: Record<string, string> = {
  werewolf: 'bg-red-600 hover:bg-red-700',
  villager: 'bg-blue-600 hover:bg-blue-700',
  seer: 'bg-purple-600 hover:bg-purple-700',
  witch: 'bg-green-600 hover:bg-green-700',
  hunter: 'bg-orange-600 hover:bg-orange-700',
};

/**
 * Role icons
 */
const roleIcons: Record<string, string> = {
  werewolf: '🐺',
  villager: '👤',
  seer: '🔮',
  witch: '🧙',
  hunter: '🏹',
};

/**
 * Role names in Chinese
 */
const roleNames: Record<string, string> = {
  werewolf: '狼人',
  villager: '村民',
  seer: '预言家',
  witch: '女巫',
  hunter: '猎人',
};

export function PlayerCard({ player, showRole = false }: PlayerCardProps) {
  return (
    <Card
      className={cn(
        'transition-all duration-300',
        player.isAlive
          ? 'border-2 hover:shadow-lg'
          : 'opacity-50 grayscale border-gray-400',
      )}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center gap-2">
            {showRole && roleIcons[player.role]}
            {player.name}
          </span>
          {!player.isAlive && (
            <Badge variant="destructive" className="text-xs">
              💀 已死亡
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {showRole && (
          <Badge className={cn('w-full justify-center', roleColors[player.role])}>
            {roleNames[player.role]}
          </Badge>
        )}
        <div className="text-xs text-muted-foreground text-center">
          {player.isAI ? '🤖 AI 玩家' : '👨 人类玩家'}
        </div>
      </CardContent>
    </Card>
  );
}
