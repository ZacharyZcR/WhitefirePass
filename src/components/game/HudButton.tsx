/**
 * Small round brass HUD button with tooltip and optional count badge.
 */

'use client';

import { forwardRef } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface HudButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  label: string;
  badge?: number;
  active?: boolean;
}

export const HudButton = forwardRef<HTMLButtonElement, HudButtonProps>(
  ({ icon: Icon, label, badge, active, className, ...props }, ref) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          ref={ref}
          type="button"
          aria-label={label}
          className={cn(
            'relative flex h-9 w-9 items-center justify-center rounded-full border text-brass transition-all',
            'border-brass/30 bg-ink-800/60 hover:border-brass/70 hover:bg-ink-700 hover:text-brass-light',
            active && 'border-brass-light/80 text-brass-light shadow-[0_0_12px_rgba(220,192,138,0.25)]',
            className,
          )}
          {...props}
        >
          <Icon className="h-4 w-4" strokeWidth={1.5} />
          {Boolean(badge) && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full border border-ink bg-seal px-1 font-serif text-[9px] text-parchment">
              {badge}
            </span>
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  ),
);
HudButton.displayName = 'HudButton';
