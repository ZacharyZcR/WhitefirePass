/**
 * Tarot Card Component - 1913 Vintage Style
 * Ornate card design for player/traveler details
 */

'use client';

import { cn } from '@/lib/utils';
import type { Player } from '@/types/game';

interface TarotCardProps {
  player: Player;
  className?: string;
  isFlipped?: boolean;
}

/**
 * Ornate border pattern - SVG decorative elements
 */
function CardBorder() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 200 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer border */}
      <rect
        x="5"
        y="5"
        width="190"
        height="310"
        stroke="currentColor"
        strokeWidth="1"
        className="text-amber-600/80"
      />
      <rect
        x="8"
        y="8"
        width="184"
        height="304"
        stroke="currentColor"
        strokeWidth="0.5"
        className="text-amber-500/60"
      />

      {/* Corner ornaments - Top Left */}
      <g className="text-amber-600">
        <path
          d="M15 15 L15 35 M15 15 L35 15"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="15" cy="15" r="3" fill="currentColor" />
        <path
          d="M20 20 Q25 15 30 20 T40 20"
          stroke="currentColor"
          strokeWidth="0.8"
          fill="none"
        />
        <path
          d="M20 20 Q15 25 20 30 T20 40"
          stroke="currentColor"
          strokeWidth="0.8"
          fill="none"
        />
      </g>

      {/* Corner ornaments - Top Right */}
      <g className="text-amber-600">
        <path
          d="M185 15 L185 35 M185 15 L165 15"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="185" cy="15" r="3" fill="currentColor" />
        <path
          d="M180 20 Q175 15 170 20 T160 20"
          stroke="currentColor"
          strokeWidth="0.8"
          fill="none"
        />
        <path
          d="M180 20 Q185 25 180 30 T180 40"
          stroke="currentColor"
          strokeWidth="0.8"
          fill="none"
        />
      </g>

      {/* Corner ornaments - Bottom Left */}
      <g className="text-amber-600">
        <path
          d="M15 305 L15 285 M15 305 L35 305"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="15" cy="305" r="3" fill="currentColor" />
        <path
          d="M20 300 Q25 305 30 300 T40 300"
          stroke="currentColor"
          strokeWidth="0.8"
          fill="none"
        />
        <path
          d="M20 300 Q15 295 20 290 T20 280"
          stroke="currentColor"
          strokeWidth="0.8"
          fill="none"
        />
      </g>

      {/* Corner ornaments - Bottom Right */}
      <g className="text-amber-600">
        <path
          d="M185 305 L185 285 M185 305 L165 305"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="185" cy="305" r="3" fill="currentColor" />
        <path
          d="M180 300 Q175 305 170 300 T160 300"
          stroke="currentColor"
          strokeWidth="0.8"
          fill="none"
        />
        <path
          d="M180 300 Q185 295 180 290 T180 280"
          stroke="currentColor"
          strokeWidth="0.8"
          fill="none"
        />
      </g>

      {/* Top center ornament */}
      <g className="text-amber-600">
        <path
          d="M100 15 Q90 20 100 25 Q110 20 100 15 Z"
          fill="currentColor"
          opacity="0.6"
        />
        <circle cx="100" cy="20" r="2" fill="currentColor" />
        <path
          d="M85 18 Q100 12 115 18"
          stroke="currentColor"
          strokeWidth="0.6"
          fill="none"
        />
      </g>

      {/* Bottom center ornament */}
      <g className="text-amber-600">
        <path
          d="M100 305 Q90 300 100 295 Q110 300 100 305 Z"
          fill="currentColor"
          opacity="0.6"
        />
        <circle cx="100" cy="300" r="2" fill="currentColor" />
        <path
          d="M85 302 Q100 308 115 302"
          stroke="currentColor"
          strokeWidth="0.6"
          fill="none"
        />
      </g>

      {/* Decorative side patterns */}
      <g className="text-amber-500/40">
        {/* Left side flourishes */}
        <path
          d="M12 80 Q18 85 12 90 M12 100 Q18 105 12 110 M12 120 Q18 125 12 130"
          stroke="currentColor"
          strokeWidth="0.5"
          fill="none"
        />
        <path
          d="M12 190 Q18 195 12 200 M12 210 Q18 215 12 220 M12 230 Q18 235 12 240"
          stroke="currentColor"
          strokeWidth="0.5"
          fill="none"
        />

        {/* Right side flourishes */}
        <path
          d="M188 80 Q182 85 188 90 M188 100 Q182 105 188 110 M188 120 Q182 125 188 130"
          stroke="currentColor"
          strokeWidth="0.5"
          fill="none"
        />
        <path
          d="M188 190 Q182 195 188 200 M188 210 Q182 215 188 220 M188 230 Q182 235 188 240"
          stroke="currentColor"
          strokeWidth="0.5"
          fill="none"
        />
      </g>
    </svg>
  );
}

