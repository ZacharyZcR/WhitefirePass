/**
 * Message flow component - displays game conversation
 */

'use client';

import { useEffect, useRef } from 'react';
import type { Message } from '@/types/game';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface MessageFlowProps {
  messages: Message[];
}

/**
 * Message type styling
 */
const messageStyles: Record<string, string> = {
  system: 'bg-gray-100 border-l-4 border-gray-500',
  speech: 'bg-blue-50 border-l-4 border-blue-500',
  vote: 'bg-orange-50 border-l-4 border-orange-500',
  death: 'bg-red-50 border-l-4 border-red-500',
  action: 'bg-purple-50 border-l-4 border-purple-500',
  prompt: 'bg-yellow-50 border-l-4 border-yellow-500',
  thinking: 'bg-green-50 border-l-4 border-green-500',
};

/**
 * Message type names in Chinese
 */
const messageTypeNames: Record<string, string> = {
  system: '系统',
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

export function MessageFlow({ messages }: MessageFlowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <ScrollArea className="h-full w-full rounded-lg border bg-white">
      <div ref={scrollRef} className="space-y-2 p-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <p>暂无消息。开始游戏后将显示游戏进程！</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'rounded-lg p-3 transition-all',
                messageStyles[message.type] || 'bg-gray-50',
              )}
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">
                    {message.from}
                  </span>
                  {message.type !== 'system' && (
                    <Badge variant="outline" className="text-xs">
                      {messageTypeNames[message.type] || message.type}
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatTime(message.timestamp)}
                </span>
              </div>
              <div className="text-sm leading-relaxed">
                {message.type === 'prompt' ? (
                  <pre className="whitespace-pre-wrap font-mono text-xs bg-gray-900 text-green-400 p-3 rounded overflow-x-auto">
                    {message.content}
                  </pre>
                ) : (
                  message.content
                )}
              </div>
              {message.phase && message.round && (
                <div className="mt-1 text-xs text-muted-foreground">
                  第 {message.round} 回合 • {phaseNames[message.phase] || message.phase}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  );
}
