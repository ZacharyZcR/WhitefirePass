/**
 * Message flow component - displays game conversation
 */

'use client';

import { useEffect, useRef } from 'react';
import type { Message } from '@/types/game';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Brain,
  MessageSquare,
  Vote,
  Skull,
  Activity,
  FileText,
  AlertCircle
} from 'lucide-react';

interface MessageFlowProps {
  messages: Message[];
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

export function MessageFlow({ messages }: MessageFlowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div ref={scrollRef} className="h-full w-full overflow-y-auto p-4 space-y-3">
      {messages.length === 0 ? (
        <div className="flex h-full items-center justify-center text-muted-foreground">
          <p>暂无消息。开始游戏后将显示游戏进程！</p>
        </div>
      ) : (
        messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'rounded-lg p-3 shadow-md',
              messageStyles[message.type] || 'bg-card',
            )}
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {getMessageIcon(message.type)}
                <span className="font-bold text-sm text-foreground">
                  {message.from}
                </span>
                {message.type !== 'system' && (
                  <Badge
                    variant="outline"
                    className="text-xs flex items-center gap-1"
                  >
                    {messageTypeNames[message.type] || message.type}
                  </Badge>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {formatTime(message.timestamp)}
              </span>
            </div>
            <div className={cn(
              "text-sm leading-relaxed",
              message.type === 'thinking' ? 'text-emerald-400' : 'text-foreground'
            )}>
              {message.type === 'prompt' ? (
                <pre className="whitespace-pre-wrap font-mono text-xs bg-secondary/50 text-cyan-400 p-3 rounded overflow-x-auto border border-cyan-500/30">
                  {message.content}
                </pre>
              ) : message.type === 'thinking' ? (
                <div className="pl-3 border-l-2 border-emerald-500/50 flex items-start gap-2">
                  <Brain className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{message.content}</span>
                </div>
              ) : (
                message.content
              )}
            </div>
            {message.phase && message.round && (
              <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
                第 {message.round} 回合 • {phaseNames[message.phase] || message.phase}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
