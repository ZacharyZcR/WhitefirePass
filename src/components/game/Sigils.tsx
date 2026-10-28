/**
 * 手绘风格的 SVG 小纹样：身份纹章、座次徽记、装饰分隔线。
 * 线条用 currentColor，颜色由外层的 text-* 或 style.color 决定。
 */

import { cn } from '@/lib/utils';
import type { Role } from '@/types/game';

const STROKE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.4,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

// 每种身份一枚纹章：烙印（火焰）、背誓（断环）、聆心（声纹）、食灰（灰瓮）、共誓（双环）、设闩（门闩）、无知（空白的羔羊之环）
const ROLE_PATHS: Record<Role, React.ReactNode> = {
  marked: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6.5c1.8 2.2 3.6 3.9 3.6 6.4a3.6 3.6 0 0 1-7.2 0c0-1.3.6-2.2 1.4-3 .2 1 .8 1.7 1.6 2 0-2.1-.4-3.6.6-5.4Z" />
    </>
  ),
  heretic: (
    <>
      <path d="M17.7 5.6A9 9 0 0 1 12 21a9 9 0 0 1-6.4-15.3" />
      <path d="M9 4.2 12 3l3 1.2" />
      <path d="M8 12h8M12 8v8" opacity="0.5" />
      <path d="M7 17 17 7" />
    </>
  ),
  listener: (
    <>
      <circle cx="12" cy="12" r="1.6" />
      <path d="M8.6 8.6a4.8 4.8 0 0 0 0 6.8M15.4 8.6a4.8 4.8 0 0 1 0 6.8" />
      <path d="M5.8 5.8a8.8 8.8 0 0 0 0 12.4M18.2 5.8a8.8 8.8 0 0 1 0 12.4" />
    </>
  ),
  coroner: (
    <>
      <path d="M9 4h6M10 4v2.5C7.6 7.6 6.5 10 6.5 12.5c0 3.6 2.4 6.5 5.5 6.5s5.5-2.9 5.5-6.5c0-2.5-1.1-4.9-3.5-6V4" />
      <path d="M8 21h8" />
      <path d="M10 12.5h4M9.3 15h5.4" opacity="0.6" />
    </>
  ),
  twin: (
    <>
      <circle cx="9" cy="12" r="5.5" />
      <circle cx="15" cy="12" r="5.5" />
    </>
  ),
  guard: (
    <>
      <rect x="5" y="3.5" width="14" height="17" rx="1" />
      <path d="M3 12h18" />
      <path d="M8 10.5v3M16 10.5v3" />
      <circle cx="12" cy="16.5" r="0.8" />
    </>
  ),
  innocent: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" opacity="0.5" />
    </>
  ),
};

export function RoleSigil({
  role,
  className,
}: {
  role: Role;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn('h-5 w-5', className)}
      {...STROKE}
      aria-hidden
    >
      {ROLE_PATHS[role]}
    </svg>
  );
}

/** 座次徽记：带刻纹的黄铜小圆章，中间是罗马数字 */
export function SeatMedallion({
  numeral,
  className,
}: {
  numeral: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'relative inline-flex h-8 w-8 items-center justify-center',
        className
      )}
    >
      <svg
        viewBox="0 0 32 32"
        className="absolute inset-0 h-full w-full text-brass"
        aria-hidden
      >
        <circle
          cx="16"
          cy="16"
          r="14.5"
          fill="rgba(10,13,18,0.85)"
          stroke="currentColor"
          strokeWidth="1"
        />
        <circle
          cx="16"
          cy="16"
          r="11.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          strokeDasharray="1.2 1.6"
          opacity="0.7"
        />
      </svg>
      <span className="relative font-cinzel text-[9px] tracking-wider text-brass-light">
        {numeral}
      </span>
    </span>
  );
}

/** 装饰分隔线：两侧渐隐的细线，中间一枚菱形 */
export function OrnamentRule({ className }: { className?: string }) {
  return (
    <div
      className={cn('flex items-center gap-2 text-brass/60', className)}
      aria-hidden
    >
      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-brass/40" />
      <svg viewBox="0 0 24 8" className="h-2 w-6">
        <path d="M0 4h8M16 4h8" stroke="currentColor" strokeWidth="0.8" />
        <path d="M12 0.5 15.5 4 12 7.5 8.5 4Z" fill="currentColor" />
      </svg>
      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-brass/40" />
    </div>
  );
}

/** 画框四角的卷草纹 */
export function FrameFlourish({ className }: { className?: string }) {
  const corner = 'M2 18V6a4 4 0 0 1 4-4h12M6 14V9a3 3 0 0 1 3-3h5';
  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 text-brass/70',
        className
      )}
      aria-hidden
    >
      {(
        [
          'left-1 top-1',
          'right-1 top-1 rotate-90',
          'right-1 bottom-1 rotate-180',
          'left-1 bottom-1 -rotate-90',
        ] as const
      ).map((pos) => (
        <svg
          key={pos}
          viewBox="0 0 20 20"
          className={cn('absolute h-6 w-6', pos)}
        >
          <path d={corner} fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="4" cy="4" r="1" fill="currentColor" />
        </svg>
      ))}
    </div>
  );
}