/**
 * Role names in English for card backs
 */
const ROLE_ENGLISH_NAMES: Record<string, string> = {
  marked: 'THE MARKED',
  heretic: 'THE HERETIC',
  listener: 'THE LISTENER',
  coroner: 'ASH-WALKER',
  twin: 'THE TWIN',
  guard: 'GUARDIAN',
  innocent: 'THE INNOCENT',
};

/**
 * Card back pattern - role-specific designs
 */
function CardBackPattern({ role }: { role: string }) {
  const englishName = ROLE_ENGLISH_NAMES[role] || 'TRAVELER';
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 200 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background texture */}
      <defs>
        <pattern id="dots" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
          <circle cx="5" cy="5" r="0.5" fill="currentColor" className="text-amber-900/20" />
        </pattern>
        <pattern id="lines" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="10" x2="20" y2="10" stroke="currentColor" strokeWidth="0.3" className="text-amber-800/15" />
        </pattern>
      </defs>

      <rect width="200" height="320" fill="url(#dots)" />
      <rect width="200" height="320" fill="url(#lines)" />

      {/* Role-specific central design */}
      <RoleCenterPattern role={role} />

      {/* Corner flourishes */}
      <g className="text-amber-700/40">
        {/* Top corners */}
        <path d="M30 40 Q40 30 50 40 T70 40" stroke="currentColor" strokeWidth="1" fill="none" />
        <path d="M170 40 Q160 30 150 40 T130 40" stroke="currentColor" strokeWidth="1" fill="none" />

        {/* Bottom corners */}
        <path d="M30 280 Q40 290 50 280 T70 280" stroke="currentColor" strokeWidth="1" fill="none" />
        <path d="M170 280 Q160 290 150 280 T130 280" stroke="currentColor" strokeWidth="1" fill="none" />
      </g>

      {/* Role name at top - Gothic font */}
      <text
        x="100"
        y="65"
        textAnchor="middle"
        className="font-cinzel tracking-widest fill-amber-600"
        fontSize="10"
        fontWeight="600"
        letterSpacing="2"
      >
        {englishName}
      </text>

      {/* Decorative line under name */}
      <line
        x1="40"
        y1="72"
        x2="160"
        y2="72"
        stroke="currentColor"
        strokeWidth="0.5"
        className="text-amber-700/60"
      />
    </svg>
  );
}

/**
 * Role-specific center patterns
 */
