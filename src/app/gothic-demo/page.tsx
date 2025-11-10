/**
 * Gothic Design Demo - Medieval Manuscript Style
 * Using CSS decorative borders and classic ornamental patterns
 */

'use client';

import { useState } from 'react';
import { Mountain, Skull, Flame, Moon, Crown, Sword, BookOpen, Scroll } from 'lucide-react';

export default function GothicDemoPage() {
  const [activeButton, setActiveButton] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Page Header with illuminated manuscript style */}
        <div className="text-center space-y-6 mb-16">
          <div className="inline-block relative">
            <h1 className="text-6xl font-cinzel text-amber-200 tracking-wider relative z-10">
              Gothic Design System
            </h1>
            {/* Decorative underline */}
            <div className="absolute -bottom-4 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-30" />
            <div className="absolute -bottom-5 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-50" />
          </div>

          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-24 bg-gradient-to-r from-transparent to-slate-500" />
            <BookOpen className="w-5 h-5 text-slate-400" />
            <div className="h-px w-24 bg-gradient-to-l from-transparent to-slate-500" />
          </div>

          <p className="text-slate-400 font-serif italic text-lg">
            Medieval Manuscript Borders & Illuminated Decorations
          </p>
        </div>

        {/* Gothic Buttons with Medieval Border Style */}
        <section className="space-y-8">
          <h2 className="text-3xl font-cinzel text-amber-300 mb-8 text-center border-b-2 border-amber-900/30 pb-4">
            Illuminated Buttons
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <IlluminatedButton
              variant="gold"
              icon={<Crown className="w-5 h-5" />}
              onClick={() => setActiveButton('gold')}
              active={activeButton === 'gold'}
            >
              Royal Gold
            </IlluminatedButton>

            <IlluminatedButton
              variant="crimson"
              icon={<Flame className="w-5 h-5" />}
              onClick={() => setActiveButton('crimson')}
              active={activeButton === 'crimson'}
            >
              Crimson Fire
            </IlluminatedButton>

            <IlluminatedButton
              variant="azure"
              icon={<Moon className="w-5 h-5" />}
              onClick={() => setActiveButton('azure')}
              active={activeButton === 'azure'}
            >
              Azure Night
            </IlluminatedButton>

            <IlluminatedButton
              variant="emerald"
              icon={<Mountain className="w-5 h-5" />}
              onClick={() => setActiveButton('emerald')}
              active={activeButton === 'emerald'}
            >
              Emerald Peak
            </IlluminatedButton>

            <IlluminatedButton
              variant="violet"
              icon={<Skull className="w-5 h-5" />}
              onClick={() => setActiveButton('violet')}
              active={activeButton === 'violet'}
            >
              Violet Shadow
            </IlluminatedButton>

            <IlluminatedButton
              variant="copper"
              icon={<Sword className="w-5 h-5" />}
              onClick={() => setActiveButton('copper')}
              active={activeButton === 'copper'}
            >
              Copper Blade
            </IlluminatedButton>
          </div>
        </section>

        {/* Manuscript Panels */}
        <section className="space-y-8">
          <h2 className="text-3xl font-cinzel text-amber-300 mb-8 text-center border-b-2 border-amber-900/30 pb-4">
            Illuminated Manuscripts
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ManuscriptPanel variant="gold" initial="W">
              <h3 className="text-2xl font-cinzel text-amber-200 mb-4">
                The Golden Covenant
              </h3>
              <p className="text-slate-300 font-serif leading-relaxed text-justify">
                In the year of our Lord 1913, fifteen souls gathered at the threshold of Whitefire Pass.
                Each bore secrets darker than the winter night, each carried burdens heavier than the
                falling snow. The mountain spirits watched, silent and eternal, as fate wove its crimson
                thread through their desperate lives.
              </p>
            </ManuscriptPanel>

            <ManuscriptPanel variant="crimson" initial="T">
              <h3 className="text-2xl font-cinzel text-red-200 mb-4">
                The Blood Compact
              </h3>
              <p className="text-slate-300 font-serif leading-relaxed text-justify">
                Three among them bore the Mark—the cursed brand that hungered for innocent flesh.
                Twelve stood unknowing, armed only with courage and wit. When the storm sealed
                the pass and ancient law awakened, a terrible game began. Hunter and prey danced
                beneath the pale moon's gaze.
              </p>
            </ManuscriptPanel>

            <ManuscriptPanel variant="azure" initial="I">
              <h3 className="text-2xl font-cinzel text-blue-200 mb-4">
                The Frozen Testament
              </h3>
              <p className="text-slate-300 font-serif leading-relaxed text-justify">
                In the manor's depths, they found the testament—warnings written in trembling hand
                by those who came before. The words spoke of sacrifice, of the Harvest and the Lamb,
                of an ancient covenant that demanded blood. Some laughed. Others wept. All, in time,
                would believe.
              </p>
            </ManuscriptPanel>

            <ManuscriptPanel variant="emerald" initial="O">
              <h3 className="text-2xl font-cinzel text-emerald-200 mb-4">
                The Mountain's Judgement
              </h3>
              <p className="text-slate-300 font-serif leading-relaxed text-justify">
                Only truth would free them. Only sacrifice would appease the storm. Day by day,
                the cold grew fiercer. Night by night, the shadows deepened. Words became weapons,
                trust became treasure, and every heartbeat counted toward the final reckoning beneath
                ash-white peaks.
              </p>
            </ManuscriptPanel>
          </div>
        </section>

        {/* Grand Illuminated Charter */}
        <section>
          <h2 className="text-3xl font-cinzel text-amber-300 mb-8 text-center border-b-2 border-amber-900/30 pb-4">
            The Great Charter
          </h2>

          <ManuscriptPanel variant="gold" initial="H" size="large">
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <h3 className="text-5xl font-cinzel text-amber-200 leading-tight">
                  Here Begins the Chronicle
                  <br />
                  <span className="text-3xl text-amber-300/80">of Whitefire Pass</span>
                </h3>

                <div className="flex items-center justify-center gap-6 py-4">
                  <div className="h-px w-32 bg-gradient-to-r from-transparent to-amber-500/50" />
                  <Scroll className="w-8 h-8 text-amber-400" />
                  <div className="h-px w-32 bg-gradient-to-l from-transparent to-amber-500/50" />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div className="space-y-2">
                  <Crown className="w-10 h-10 mx-auto text-amber-400" />
                  <h4 className="text-lg font-cinzel text-amber-200">XV Travelers</h4>
                  <p className="text-slate-400 font-serif text-sm">
                    Fifteen souls bound by fate and sealed by storm
                  </p>
                </div>

                <div className="space-y-2">
                  <Flame className="w-10 h-10 mx-auto text-red-400" />
                  <h4 className="text-lg font-cinzel text-red-200">III Marked</h4>
                  <p className="text-slate-400 font-serif text-sm">
                    Three hunters bearing the curse of endless hunger
                  </p>
                </div>

                <div className="space-y-2">
                  <Moon className="w-10 h-10 mx-auto text-cyan-400" />
                  <h4 className="text-lg font-cinzel text-cyan-200">XII Innocents</h4>
                  <p className="text-slate-400 font-serif text-sm">
                    Twelve lambs seeking truth in shadow's realm
                  </p>
                </div>
              </div>

              <div className="border-t-2 border-amber-900/30 pt-6">
                <p className="text-slate-300 font-serif leading-relaxed text-center italic">
                  "When snow seals the pass and darkness falls, let the ancient rite commence.
                  By day they speak, by night they hunt, until truth alone remains standing."
                </p>
                <p className="text-slate-500 font-serif text-sm text-center mt-4">
                  — From the Testament of the Mountain, Chapter VII
                </p>
              </div>
            </div>
          </ManuscriptPanel>
        </section>
      </div>
    </div>
  );
}

