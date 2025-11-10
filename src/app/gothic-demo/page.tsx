/**
 * Gothic Design Demo Page
 * Showcasing ornate gothic-style buttons and containers with fleur-de-lis and vine motifs
 */

'use client';

import { useState } from 'react';
import { Mountain, Skull, Flame, Moon, Crown, Sword } from 'lucide-react';

export default function GothicDemoPage() {
  const [activeButton, setActiveButton] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8 relative overflow-hidden">
      {/* Background vine pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="vine-bg" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
              <path
                d="M 0,100 Q 25,80 50,100 T 100,100 Q 125,120 150,100 T 200,100"
                stroke="white"
                strokeWidth="1"
                fill="none"
                opacity="0.3"
              />
              <path
                d="M 100,0 Q 80,25 100,50 T 100,100 Q 120,125 100,150 T 100,200"
                stroke="white"
                strokeWidth="1"
                fill="none"
                opacity="0.3"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#vine-bg)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        {/* Page Header */}
        <div className="text-center space-y-4 mb-16">
          <h1 className="text-5xl font-cinzel text-slate-200 tracking-wider">
            Gothic Design System
          </h1>
          <p className="text-slate-400 font-serif">
            Ornate buttons and containers with intricate patterns
          </p>
        </div>

        {/* Gothic Buttons Section */}
        <section className="space-y-6">
          <h2 className="text-3xl font-cinzel text-slate-300 mb-8">Gothic Buttons</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Button 1: Primary Gothic */}
            <GothicButton
              variant="primary"
              icon={<Flame className="w-5 h-5" />}
              onClick={() => setActiveButton('primary')}
              active={activeButton === 'primary'}
            >
              Primary Action
            </GothicButton>

            {/* Button 2: Danger Gothic */}
            <GothicButton
              variant="danger"
              icon={<Skull className="w-5 h-5" />}
              onClick={() => setActiveButton('danger')}
              active={activeButton === 'danger'}
            >
              Danger Action
            </GothicButton>

            {/* Button 3: Royal Gothic */}
            <GothicButton
              variant="royal"
              icon={<Crown className="w-5 h-5" />}
              onClick={() => setActiveButton('royal')}
              active={activeButton === 'royal'}
            >
              Royal Action
            </GothicButton>

            {/* Button 4: Shadow Gothic */}
            <GothicButton
              variant="shadow"
              icon={<Moon className="w-5 h-5" />}
              onClick={() => setActiveButton('shadow')}
              active={activeButton === 'shadow'}
            >
              Shadow Action
            </GothicButton>

            {/* Button 5: Battle Gothic */}
            <GothicButton
              variant="battle"
              icon={<Sword className="w-5 h-5" />}
              onClick={() => setActiveButton('battle')}
              active={activeButton === 'battle'}
            >
              Battle Action
            </GothicButton>

            {/* Button 6: Mountain Gothic */}
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
            {/* Container 1: Ornate Panel */}
            <GothicContainer variant="ornate">
              <div className="space-y-4">
                <h3 className="text-2xl font-cinzel text-amber-300 flex items-center gap-2">
                  <Crown className="w-6 h-6" />
                  Ornate Panel
                </h3>
                <p className="text-slate-300 font-serif leading-relaxed">
                  This container features intricate gothic patterns with golden accents.
                  The border design mimics medieval manuscript illuminations with symmetrical
                  flourishes and corner ornaments.
                </p>
                <div className="flex gap-3 pt-4">
                  <div className="flex-1 h-2 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent rounded-full" />
                </div>
              </div>
            </GothicContainer>

            {/* Container 2: Shadow Panel */}
            <GothicContainer variant="shadow">
              <div className="space-y-4">
                <h3 className="text-2xl font-cinzel text-purple-300 flex items-center gap-2">
                  <Moon className="w-6 h-6" />
                  Shadow Panel
                </h3>
                <p className="text-slate-300 font-serif leading-relaxed">
                  A darker variant with purple undertones and moonlight-inspired decorative
                  elements. Perfect for mysterious or nocturnal content with deep shadows
                  and ethereal glows.
                </p>
                <div className="flex gap-3 pt-4">
                  <div className="flex-1 h-2 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent rounded-full" />
                </div>
              </div>
            </GothicContainer>

            {/* Container 3: Blood Panel */}
            <GothicContainer variant="blood">
              <div className="space-y-4">
                <h3 className="text-2xl font-cinzel text-red-300 flex items-center gap-2">
                  <Flame className="w-6 h-6" />
                  Blood Panel
                </h3>
                <p className="text-slate-300 font-serif leading-relaxed">
                  Crimson-themed container with flame motifs and aggressive angular patterns.
                  The deep red accents create a sense of danger and intensity, ideal for
                  warning messages or dramatic reveals.
                </p>
                <div className="flex gap-3 pt-4">
                  <div className="flex-1 h-2 bg-gradient-to-r from-transparent via-red-500/30 to-transparent rounded-full" />
                </div>
              </div>
            </GothicContainer>

            {/* Container 4: Frost Panel */}
            <GothicContainer variant="frost">
              <div className="space-y-4">
                <h3 className="text-2xl font-cinzel text-cyan-300 flex items-center gap-2">
                  <Mountain className="w-6 h-6" />
                  Frost Panel
                </h3>
                <p className="text-slate-300 font-serif leading-relaxed">
                  Ice-inspired design with crystalline patterns and cool blue tones.
                  The frosted borders suggest winter landscapes and mountain peaks,
                  complementing the Whitefire Pass aesthetic.
                </p>
                <div className="flex gap-3 pt-4">
                  <div className="flex-1 h-2 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent rounded-full" />
                </div>
              </div>
            </GothicContainer>
          </div>
        </section>

        {/* Large Feature Container */}
        <section className="space-y-6">
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

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="text-lg font-cinzel text-slate-200">The Harvest</h4>
                  <p className="text-slate-400 font-serif text-sm leading-relaxed">
                    Three marked souls, bound by hunger and shadow, must hunt beneath the moon's
                    cold gaze. Their covenant is written in blood and silence.
                  </p>
                </div>
                <div className="space-y-3">
                  <h4 className="text-lg font-cinzel text-slate-200">The Lamb</h4>
                  <p className="text-slate-400 font-serif text-sm leading-relaxed">
                    Twelve innocent travelers, armed only with reason and faith, must expose
                    the darkness before the storm consumes all hope.
                  </p>
                </div>
              </div>

              <div className="flex justify-center gap-4 pt-6">
                <GothicButton variant="primary" icon={<Flame className="w-4 h-4" />}>
                  Join the Hunt
                </GothicButton>
                <GothicButton variant="shadow" icon={<Moon className="w-4 h-4" />}>
                  Seek the Truth
                </GothicButton>
              </div>
            </div>
          </GothicContainer>
        </section>
      </div>
    </div>
  );
}

