/**
 * Gothic Design Demo Page
 * Pure SVG ornamental designs inspired by medieval manuscripts
 */

'use client';

import { useState } from 'react';
import { Mountain, Skull, Flame, Moon, Crown, Sword } from 'lucide-react';

export default function GothicDemoPage() {
  const [activeButton, setActiveButton] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Page Header */}
        <div className="text-center space-y-4 mb-16">
          <h1 className="text-5xl font-cinzel text-slate-200 tracking-wider">
            Gothic Design System
          </h1>
          <p className="text-slate-400 font-serif">
            Pure SVG ornamental borders inspired by medieval manuscripts
          </p>
        </div>

        {/* Gothic Buttons Section */}
        <section className="space-y-6">
          <h2 className="text-3xl font-cinzel text-slate-300 mb-8">Gothic Buttons</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <GothicButton
              variant="primary"
              icon={<Flame className="w-5 h-5" />}
              onClick={() => setActiveButton('primary')}
              active={activeButton === 'primary'}
            >
              Primary Action
            </GothicButton>

            <GothicButton
              variant="danger"
              icon={<Skull className="w-5 h-5" />}
              onClick={() => setActiveButton('danger')}
              active={activeButton === 'danger'}
            >
              Danger Action
            </GothicButton>

            <GothicButton
              variant="royal"
              icon={<Crown className="w-5 h-5" />}
              onClick={() => setActiveButton('royal')}
              active={activeButton === 'royal'}
            >
              Royal Action
            </GothicButton>

            <GothicButton
              variant="shadow"
              icon={<Moon className="w-5 h-5" />}
              onClick={() => setActiveButton('shadow')}
              active={activeButton === 'shadow'}
            >
              Shadow Action
            </GothicButton>

            <GothicButton
              variant="battle"
              icon={<Sword className="w-5 h-5" />}
              onClick={() => setActiveButton('battle')}
              active={activeButton === 'battle'}
            >
              Battle Action
            </GothicButton>

            <GothicButton
              variant="mountain"
              icon={<Mountain className="w-5 h-5" />}
              onClick={() => setActiveButton('mountain')}
              active={activeButton === 'mountain'}
            >
              Mountain Action
            </GothicButton>
          </div>
        </section>

        {/* Gothic Containers Section */}
        <section className="space-y-6">
          <h2 className="text-3xl font-cinzel text-slate-300 mb-8">Gothic Containers</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <GothicContainer variant="ornate">
              <div className="space-y-4">
                <h3 className="text-2xl font-cinzel text-amber-300 flex items-center gap-2">
                  <Crown className="w-6 h-6" />
                  Ornate Panel
                </h3>
                <p className="text-slate-300 font-serif leading-relaxed">
                  Hand-drawn SVG borders inspired by illuminated manuscripts from the
                  Gothic period. Features flowing acanthus leaves and intricate filigree.
                </p>
              </div>
            </GothicContainer>

            <GothicContainer variant="shadow">
              <div className="space-y-4">
                <h3 className="text-2xl font-cinzel text-purple-300 flex items-center gap-2">
                  <Moon className="w-6 h-6" />
                  Shadow Panel
                </h3>
                <p className="text-slate-300 font-serif leading-relaxed">
                  Dark variant with moonlight-inspired decorative elements.
                  Perfect for mysterious content with deep shadows and ethereal patterns.
                </p>
              </div>
            </GothicContainer>

            <GothicContainer variant="blood">
              <div className="space-y-4">
                <h3 className="text-2xl font-cinzel text-red-300 flex items-center gap-2">
                  <Flame className="w-6 h-6" />
                  Blood Panel
                </h3>
                <p className="text-slate-300 font-serif leading-relaxed">
                  Crimson-themed with flame motifs and aggressive angular ornaments.
                  Creates intensity perfect for warnings or dramatic reveals.
                </p>
              </div>
            </GothicContainer>

            <GothicContainer variant="frost">
              <div className="space-y-4">
                <h3 className="text-2xl font-cinzel text-cyan-300 flex items-center gap-2">
                  <Mountain className="w-6 h-6" />
                  Frost Panel
                </h3>
                <p className="text-slate-300 font-serif leading-relaxed">
                  Ice-inspired with crystalline patterns and cool blue tones.
                  Complements the Whitefire Pass winter landscape aesthetic.
                </p>
              </div>
            </GothicContainer>
          </div>
        </section>

        {/* Large Feature Container */}
        <section>
          <h2 className="text-3xl font-cinzel text-slate-300 mb-8">Featured Container</h2>

          <GothicContainer variant="ornate" size="large">
            <div className="space-y-6">
              <div className="text-center space-y-3">
                <Crown className="w-16 h-16 mx-auto text-amber-400" />
                <h3 className="text-4xl font-cinzel text-amber-300">
                  The Whitefire Covenant
                </h3>
                <p className="text-sm font-cinzel tracking-widest text-slate-400 uppercase">
                  A Sacred Contract Written in Snow and Ash
                </p>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

              <div className="grid md:grid-cols-2 gap-6 text-center">
                <div className="space-y-3">
                  <h4 className="text-lg font-cinzel text-slate-200">The Harvest</h4>
                  <p className="text-slate-400 font-serif text-sm leading-relaxed">
                    Three marked souls hunt beneath the moon's cold gaze.
                  </p>
                </div>
                <div className="space-y-3">
                  <h4 className="text-lg font-cinzel text-slate-200">The Lamb</h4>
                  <p className="text-slate-400 font-serif text-sm leading-relaxed">
                    Twelve travelers must expose the darkness before all hope fades.
                  </p>
                </div>
              </div>
            </div>
          </GothicContainer>
        </section>
      </div>
    </div>
  );
}