/**
 * Illuminated Button - Medieval manuscript style
 */
interface IlluminatedButtonProps {
  children: React.ReactNode;
  variant: 'gold' | 'crimson' | 'azure' | 'emerald' | 'violet' | 'copper';
  icon?: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
}

function IlluminatedButton({ children, variant, icon, onClick, active }: IlluminatedButtonProps) {
  const styles = {
    gold: {
      bg: 'bg-gradient-to-br from-amber-700 via-yellow-600 to-amber-800',
      border: 'border-amber-400',
      shadow: 'shadow-lg shadow-amber-500/50',
      text: 'text-amber-50',
      decoration: 'bg-amber-400',
      glow: 'hover:shadow-2xl hover:shadow-amber-500/60',
    },
    crimson: {
      bg: 'bg-gradient-to-br from-red-800 via-rose-700 to-red-900',
      border: 'border-red-400',
      shadow: 'shadow-lg shadow-red-500/50',
      text: 'text-red-50',
      decoration: 'bg-red-400',
      glow: 'hover:shadow-2xl hover:shadow-red-500/60',
    },
    azure: {
      bg: 'bg-gradient-to-br from-blue-800 via-cyan-700 to-blue-900',
      border: 'border-blue-400',
      shadow: 'shadow-lg shadow-blue-500/50',
      text: 'text-blue-50',
      decoration: 'bg-blue-400',
      glow: 'hover:shadow-2xl hover:shadow-blue-500/60',
    },
    emerald: {
      bg: 'bg-gradient-to-br from-emerald-800 via-green-700 to-emerald-900',
      border: 'border-emerald-400',
      shadow: 'shadow-lg shadow-emerald-500/50',
      text: 'text-emerald-50',
      decoration: 'bg-emerald-400',
      glow: 'hover:shadow-2xl hover:shadow-emerald-500/60',
    },
    violet: {
      bg: 'bg-gradient-to-br from-violet-800 via-purple-700 to-violet-900',
      border: 'border-violet-400',
      shadow: 'shadow-lg shadow-violet-500/50',
      text: 'text-violet-50',
      decoration: 'bg-violet-400',
      glow: 'hover:shadow-2xl hover:shadow-violet-500/60',
    },
    copper: {
      bg: 'bg-gradient-to-br from-orange-800 via-amber-700 to-orange-900',
      border: 'border-orange-400',
      shadow: 'shadow-lg shadow-orange-500/50',
      text: 'text-orange-50',
      decoration: 'bg-orange-400',
      glow: 'hover:shadow-2xl hover:shadow-orange-500/60',
    },
  };

  const style = styles[variant];

  return (
    <button
      onClick={onClick}
      className={`
        relative group
        px-8 py-4
        ${style.bg}
        border-4 ${style.border}
        ${active ? 'ring-4 ring-white/30' : ''}
        font-cinzel tracking-widest text-sm uppercase
        ${style.text}
        ${style.shadow}
        ${style.glow}
        transition-all duration-500
        hover:scale-105
        hover:-translate-y-1
      `}
    >
      {/* Corner decorations - simple geometric */}
      <div className={`absolute top-0 left-0 w-3 h-3 ${style.decoration} opacity-60`}
           style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
      <div className={`absolute top-0 right-0 w-3 h-3 ${style.decoration} opacity-60`}
           style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 0)' }} />
      <div className={`absolute bottom-0 left-0 w-3 h-3 ${style.decoration} opacity-60`}
           style={{ clipPath: 'polygon(0 0, 0 100%, 100% 100%)' }} />
      <div className={`absolute bottom-0 right-0 w-3 h-3 ${style.decoration} opacity-60`}
           style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }} />

      {/* Border pattern */}
      <div className="absolute inset-0 border-2 border-white/10 pointer-events-none" />
      <div className="absolute inset-1 border border-white/5 pointer-events-none" />

      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-3 font-bold">
        {icon}
        {children}
      </span>

      {/* Inner glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
    </button>
  );
}

/**
 * Manuscript Panel - Illuminated page style with decorative initial
 */
interface ManuscriptPanelProps {
  children: React.ReactNode;
  variant: 'gold' | 'crimson' | 'azure' | 'emerald';
  initial: string;
  size?: 'normal' | 'large';
}

function ManuscriptPanel({ children, variant, initial, size = 'normal' }: ManuscriptPanelProps) {
  const styles = {
    gold: {
      border: 'border-amber-600/40',
      initial: 'text-amber-400 from-amber-600 to-amber-800',
      corner: 'text-amber-500/30',
      shadow: 'shadow-amber-900/20',
      accent: 'from-amber-600/20 to-transparent',
    },
    crimson: {
      border: 'border-red-600/40',
      initial: 'text-red-400 from-red-600 to-red-800',
      corner: 'text-red-500/30',
      shadow: 'shadow-red-900/20',
      accent: 'from-red-600/20 to-transparent',
    },
    azure: {
      border: 'border-blue-600/40',
      initial: 'text-blue-400 from-blue-600 to-blue-800',
      corner: 'text-blue-500/30',
      shadow: 'shadow-blue-900/20',
      accent: 'from-blue-600/20 to-transparent',
    },
    emerald: {
      border: 'border-emerald-600/40',
      initial: 'text-emerald-400 from-emerald-600 to-emerald-800',
      corner: 'text-emerald-500/30',
      shadow: 'shadow-emerald-900/20',
      accent: 'from-emerald-600/20 to-transparent',
    },
  };

  const style = styles[variant];
  const padding = size === 'large' ? 'p-12 md:p-16' : 'p-8';

  return (
    <div className="relative group">
      <div
        className={`
          relative
          ${padding}
          bg-gradient-to-br from-slate-950/95 via-slate-900/98 to-slate-950/95
          border-4 ${style.border}
          shadow-2xl ${style.shadow}
          backdrop-blur-sm
          transition-all duration-700
          hover:border-opacity-60
        `}
      >
        {/* Illuminated initial letter */}
        <div className={`
          float-left
          mr-4 mb-2
          w-20 h-20
          flex items-center justify-center
          text-6xl font-cinzel font-bold
          ${style.initial}
          bg-gradient-to-br ${style.initial.split(' ')[1]} ${style.initial.split(' ')[2]}
          border-4 ${style.border}
          shadow-lg
          relative
        `}>
          <span className="relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {initial}
          </span>
          {/* Gold leaf effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/20 pointer-events-none" />
        </div>

        {/* Corner decorative elements */}
        <svg className={`absolute top-0 left-0 w-24 h-24 ${style.corner} opacity-40`} viewBox="0 0 100 100">
          <path d="M 0,0 L 0,40 Q 0,20 20,20 L 40,20 Q 20,20 20,0 Z" fill="currentColor" />
          <path d="M 10,10 L 10,30 Q 10,20 20,20 L 30,20 Q 20,20 20,10 Z" fill="currentColor" opacity="0.5" />
        </svg>
        <svg className={`absolute top-0 right-0 w-24 h-24 ${style.corner} opacity-40 scale-x-[-1]`} viewBox="0 0 100 100">
          <path d="M 0,0 L 0,40 Q 0,20 20,20 L 40,20 Q 20,20 20,0 Z" fill="currentColor" />
          <path d="M 10,10 L 10,30 Q 10,20 20,20 L 30,20 Q 20,20 20,10 Z" fill="currentColor" opacity="0.5" />
        </svg>
        <svg className={`absolute bottom-0 left-0 w-24 h-24 ${style.corner} opacity-40 scale-y-[-1]`} viewBox="0 0 100 100">
          <path d="M 0,0 L 0,40 Q 0,20 20,20 L 40,20 Q 20,20 20,0 Z" fill="currentColor" />
          <path d="M 10,10 L 10,30 Q 10,20 20,20 L 30,20 Q 20,20 20,10 Z" fill="currentColor" opacity="0.5" />
        </svg>
        <svg className={`absolute bottom-0 right-0 w-24 h-24 ${style.corner} opacity-40 scale-[-1]`} viewBox="0 0 100 100">
          <path d="M 0,0 L 0,40 Q 0,20 20,20 L 40,20 Q 20,20 20,0 Z" fill="currentColor" />
          <path d="M 10,10 L 10,30 Q 10,20 20,20 L 30,20 Q 20,20 20,10 Z" fill="currentColor" opacity="0.5" />
        </svg>

        {/* Border accents */}
        <div className={`absolute top-0 left-1/4 right-1/4 h-1 bg-gradient-to-r ${style.accent}`} />
        <div className={`absolute bottom-0 left-1/4 right-1/4 h-1 bg-gradient-to-r ${style.accent}`} />
        <div className={`absolute left-0 top-1/4 bottom-1/4 w-1 bg-gradient-to-b ${style.accent}`} />
        <div className={`absolute right-0 top-1/4 bottom-1/4 w-1 bg-gradient-to-b ${style.accent}`} />

        {/* Inner border */}
        <div className="absolute inset-4 border-2 border-white/5 pointer-events-none" />
        <div className="absolute inset-6 border border-white/3 pointer-events-none" />

        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>

        {/* Parchment texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.015] pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Hover glow */}
        <div className="absolute inset-0 bg-gradient-radial from-white/0 via-white/0 to-transparent opacity-0 group-hover:opacity-5 transition-opacity duration-700 pointer-events-none" />
      </div>
    </div>
  );
}