function RoleCenterPattern({ role }: { role: string }) {
  const centerY = 160;

  // Marked - Flame symbol
  if (role === 'marked') {
    return (
      <g className="text-red-700" transform={`translate(100, ${centerY})`}>
        <circle r="55" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
        {/* Flame shape */}
        <path
          d="M0,-40 Q-15,-20 -10,0 Q-5,10 0,20 Q5,10 10,0 Q15,-20 0,-40 Z"
          fill="currentColor"
          opacity="0.4"
        />
        <path
          d="M0,-30 Q-8,-15 -5,0 Q-2,8 0,15 Q2,8 5,0 Q8,-15 0,-30 Z"
          fill="currentColor"
          opacity="0.6"
        />
        {/* Radiating lines */}
        {[...Array(8)].map((_, i) => {
          const angle = (i * 360) / 8;
          return (
            <line
              key={i}
              x1="0"
              y1="0"
              x2={Math.cos((angle * Math.PI) / 180) * 50}
              y2={Math.sin((angle * Math.PI) / 180) * 50}
              stroke="currentColor"
              strokeWidth="0.8"
              opacity="0.3"
            />
          );
        })}
      </g>
    );
  }

  // Heretic - Broken cross
  if (role === 'heretic') {
    return (
      <g className="text-slate-600" transform={`translate(100, ${centerY})`}>
        <circle r="55" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
        {/* Broken cross */}
        <line x1="-25" y1="0" x2="-5" y2="0" stroke="currentColor" strokeWidth="3" opacity="0.7" />
        <line x1="5" y1="0" x2="25" y2="0" stroke="currentColor" strokeWidth="3" opacity="0.7" />
        <line x1="0" y1="-25" x2="0" y2="-5" stroke="currentColor" strokeWidth="3" opacity="0.7" />
        <line x1="0" y1="5" x2="0" y2="25" stroke="currentColor" strokeWidth="3" opacity="0.7" />
        {/* Cracks */}
        <path d="M-5,-5 L5,5 M5,-5 L-5,5" stroke="currentColor" strokeWidth="1" opacity="0.5" />
        <circle r="40" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.4" strokeDasharray="5,5" />
      </g>
    );
  }

  // Listener - Ear/wave pattern
  if (role === 'listener') {
    return (
      <g className="text-purple-700" transform={`translate(100, ${centerY})`}>
        <circle r="55" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
        {/* Concentric waves */}
        {[15, 25, 35, 45].map((r, i) => (
          <circle
            key={i}
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            opacity={0.6 - i * 0.1}
          />
        ))}
        {/* Sound wave symbols */}
        <path
          d="M-50,0 Q-45,-10 -40,0 T-30,0"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          opacity="0.5"
        />
        <path
          d="M50,0 Q45,-10 40,0 T30,0"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          opacity="0.5"
        />
      </g>
    );
  }

  // Coroner - Skull/ash symbol
  if (role === 'coroner') {
    return (
      <g className="text-cyan-700" transform={`translate(100, ${centerY})`}>
        <circle r="55" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
        {/* Simplified skull */}
        <circle cx="0" cy="-5" r="18" fill="currentColor" opacity="0.3" />
        <circle cx="-8" cy="-8" r="4" fill="currentColor" opacity="0.6" />
        <circle cx="8" cy="-8" r="4" fill="currentColor" opacity="0.6" />
        <path
          d="M-6,5 L-3,8 L0,5 L3,8 L6,5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          opacity="0.6"
        />
        {/* Ash particles */}
        {[...Array(12)].map((_, i) => {
          const angle = (i * 360) / 12;
          const rad = (angle * Math.PI) / 180;
          const x = Math.cos(rad) * 35;
          const y = Math.sin(rad) * 35;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="1.5"
              fill="currentColor"
              opacity="0.4"
            />
          );
        })}
      </g>
    );
  }

  // Twin - Yin-yang style
  if (role === 'twin') {
    return (
      <g className="text-teal-700" transform={`translate(100, ${centerY})`}>
        <circle r="55" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
        {/* Yin-yang */}
        <circle r="40" fill="currentColor" opacity="0.2" />
        <path
          d="M0,-40 A40,40 0 0,1 0,40 A20,20 0 0,1 0,0 A20,20 0 0,0 0,-40 Z"
          fill="currentColor"
          opacity="0.4"
        />
        <circle cy="-20" r="4" fill="currentColor" opacity="0.7" />
        <circle cy="20" r="4" fill="currentColor" opacity="0.3" />
        <circle r="40" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      </g>
    );
  }

  // Guard - Shield/lock symbol
  if (role === 'guard') {
    return (
      <g className="text-amber-700" transform={`translate(100, ${centerY})`}>
        <circle r="55" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
        {/* Shield shape */}
        <path
          d="M0,-35 L25,-20 L25,10 Q25,30 0,40 Q-25,30 -25,10 L-25,-20 Z"
          fill="currentColor"
          opacity="0.3"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        {/* Lock in center */}
        <rect x="-8" y="-5" width="16" height="12" rx="2" fill="currentColor" opacity="0.6" />
        <circle cy="-10" r="8" fill="none" stroke="currentColor" strokeWidth="2.5" opacity="0.6" />
      </g>
    );
  }

  // Innocent - Simple circle
  if (role === 'innocent') {
    return (
      <g className="text-blue-700" transform={`translate(100, ${centerY})`}>
        <circle r="55" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
        {/* Simple mandala */}
        {[30, 40, 50].map((r, i) => (
          <circle
            key={i}
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            opacity={0.5 - i * 0.1}
          />
        ))}
        {/* Petals */}
        {[...Array(6)].map((_, i) => {
          const angle = (i * 360) / 6;
          return (
            <g key={i} transform={`rotate(${angle})`}>
              <circle cy="-35" r="8" fill="currentColor" opacity="0.3" />
            </g>
          );
        })}
        <circle r="12" fill="currentColor" opacity="0.4" />
      </g>
    );
  }

  // Default pattern
  return (
    <g className="text-amber-600" transform={`translate(100, ${centerY})`}>
      <circle r="55" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
      <circle r="30" fill="currentColor" opacity="0.3" />
    </g>
  );
}

