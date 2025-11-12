/**
 * Message filter component - allows filtering messages by faction, role, and player
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Filter, X } from 'lucide-react';
import type { Player, Message } from '@/types/game';

interface MessageFilterProps {
  messages: Message[];
  players: Player[];
  onFilterChange: (filteredMessages: Message[]) => void;
}

/**
 * Role names mapping
 */
const roleNames: Record<string, string> = {
  marked: '烙印者',
  heretic: '背誓者',
  listener: '聆心者',
  coroner: '食灰者',
  twin: '共誓者',
  guard: '设闩者',
  innocent: '无知者',
};

/**
 * Message type names mapping
 */
const messageTypeNames: Record<string, string> = {
  system: '系统消息',
  speech: '发言',
  thinking: '内心独白',
  prompt: '神谕指引',
  vote: '投票',
  death: '死亡',
  action: '行动',
  secret: '密会',
};

/**
 * Get player faction
 */
function getPlayerFaction(role: string): 'harvest' | 'lamb' {
  return role === 'marked' || role === 'heretic' ? 'harvest' : 'lamb';
}

export function MessageFilter({ messages, players, onFilterChange }: MessageFilterProps) {
  const [selectedFactions, setSelectedFactions] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [selectedMessageTypes, setSelectedMessageTypes] = useState<string[]>([]);

  // Get unique roles from players
  const uniqueRoles = Array.from(new Set(players.map(p => p.role)));

  // Apply filters
  const applyFilters = (
    factions: string[],
    roles: string[],
    playerNames: string[],
    messageTypes: string[]
  ) => {
    let filtered = messages;

    // Filter by message type if specified
    if (messageTypes.length > 0) {
      filtered = filtered.filter(msg => messageTypes.includes(msg.type));
    } else {
      // Default: show all game-relevant messages
      filtered = filtered.filter(msg =>
        ['system', 'speech', 'death', 'action', 'secret', 'thinking', 'prompt', 'vote'].includes(msg.type)
      );
    }

    // If any filters are active
    if (factions.length > 0 || roles.length > 0 || playerNames.length > 0) {
      filtered = filtered.filter(msg => {
        // System messages always pass
        if (msg.type === 'system' || msg.type === 'death') {
          return true;
        }

        // Find the player who sent this message
        // For prompt messages, from is "PlayerName (神谕)", so strip the suffix
        const playerName = msg.from.replace(/\s*\(神谕\)\s*$/, '');
        const player = players.find(p => p.name === playerName);
        if (!player) {
          return true; // Keep narrator messages
        }

        // Check faction filter
        if (factions.length > 0) {
          const playerFaction = getPlayerFaction(player.role);
          if (!factions.includes(playerFaction)) {
            return false;
          }
        }

        // Check role filter
        if (roles.length > 0) {
          if (!roles.includes(player.role)) {
            return false;
          }
        }

        // Check player filter
        if (playerNames.length > 0) {
          if (!playerNames.includes(player.name)) {
            return false;
          }
        }

        return true;
      });
    }

    onFilterChange(filtered);
  };

  // Toggle faction filter
  const toggleFaction = (faction: string) => {
    const newFactions = selectedFactions.includes(faction)
      ? selectedFactions.filter(f => f !== faction)
      : [...selectedFactions, faction];
    setSelectedFactions(newFactions);
    applyFilters(newFactions, selectedRoles, selectedPlayers, selectedMessageTypes);
  };

  // Toggle role filter
  const toggleRole = (role: string) => {
    const newRoles = selectedRoles.includes(role)
      ? selectedRoles.filter(r => r !== role)
      : [...selectedRoles, role];
    setSelectedRoles(newRoles);
    applyFilters(selectedFactions, newRoles, selectedPlayers, selectedMessageTypes);
  };

  // Toggle player filter
  const togglePlayer = (playerName: string) => {
    const newPlayers = selectedPlayers.includes(playerName)
      ? selectedPlayers.filter(p => p !== playerName)
      : [...selectedPlayers, playerName];
    setSelectedPlayers(newPlayers);
    applyFilters(selectedFactions, selectedRoles, newPlayers, selectedMessageTypes);
  };

  // Toggle message type filter
  const toggleMessageType = (messageType: string) => {
    const newMessageTypes = selectedMessageTypes.includes(messageType)
      ? selectedMessageTypes.filter(t => t !== messageType)
      : [...selectedMessageTypes, messageType];
    setSelectedMessageTypes(newMessageTypes);
    applyFilters(selectedFactions, selectedRoles, selectedPlayers, newMessageTypes);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedFactions([]);
    setSelectedRoles([]);
    setSelectedPlayers([]);
    setSelectedMessageTypes([]);
    applyFilters([], [], [], []);
  };

  const hasActiveFilters = selectedFactions.length > 0 || selectedRoles.length > 0 || selectedPlayers.length > 0 || selectedMessageTypes.length > 0;

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b bg-background/50">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="w-4 h-4" />
            过滤器
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                {selectedFactions.length + selectedRoles.length + selectedPlayers.length + selectedMessageTypes.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">消息过滤器</h4>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-auto p-1">
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Faction Filter */}
            <div className="space-y-2">
              <div className="text-sm font-medium">按阵营</div>
              <div className="space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <Checkbox
                    checked={selectedFactions.includes('harvest')}
                    onCheckedChange={() => toggleFaction('harvest')}
                  />
                  <span className="text-sm">收割阵营</span>
                  <Badge className="bg-red-600 text-xs">
                    {players.filter(p => getPlayerFaction(p.role) === 'harvest' && p.isAlive).length}
                  </Badge>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <Checkbox
                    checked={selectedFactions.includes('lamb')}
                    onCheckedChange={() => toggleFaction('lamb')}
                  />
                  <span className="text-sm">羔羊阵营</span>
                  <Badge className="bg-blue-600 text-xs">
                    {players.filter(p => getPlayerFaction(p.role) === 'lamb' && p.isAlive).length}
                  </Badge>
                </label>
              </div>
            </div>

            {/* Role Filter */}
            <div className="space-y-2">
              <div className="text-sm font-medium">按职业</div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {uniqueRoles.map(role => {
                  const count = players.filter(p => p.role === role && p.isAlive).length;
                  return (
                    <label key={role} className="flex items-center space-x-2 cursor-pointer">
                      <Checkbox
                        checked={selectedRoles.includes(role)}
                        onCheckedChange={() => toggleRole(role)}
                      />
                      <span className="text-sm">{roleNames[role] || role}</span>
                      <Badge variant="outline" className="text-xs">
                        {count}
                      </Badge>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Player Filter */}
            <div className="space-y-2">
              <div className="text-sm font-medium">按角色</div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {players.map(player => (
                  <label key={player.id} className="flex items-center space-x-2 cursor-pointer">
                    <Checkbox
                      checked={selectedPlayers.includes(player.name)}
                      onCheckedChange={() => togglePlayer(player.name)}
                    />
                    <span className={`text-sm ${!player.isAlive ? 'line-through opacity-50' : ''}`}>
                      {player.name}
                    </span>
                    {!player.isAlive && (
                      <Badge variant="destructive" className="text-xs">
                        已死亡
                      </Badge>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Message Type Filter */}
            <div className="space-y-2">
              <div className="text-sm font-medium">按消息类型</div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {Object.entries(messageTypeNames).map(([type, label]) => (
                  <label key={type} className="flex items-center space-x-2 cursor-pointer">
                    <Checkbox
                      checked={selectedMessageTypes.includes(type)}
                      onCheckedChange={() => toggleMessageType(type)}
                    />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Active filters display */}
      {hasActiveFilters && (
        <div className="flex items-center gap-1 flex-wrap">
          {selectedFactions.map(faction => (
            <Badge key={faction} variant="secondary" className="gap-1">
              {faction === 'harvest' ? '收割阵营' : '羔羊阵营'}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => toggleFaction(faction)}
              />
            </Badge>
          ))}
          {selectedRoles.map(role => (
            <Badge key={role} variant="secondary" className="gap-1">
              {roleNames[role] || role}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => toggleRole(role)}
              />
            </Badge>
          ))}
          {selectedPlayers.map(playerName => (
            <Badge key={playerName} variant="secondary" className="gap-1">
              {playerName}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => togglePlayer(playerName)}
              />
            </Badge>
          ))}
          {selectedMessageTypes.map(type => (
            <Badge key={type} variant="secondary" className="gap-1">
              {messageTypeNames[type] || type}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => toggleMessageType(type)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