/**
 * Pure SVG Gothic Ornaments Library
 */
const GothicOrnaments = {
  // Fleur-de-lis (classic French royal symbol)
  FleurDeLis: ({ className = '', size = 24 }: { className?: string; size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      <g fill="currentColor">
        {/* Center stem */}
        <path d="M 45,85 L 45,45 Q 45,40 50,40 Q 55,40 55,45 L 55,85 Q 55,90 50,95 Q 45,90 45,85 Z" />
        {/* Center petal */}
        <path d="M 50,10 Q 40,15 40,30 Q 40,40 50,45 Q 60,40 60,30 Q 60,15 50,10 Z" />
        {/* Left petal */}
        <path d="M 20,50 Q 15,45 15,35 Q 15,25 25,25 Q 30,25 35,30 Q 38,35 35,45 Q 32,50 25,50 Q 22,50 20,50 Z" />
        {/* Right petal */}
        <path d="M 80,50 Q 85,45 85,35 Q 85,25 75,25 Q 70,25 65,30 Q 62,35 65,45 Q 68,50 75,50 Q 78,50 80,50 Z" />
        {/* Left tendril */}
        <path d="M 35,40 Q 30,42 25,40 Q 20,38 18,35 Q 16,32 18,30 Q 20,28 23,30 Q 26,32 30,35 Q 33,38 35,40 Z" />
        {/* Right tendril */}
        <path d="M 65,40 Q 70,42 75,40 Q 80,38 82,35 Q 84,32 82,30 Q 80,28 77,30 Q 74,32 70,35 Q 67,38 65,40 Z" />
        {/* Bottom decoration */}
        <ellipse cx="50" cy="90" rx="8" ry="5" />
      </g>
    </svg>
  ),

  // Corner ornament with acanthus leaf
  CornerOrnament: ({ className = '', flip = '' }: { className?: string; flip?: string }) => (
    <svg width="80" height="80" viewBox="0 0 100 100" className={`${className} ${flip}`}>
      <g fill="currentColor" opacity="0.4">
        {/* Main scroll */}
        <path d="M 10,90 Q 10,70 20,60 Q 30,50 40,50 Q 30,50 25,40 Q 20,30 20,20 Q 20,10 30,5 Q 40,0 50,10 Q 55,15 52,25 Q 50,35 40,40 Q 50,45 60,40 Q 70,35 75,30 Q 80,25 85,30 Q 90,35 85,45 Q 80,55 70,60 Q 60,65 50,65 Q 60,70 65,80 Q 70,90 60,95 Q 50,100 45,90 Q 40,80 40,70 Q 35,75 30,80 Q 25,85 20,85 Q 15,85 12,87 Q 10,89 10,90 Z" />
        {/* Detail curves */}
        <path d="M 25,45 Q 30,40 35,45 M 45,55 Q 50,50 55,55 M 35,65 Q 40,60 45,65" strokeWidth="1.5" stroke="currentColor" fill="none" />
        {/* Leaf veins */}
        <path d="M 40,25 L 42,28 M 38,30 L 40,33 M 36,35 L 38,38" strokeWidth="1" stroke="currentColor" fill="none" opacity="0.6" />
      </g>
    </svg>
  ),

  // Border vine element
  BorderVine: ({ className = '', color = 'currentColor' }: { className?: string; color?: string }) => (
    <svg width="200" height="40" viewBox="0 0 200 40" className={className} preserveAspectRatio="none">
      <defs>
        <path id="leaf" d="M 0,0 Q 3,-4 6,0 Q 3,4 0,0 Z" />
      </defs>
      <g stroke={color} fill={color} opacity="0.3">
        {/* Main vine */}
        <path
          d="M 0,20 Q 20,15 40,20 T 80,20 Q 100,15 120,20 T 160,20 Q 180,15 200,20"
          strokeWidth="2"
          fill="none"
        />
        {/* Leaves */}
        <use href="#leaf" x="20" y="20" transform="rotate(-30, 23, 20)" />
        <use href="#leaf" x="40" y="20" transform="rotate(30, 43, 20)" />
        <use href="#leaf" x="60" y="20" transform="rotate(-30, 63, 20)" />
        <use href="#leaf" x="80" y="20" transform="rotate(30, 83, 20)" />
        <use href="#leaf" x="100" y="20" transform="rotate(-30, 103, 20)" />
        <use href="#leaf" x="120" y="20" transform="rotate(30, 123, 20)" />
        <use href="#leaf" x="140" y="20" transform="rotate(-30, 143, 20)" />
        <use href="#leaf" x="160" y="20" transform="rotate(30, 163, 20)" />
        <use href="#leaf" x="180" y="20" transform="rotate(-30, 183, 20)" />
      </g>
    </svg>
  ),
};

/**
 * Gothic Button Component
 */
interface GothicButtonProps {
  children: React.ReactNode;
  variant: 'primary' | 'danger' | 'royal' | 'shadow' | 'battle' | 'mountain';
  icon?: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
}

function GothicButton({ children, variant, icon, onClick, active }: GothicButtonProps) {
  const variants = {
    primary: {
      gradient: 'from-amber-600 to-amber-800',
      border: 'border-amber-400',
      shadow: 'shadow-amber-500/50',
      glow: 'shadow-[0_0_20px_rgba(251,191,36,0.3)]',
      ornament: 'text-amber-300',
    },
    danger: {
      gradient: 'from-red-700 to-red-900',
      border: 'border-red-400',
      shadow: 'shadow-red-500/50',
      glow: 'shadow-[0_0_20px_rgba(239,68,68,0.3)]',
      ornament: 'text-red-300',
    },
    royal: {
      gradient: 'from-purple-700 to-purple-900',
      border: 'border-purple-400',
      shadow: 'shadow-purple-500/50',
      glow: 'shadow-[0_0_20px_rgba(168,85,247,0.3)]',
      ornament: 'text-purple-300',
    },
    shadow: {
      gradient: 'from-slate-700 to-slate-900',
      border: 'border-slate-400',
      shadow: 'shadow-slate-500/50',
      glow: 'shadow-[0_0_20px_rgba(148,163,184,0.3)]',
      ornament: 'text-slate-300',
    },
    battle: {
      gradient: 'from-orange-700 to-orange-900',
      border: 'border-orange-400',
      shadow: 'shadow-orange-500/50',
      glow: 'shadow-[0_0_20px_rgba(249,115,22,0.3)]',
      ornament: 'text-orange-300',
    },
    mountain: {
      gradient: 'from-cyan-700 to-cyan-900',
      border: 'border-cyan-400',
      shadow: 'shadow-cyan-500/50',
      glow: 'shadow-[0_0_20px_rgba(34,211,238,0.3)]',
      ornament: 'text-cyan-300',
    },
  };

  const v = variants[variant];

  return (
    <button
      onClick={onClick}
      className={`
        relative group
        px-8 py-4
        bg-gradient-to-br ${v.gradient}
        border-2 ${v.border}
        ${active ? `ring-4 ring-${v.border.split('-')[1]}-400/50` : ''}
        font-cinzel tracking-widest text-sm uppercase
        text-white
        transition-all duration-500
        ${v.shadow}
        hover:${v.glow}
        hover:scale-[1.02]
        overflow-visible
      `}
    >
      {/* Corner ornaments */}
      <GothicOrnaments.FleurDeLis
        className={`absolute -top-4 -left-4 ${v.ornament} transition-all duration-500 group-hover:scale-125 drop-shadow-lg`}
        size={32}
      />
      <GothicOrnaments.FleurDeLis
        className={`absolute -top-4 -right-4 ${v.ornament} transition-all duration-500 group-hover:scale-125 drop-shadow-lg`}
        size={32}
      />
      <GothicOrnaments.FleurDeLis
        className={`absolute -bottom-4 -left-4 ${v.ornament} transition-all duration-500 group-hover:scale-125 drop-shadow-lg`}
        size={32}
      />
      <GothicOrnaments.FleurDeLis
        className={`absolute -bottom-4 -right-4 ${v.ornament} transition-all duration-500 group-hover:scale-125 drop-shadow-lg`}
        size={32}
      />

      {/* Border vines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <GothicOrnaments.BorderVine className="absolute top-0 left-0 w-full" color={`rgb(${v.border.includes('amber') ? '251,191,36' : v.border.includes('red') ? '248,113,113' : v.border.includes('purple') ? '216,180,254' : v.border.includes('slate') ? '203,213,225' : v.border.includes('orange') ? '251,146,60' : '103,232,249'})`} />
        <GothicOrnaments.BorderVine className="absolute bottom-0 left-0 w-full scale-y-[-1]" color={`rgb(${v.border.includes('amber') ? '251,191,36' : v.border.includes('red') ? '248,113,113' : v.border.includes('purple') ? '216,180,254' : v.border.includes('slate') ? '203,213,225' : v.border.includes('orange') ? '251,146,60' : '103,232,249'})`} />
      </div>

      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-3">
        {icon}
        {children}
      </span>

      {/* Inner shadow */}
      <div className="absolute inset-0 border border-white/10 pointer-events-none" />
    </button>
  );
}

/**
 * Gothic Container Component
 */
interface GothicContainerProps {
  children: React.ReactNode;
  variant: 'ornate' | 'shadow' | 'blood' | 'frost';
  size?: 'normal' | 'large';
}

function GothicContainer({ children, variant, size = 'normal' }: GothicContainerProps) {
  const variants = {
    ornate: {
      gradient: 'from-amber-950/70 via-slate-900/90 to-amber-950/70',
      border: 'border-amber-500/60',
      shadow: 'shadow-amber-500/30',
      ornament: 'text-amber-400',
      glow: 'shadow-[0_0_40px_rgba(251,191,36,0.2)]',
    },
    shadow: {
      gradient: 'from-purple-950/70 via-slate-900/90 to-purple-950/70',
      border: 'border-purple-500/60',
      shadow: 'shadow-purple-500/30',
      ornament: 'text-purple-400',
      glow: 'shadow-[0_0_40px_rgba(168,85,247,0.2)]',
    },
    blood: {
      gradient: 'from-red-950/70 via-slate-900/90 to-red-950/70',
      border: 'border-red-500/60',
      shadow: 'shadow-red-500/30',
      ornament: 'text-red-400',
      glow: 'shadow-[0_0_40px_rgba(239,68,68,0.2)]',
    },
    frost: {
      gradient: 'from-cyan-950/70 via-slate-900/90 to-cyan-950/70',
      border: 'border-cyan-500/60',
      shadow: 'shadow-cyan-500/30',
      ornament: 'text-cyan-400',
      glow: 'shadow-[0_0_40px_rgba(34,211,238,0.2)]',
    },
  };

  const v = variants[variant];
  const padding = size === 'large' ? 'p-16' : 'p-10';

  return (
    <div className="relative group">
      <div
        className={`
          relative
          ${padding}
          bg-gradient-to-br ${v.gradient}
          border-4 ${v.border}
          shadow-2xl ${v.shadow}
          backdrop-blur-md
          transition-all duration-700
          hover:${v.glow}
          overflow-visible
        `}
      >
        {/* Corner ornaments */}
        <GothicOrnaments.CornerOrnament
          className={`absolute -top-8 -left-8 ${v.ornament} transition-all duration-700 group-hover:scale-110`}
        />
        <GothicOrnaments.CornerOrnament
          className={`absolute -top-8 -right-8 ${v.ornament} transition-all duration-700 group-hover:scale-110 scale-x-[-1]`}
        />
        <GothicOrnaments.CornerOrnament
          className={`absolute -bottom-8 -left-8 ${v.ornament} transition-all duration-700 group-hover:scale-110 scale-y-[-1]`}
        />
        <GothicOrnaments.CornerOrnament
          className={`absolute -bottom-8 -right-8 ${v.ornament} transition-all duration-700 group-hover:scale-110 scale-[-1]`}
        />

        {/* Side center ornaments */}
        <GothicOrnaments.FleurDeLis
          className={`absolute top-1/2 -left-6 -translate-y-1/2 ${v.ornament} transition-all duration-700 group-hover:scale-110 drop-shadow-lg`}
          size={48}
        />
        <GothicOrnaments.FleurDeLis
          className={`absolute top-1/2 -right-6 -translate-y-1/2 ${v.ornament} transition-all duration-700 group-hover:scale-110 drop-shadow-lg`}
          size={48}
        />
        <GothicOrnaments.FleurDeLis
          className={`absolute -top-6 left-1/2 -translate-x-1/2 ${v.ornament} transition-all duration-700 group-hover:scale-110 drop-shadow-lg`}
          size={48}
        />
        <GothicOrnaments.FleurDeLis
          className={`absolute -bottom-6 left-1/2 -translate-x-1/2 ${v.ornament} transition-all duration-700 group-hover:scale-110 drop-shadow-lg`}
          size={48}
        />

        {/* Inner borders */}
        <div className="absolute inset-4 border-2 border-white/10 pointer-events-none" />
        <div className="absolute inset-6 border border-white/5 pointer-events-none" />

        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-radial from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      </div>
    </div>
  );
}
