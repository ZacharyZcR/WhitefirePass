/**
 * Message flow component - displays game conversation
 */

'use client';

import { useEffect, useRef } from 'react';
import type { Message, Player } from '@/types/game';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Brain,
  MessageSquare,
  Vote,
  Skull,
  Activity,
  FileText,
  AlertCircle,
} from 'lucide-react';

interface MessageFlowProps {
  messages: Message[];
  players?: Player[];  // Optional players list to show roles
  filterTypes?: string[];  // Optional filter for message types
}

/**
 * Message type styling - Stone theme with semantic colors and accent borders
 */
const messageStyles: Record<string, string> = {
  system: 'bg-muted/50 border-l-4 border-yellow-500',
  speech: 'bg-card border-l-4 border-blue-500',
  vote: 'bg-card border-l-4 border-orange-500',
  death: 'bg-card border-l-4 border-red-500',
  action: 'bg-card border-l-4 border-purple-500',
  prompt: 'bg-secondary border-l-4 border-cyan-500',
  thinking: 'bg-accent/30 border-l-4 border-emerald-500 italic',
};

/**
 * Message type names in Chinese
 */
const messageTypeNames: Record<string, string> = {
  system: '旁白',
  speech: '发言',
  vote: '投票',
  death: '死亡',
  action: '行动',
  prompt: 'AI提示词',
  thinking: 'AI思考',
};

/**
 * Phase names in Chinese
 */
const phaseNames: Record<string, string> = {
  setup: '准备',
  night: '夜晚',
  day: '白天',
  voting: '投票',
  end: '结束',
};

/**
 * Format timestamp
 */
function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Get icon for message type
 */
function getMessageIcon(type: string) {
  switch (type) {
    case 'system':
      return <AlertCircle className="w-4 h-4" />;
    case 'speech':
      return <MessageSquare className="w-4 h-4" />;
    case 'vote':
      return <Vote className="w-4 h-4" />;
    case 'death':
      return <Skull className="w-4 h-4" />;
    case 'action':
      return <Activity className="w-4 h-4" />;
    case 'prompt':
      return <FileText className="w-4 h-4" />;
    case 'thinking':
      return <Brain className="w-4 h-4" />;
    default:
      return <MessageSquare className="w-4 h-4" />;
  }
}

/**
 * Render message content based on type
 */
function renderMessageContent(message: Message) {
  if (message.type === 'prompt') {
    return (
      <pre className="whitespace-pre-wrap font-mono text-xs bg-secondary/50 text-cyan-400 p-3 rounded overflow-x-auto border border-cyan-500/30">
        {message.content}
      </pre>
    );
  }

  if (message.type === 'thinking') {
    return (
      <div className="pl-3 border-l-2 border-emerald-500/50 flex items-start gap-2">
        <Brain className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <span>{message.content}</span>
      </div>
    );
  }

  return message.content;
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
 * Render message badges
 */
function MessageBadges({ message, messageTypeName, playerRole }: {
  message: Message;
  messageTypeName: string;
  playerRole?: string;
}) {
  return (
    <>
      {message.type !== 'system' && (
        <>
          <Badge variant="outline" className="text-xs flex items-center gap-1">
            {messageTypeName}
          </Badge>
          {playerRole && (
            <Badge variant="secondary" className="text-xs">
              {roleNames[playerRole]?.name || playerRole}
            </Badge>
          )}
        </>
      )}
    </>
  );
}

/**
 * Individual message item component
 */
function MessageItem({ message, index, players }: {
  message: Message;
  index: number;
  players?: Player[];
}) {
  const messageStyle = messageStyles[message.type] ?? 'bg-card';
  const messageTypeName = messageTypeNames[message.type] ?? message.type;
  const phaseName = message.phase ? (phaseNames[message.phase] ?? message.phase) : '';
  const contentColor = message.type === 'thinking' ? 'text-emerald-400' : 'text-foreground';
  const showPhaseInfo = Boolean(message.phase && message.round);

  // Find player role (for user to see, doesn't affect game logic)
  const playerRole = players?.find(p => p.name === message.from)?.role;

  return (
    <div
      className={cn(
        'rounded-lg p-3 shadow-md animate-in fade-in slide-in-from-bottom-4 duration-500',
        messageStyle,
      )}
      style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {getMessageIcon(message.type)}
          <span className="font-bold text-sm text-foreground">
            {message.from}
          </span>
          <MessageBadges message={message} messageTypeName={messageTypeName} playerRole={playerRole} />
        </div>
        <span className="text-xs text-muted-foreground">
          {formatTime(message.timestamp)}
        </span>
      </div>

      <div className={cn("text-sm leading-relaxed", contentColor)}>
        {renderMessageContent(message)}
      </div>

      {showPhaseInfo && (
        <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
          第 {message.round} 回合 • {phaseName}
        </div>
      )}
    </div>
  );
}

export function MessageFlow({ messages, players, filterTypes }: MessageFlowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Filter messages if filterTypes is provided
  const filteredMessages = filterTypes
    ? messages.filter((msg) => filterTypes.includes(msg.type))
    : messages;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [filteredMessages]);

  return (
    <div ref={scrollRef} className="h-full w-full overflow-y-auto p-4 space-y-3">
      {filteredMessages.length === 0 ? (
        <div className="flex h-full items-center justify-center text-muted-foreground">
          <p>暂无消息。开始游戏后将显示游戏进程！</p>
        </div>
      ) : (
        filteredMessages.map((message, idx) => (
          <MessageItem key={message.id} message={message} index={idx} players={players} />
        ))
      )}
    </div>
  );
}