/**
 * Gothic Button Component with Fleur-de-lis and Vine Motifs
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
      base: 'from-amber-600 to-amber-800',
      border: 'border-amber-400/60',
      shadow: 'shadow-amber-500/40',
      active: 'ring-amber-400/60',
      fleur: 'text-amber-300/40',
      glow: 'from-amber-400/20',
    },
    danger: {
      base: 'from-red-700 to-red-900',
      border: 'border-red-400/60',
      shadow: 'shadow-red-500/40',
      active: 'ring-red-400/60',
      fleur: 'text-red-300/40',
      glow: 'from-red-400/20',
    },
    royal: {
      base: 'from-purple-700 to-purple-900',
      border: 'border-purple-400/60',
      shadow: 'shadow-purple-500/40',
      active: 'ring-purple-400/60',
      fleur: 'text-purple-300/40',
      glow: 'from-purple-400/20',
    },
    shadow: {
      base: 'from-slate-700 to-slate-900',
      border: 'border-slate-400/60',
      shadow: 'shadow-slate-500/40',
      active: 'ring-slate-400/60',
      fleur: 'text-slate-300/40',
      glow: 'from-slate-400/20',
    },
    battle: {
      base: 'from-orange-700 to-orange-900',
      border: 'border-orange-400/60',
      shadow: 'shadow-orange-500/40',
      active: 'ring-orange-400/60',
      fleur: 'text-orange-300/40',
      glow: 'from-orange-400/20',
    },
    mountain: {
      base: 'from-cyan-700 to-cyan-900',
      border: 'border-cyan-400/60',
      shadow: 'shadow-cyan-500/40',
      active: 'ring-cyan-400/60',
      fleur: 'text-cyan-300/40',
      glow: 'from-cyan-400/20',
    },
  };

  const v = variants[variant];

  return (
    <button
      onClick={onClick}
      className={`
        relative group
        px-8 py-4
        bg-gradient-to-br ${v.base}
        border-2 ${v.border}
        ${active ? `ring-4 ${v.active}` : ''}
        font-cinzel tracking-widest text-sm
        text-slate-100
        transition-all duration-500
        hover:scale-105
        shadow-xl ${v.shadow}
        overflow-visible
      `}
    >
      {/* Fleur-de-lis corner ornaments */}
      <svg className={`absolute -top-3 -left-3 w-6 h-6 ${v.fleur} transition-all duration-500 group-hover:scale-125 group-hover:opacity-100`} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2 C10 2 9 4 9 6 C9 8 10 9 10 10 C8 10 6 9 5 8 C4 7 4 6 4 6 C4 6 3 8 4 10 C5 12 7 12 8 12 L8 20 C8 21 9 22 10 22 L14 22 C15 22 16 21 16 20 L16 12 C17 12 19 12 20 10 C21 8 20 6 20 6 C20 6 20 7 19 8 C18 9 16 10 14 10 C14 9 15 8 15 6 C15 4 14 2 12 2 Z" />
      </svg>
      <svg className={`absolute -top-3 -right-3 w-6 h-6 ${v.fleur} transition-all duration-500 group-hover:scale-125 group-hover:opacity-100`} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2 C10 2 9 4 9 6 C9 8 10 9 10 10 C8 10 6 9 5 8 C4 7 4 6 4 6 C4 6 3 8 4 10 C5 12 7 12 8 12 L8 20 C8 21 9 22 10 22 L14 22 C15 22 16 21 16 20 L16 12 C17 12 19 12 20 10 C21 8 20 6 20 6 C20 6 20 7 19 8 C18 9 16 10 14 10 C14 9 15 8 15 6 C15 4 14 2 12 2 Z" />
      </svg>
      <svg className={`absolute -bottom-3 -left-3 w-6 h-6 ${v.fleur} transition-all duration-500 group-hover:scale-125 group-hover:opacity-100`} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2 C10 2 9 4 9 6 C9 8 10 9 10 10 C8 10 6 9 5 8 C4 7 4 6 4 6 C4 6 3 8 4 10 C5 12 7 12 8 12 L8 20 C8 21 9 22 10 22 L14 22 C15 22 16 21 16 20 L16 12 C17 12 19 12 20 10 C21 8 20 6 20 6 C20 6 20 7 19 8 C18 9 16 10 14 10 C14 9 15 8 15 6 C15 4 14 2 12 2 Z" />
      </svg>
      <svg className={`absolute -bottom-3 -right-3 w-6 h-6 ${v.fleur} transition-all duration-500 group-hover:scale-125 group-hover:opacity-100`} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2 C10 2 9 4 9 6 C9 8 10 9 10 10 C8 10 6 9 5 8 C4 7 4 6 4 6 C4 6 3 8 4 10 C5 12 7 12 8 12 L8 20 C8 21 9 22 10 22 L14 22 C15 22 16 21 16 20 L16 12 C17 12 19 12 20 10 C21 8 20 6 20 6 C20 6 20 7 19 8 C18 9 16 10 14 10 C14 9 15 8 15 6 C15 4 14 2 12 2 Z" />
      </svg>

      {/* Vine border decoration */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" viewBox="0 0 200 80">
        {/* Top vine */}
        <path
          d="M 10,5 Q 30,2 50,5 T 90,5 Q 110,2 130,5 T 170,5 Q 185,3 190,5"
          stroke="white"
          strokeWidth="1"
          fill="none"
        />
        {/* Bottom vine */}
        <path
          d="M 10,75 Q 30,78 50,75 T 90,75 Q 110,78 130,75 T 170,75 Q 185,77 190,75"
          stroke="white"
          strokeWidth="1"
          fill="none"
        />
        {/* Left vine */}
        <path
          d="M 5,10 Q 2,25 5,40 Q 8,55 5,70"
          stroke="white"
          strokeWidth="1"
          fill="none"
        />
        {/* Right vine */}
        <path
          d="M 195,10 Q 198,25 195,40 Q 192,55 195,70"
          stroke="white"
          strokeWidth="1"
          fill="none"
        />
      </svg>

      {/* Inner decorative border */}
      <div className="absolute inset-2 border border-white/10 pointer-events-none" />

      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-3">
        {icon}
        {children}
      </span>

      {/* Hover glow effect */}
      <div className={`absolute inset-0 bg-gradient-radial ${v.glow} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

      {/* Outer glow */}
      <div className={`absolute inset-0 blur-xl bg-gradient-to-br ${v.glow} to-transparent opacity-0 group-hover:opacity-60 transition-opacity duration-500 -z-10`} />
    </button>
  );
}

/**
 * Gothic Container Component with Elaborate Vine and Floral Borders
 */
interface GothicContainerProps {
  children: React.ReactNode;
  variant: 'ornate' | 'shadow' | 'blood' | 'frost';
  size?: 'normal' | 'large';
}

function GothicContainer({ children, variant, size = 'normal' }: GothicContainerProps) {
  const variants = {
    ornate: {
      bg: 'from-amber-950/60 via-slate-900/80 to-amber-950/60',
      border: 'border-amber-500/50',
      glow: 'shadow-amber-500/30',
      fleur: 'text-amber-400/30',
      vine: 'stroke-amber-400/40',
    },
    shadow: {
      bg: 'from-purple-950/60 via-slate-900/80 to-purple-950/60',
      border: 'border-purple-500/50',
      glow: 'shadow-purple-500/30',
      fleur: 'text-purple-400/30',
      vine: 'stroke-purple-400/40',
    },
    blood: {
      bg: 'from-red-950/60 via-slate-900/80 to-red-950/60',
      border: 'border-red-500/50',
      glow: 'shadow-red-500/30',
      fleur: 'text-red-400/30',
      vine: 'stroke-red-400/40',
    },
    frost: {
      bg: 'from-cyan-950/60 via-slate-900/80 to-cyan-950/60',
      border: 'border-cyan-500/50',
      glow: 'shadow-cyan-500/30',
      fleur: 'text-cyan-400/30',
      vine: 'stroke-cyan-400/40',
    },
  };

  const v = variants[variant];
  const padding = size === 'large' ? 'p-12' : 'p-8';

  return (
    <div className="relative group">
      {/* Main container */}
      <div
        className={`
          relative
          ${padding}
          bg-gradient-to-br ${v.bg}
          border-4 ${v.border}
          shadow-2xl ${v.glow}
          backdrop-blur-md
          overflow-visible
          transition-all duration-700
          hover:shadow-3xl
        `}
      >
        {/* Elaborate vine border frame */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 400" preserveAspectRatio="none">
          <defs>
            {/* Leaf pattern for vine */}
            <g id="leaf">
              <path d="M0,0 Q5,-5 10,0 Q5,5 0,0 Z" fill="currentColor" opacity="0.3" />
            </g>
          </defs>

          {/* Top border vine with leaves */}
          <path
            d="M 20,10 Q 60,5 100,10 T 180,10 Q 220,5 260,10 T 340,10 Q 370,8 380,10"
            className={v.vine}
            strokeWidth="2"
            fill="none"
          />
          <path d="M 50,10 Q 52,5 54,10 M 100,10 Q 102,5 104,10 M 150,10 Q 152,5 154,10 M 200,10 Q 202,5 204,10 M 250,10 Q 252,5 254,10 M 300,10 Q 302,5 304,10 M 350,10 Q 352,5 354,10" className={v.vine} strokeWidth="1" fill="none" />

          {/* Bottom border vine with leaves */}
          <path
            d="M 20,390 Q 60,395 100,390 T 180,390 Q 220,395 260,390 T 340,390 Q 370,392 380,390"
            className={v.vine}
            strokeWidth="2"
            fill="none"
          />
          <path d="M 50,390 Q 52,395 54,390 M 100,390 Q 102,395 104,390 M 150,390 Q 152,395 154,390 M 200,390 Q 202,395 204,390 M 250,390 Q 252,395 254,390 M 300,390 Q 302,395 304,390 M 350,390 Q 352,395 354,390" className={v.vine} strokeWidth="1" fill="none" />

          {/* Left border vine */}
          <path
            d="M 10,20 Q 5,60 10,100 T 10,180 Q 5,220 10,260 T 10,340 Q 8,370 10,380"
            className={v.vine}
            strokeWidth="2"
            fill="none"
          />
          <path d="M 10,50 Q 5,52 10,54 M 10,100 Q 5,102 10,104 M 10,150 Q 5,152 10,154 M 10,200 Q 5,202 10,204 M 10,250 Q 5,252 10,254 M 10,300 Q 5,302 10,304 M 10,350 Q 5,352 10,354" className={v.vine} strokeWidth="1" fill="none" />

          {/* Right border vine */}
          <path
            d="M 390,20 Q 395,60 390,100 T 390,180 Q 395,220 390,260 T 390,340 Q 392,370 390,380"
            className={v.vine}
            strokeWidth="2"
            fill="none"
          />
          <path d="M 390,50 Q 395,52 390,54 M 390,100 Q 395,102 390,104 M 390,150 Q 395,152 390,154 M 390,200 Q 395,202 390,204 M 390,250 Q 395,252 390,254 M 390,300 Q 395,302 390,304 M 390,350 Q 395,352 390,354" className={v.vine} strokeWidth="1" fill="none" />
        </svg>

        {/* Corner fleur-de-lis ornaments */}
        <svg className={`absolute -top-6 -left-6 w-12 h-12 ${v.fleur} transition-all duration-700 group-hover:scale-110`} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2 C10 2 9 4 9 6 C9 8 10 9 10 10 C8 10 6 9 5 8 C4 7 4 6 4 6 C4 6 3 8 4 10 C5 12 7 12 8 12 L8 20 C8 21 9 22 10 22 L14 22 C15 22 16 21 16 20 L16 12 C17 12 19 12 20 10 C21 8 20 6 20 6 C20 6 20 7 19 8 C18 9 16 10 14 10 C14 9 15 8 15 6 C15 4 14 2 12 2 Z" />
        </svg>
        <svg className={`absolute -top-6 -right-6 w-12 h-12 ${v.fleur} transition-all duration-700 group-hover:scale-110`} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2 C10 2 9 4 9 6 C9 8 10 9 10 10 C8 10 6 9 5 8 C4 7 4 6 4 6 C4 6 3 8 4 10 C5 12 7 12 8 12 L8 20 C8 21 9 22 10 22 L14 22 C15 22 16 21 16 20 L16 12 C17 12 19 12 20 10 C21 8 20 6 20 6 C20 6 20 7 19 8 C18 9 16 10 14 10 C14 9 15 8 15 6 C15 4 14 2 12 2 Z" />
        </svg>
        <svg className={`absolute -bottom-6 -left-6 w-12 h-12 ${v.fleur} transition-all duration-700 group-hover:scale-110`} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2 C10 2 9 4 9 6 C9 8 10 9 10 10 C8 10 6 9 5 8 C4 7 4 6 4 6 C4 6 3 8 4 10 C5 12 7 12 8 12 L8 20 C8 21 9 22 10 22 L14 22 C15 22 16 21 16 20 L16 12 C17 12 19 12 20 10 C21 8 20 6 20 6 C20 6 20 7 19 8 C18 9 16 10 14 10 C14 9 15 8 15 6 C15 4 14 2 12 2 Z" />
        </svg>
        <svg className={`absolute -bottom-6 -right-6 w-12 h-12 ${v.fleur} transition-all duration-700 group-hover:scale-110`} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2 C10 2 9 4 9 6 C9 8 10 9 10 10 C8 10 6 9 5 8 C4 7 4 6 4 6 C4 6 3 8 4 10 C5 12 7 12 8 12 L8 20 C8 21 9 22 10 22 L14 22 C15 22 16 21 16 20 L16 12 C17 12 19 12 20 10 C21 8 20 6 20 6 C20 6 20 7 19 8 C18 9 16 10 14 10 C14 9 15 8 15 6 C15 4 14 2 12 2 Z" />
        </svg>

        {/* Side center ornaments */}
        <svg className={`absolute top-1/2 -left-5 -translate-y-1/2 w-10 h-16 ${v.fleur} transition-all duration-700 group-hover:scale-110`} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2 C10 2 9 4 9 6 C9 8 10 9 10 10 C8 10 6 9 5 8 C4 7 4 6 4 6 C4 6 3 8 4 10 C5 12 7 12 8 12 L8 20 C8 21 9 22 10 22 L14 22 C15 22 16 21 16 20 L16 12 C17 12 19 12 20 10 C21 8 20 6 20 6 C20 6 20 7 19 8 C18 9 16 10 14 10 C14 9 15 8 15 6 C15 4 14 2 12 2 Z" />
        </svg>
        <svg className={`absolute top-1/2 -right-5 -translate-y-1/2 w-10 h-16 ${v.fleur} transition-all duration-700 group-hover:scale-110`} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2 C10 2 9 4 9 6 C9 8 10 9 10 10 C8 10 6 9 5 8 C4 7 4 6 4 6 C4 6 3 8 4 10 C5 12 7 12 8 12 L8 20 C8 21 9 22 10 22 L14 22 C15 22 16 21 16 20 L16 12 C17 12 19 12 20 10 C21 8 20 6 20 6 C20 6 20 7 19 8 C18 9 16 10 14 10 C14 9 15 8 15 6 C15 4 14 2 12 2 Z" />
        </svg>
        <svg className={`absolute top-1/2 -top-5 left-1/2 -translate-x-1/2 w-16 h-10 ${v.fleur} transition-all duration-700 group-hover:scale-110`} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2 C10 2 9 4 9 6 C9 8 10 9 10 10 C8 10 6 9 5 8 C4 7 4 6 4 6 C4 6 3 8 4 10 C5 12 7 12 8 12 L8 20 C8 21 9 22 10 22 L14 22 C15 22 16 21 16 20 L16 12 C17 12 19 12 20 10 C21 8 20 6 20 6 C20 6 20 7 19 8 C18 9 16 10 14 10 C14 9 15 8 15 6 C15 4 14 2 12 2 Z" />
        </svg>
        <svg className={`absolute -bottom-5 left-1/2 -translate-x-1/2 w-16 h-10 ${v.fleur} transition-all duration-700 group-hover:scale-110`} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2 C10 2 9 4 9 6 C9 8 10 9 10 10 C8 10 6 9 5 8 C4 7 4 6 4 6 C4 6 3 8 4 10 C5 12 7 12 8 12 L8 20 C8 21 9 22 10 22 L14 22 C15 22 16 21 16 20 L16 12 C17 12 19 12 20 10 C21 8 20 6 20 6 C20 6 20 7 19 8 C18 9 16 10 14 10 C14 9 15 8 15 6 C15 4 14 2 12 2 Z" />
        </svg>

        {/* Inner ornate border */}
        <div className="absolute inset-4 border-2 border-white/10 pointer-events-none" />
        <div className="absolute inset-6 border border-white/5 pointer-events-none" />

        {/* Background damask pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M40 20 Q35 25 40 30 Q45 25 40 20 M20 40 Q25 35 30 40 Q25 45 20 40 M60 40 Q65 35 70 40 Q65 45 60 40 M40 60 Q35 65 40 70 Q45 65 40 60'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>

        {/* Hover glow overlay */}
        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-all duration-700 pointer-events-none" />
      </div>

      {/* Outer ambient glow */}
      <div className={`absolute inset-0 blur-2xl ${v.border.replace('border', 'bg').replace('/50', '/20')} opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10`} />
    </div>
  );
}