/**
 * Role-specific decorative symbols
 */
function RoleSymbol({ role }: { role: string }) {
  const symbols: Record<string, string> = {
    marked: '✦', // 烙印者 - 火焰符号
    heretic: '☽', // 背誓者 - 月亮
    listener: '◈', // 聆心者 - 钻石
    coroner: '✟', // 食灰者 - 十字
    twin: '◐◑', // 共誓者 - 阴阳
    guard: '◆', // 设闩者 - 盾牌
    innocent: '○', // 无知者 - 圆
  };

  return (
    <div className="text-4xl text-amber-600/80 font-serif">
      {symbols[role] || '○'}
    </div>
  );
}

export function TarotCard({ player, className, isFlipped = false, size = 'default' }: TarotCardProps & { size?: 'small' | 'default' | 'large' }) {
  const roleNames: Record<string, { name: string; subtitle: string }> = {
    marked: { name: '烙印者', subtitle: 'The Marked' },
    heretic: { name: '背誓者', subtitle: 'The Heretic' },
    listener: { name: '聆心者', subtitle: 'The Listener' },
    coroner: { name: '食灰者', subtitle: 'Ash-Walker' },
    twin: { name: '共誓者', subtitle: 'The Twin' },
    guard: { name: '设闩者', subtitle: 'Guardian' },
    innocent: { name: '无知者', subtitle: 'The Innocent' },
  };

  const sizeClasses = {
    small: 'w-40 h-60',
    default: 'w-64 h-96',
    large: 'w-72 h-[432px]',
  };

  return (
    <div
      className={cn(
        'relative cursor-pointer transition-transform duration-500 preserve-3d',
        sizeClasses[size],
        className
      )}
      style={{
        transformStyle: 'preserve-3d',
        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
      }}
    >
      {/* Card Back */}
      <div
        className="absolute inset-0 backface-hidden rounded-lg overflow-hidden shadow-2xl"
        style={{ backfaceVisibility: 'hidden' }}
      >
        <div className="relative w-full h-full bg-gradient-to-br from-amber-900 via-amber-950 to-black">
          <CardBackPattern role={player.role} />
          <CardBorder />
        </div>
      </div>

      {/* Card Front */}
      <div
        className="absolute inset-0 backface-hidden rounded-lg overflow-hidden shadow-2xl"
        style={{
          backfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
        }}
      >
        <div className="relative w-full h-full bg-gradient-to-br from-amber-50 via-amber-100 to-amber-200">
          <CardBorder />

          {/* Card content */}
          <div className="relative z-10 flex flex-col items-center justify-between h-full p-8">
            {/* Top section - Name */}
            <div className="text-center">
              <h3 className="text-2xl font-bold text-amber-900 font-cinzel tracking-wider">
                {player.name}
              </h3>
              <div className="text-xs text-amber-700 font-serif tracking-widest mt-1 opacity-70">
                TRAVELER
              </div>
            </div>

            {/* Middle section - Role symbol */}
            <div className="flex flex-col items-center gap-4">
              <RoleSymbol role={player.role} />

              <div className="text-center">
                <div className="text-lg font-bold text-amber-900 font-cinzel">
                  {roleNames[player.role]?.name}
                </div>
                <div className="text-xs text-amber-700 font-serif tracking-widest mt-1">
                  {roleNames[player.role]?.subtitle}
                </div>
              </div>
            </div>

            {/* Bottom section - Status */}
            <div className="text-center">
              <div className={cn(
                'text-sm font-semibold font-serif tracking-wide',
                player.isAlive ? 'text-amber-800' : 'text-red-900'
              )}>
                {player.isAlive ? '存活' : '已死亡'}
              </div>
            </div>
          </div>

          {/* Decorative corner marks */}
          <div className="absolute top-4 left-4 text-xs text-amber-600/40 font-cinzel">
            {player.id.slice(-4).toUpperCase()}
          </div>
          <div className="absolute bottom-4 right-4 text-xs text-amber-600/40 font-cinzel">
            1913
          </div>
        </div>
      </div>
    </div>
  );
}
