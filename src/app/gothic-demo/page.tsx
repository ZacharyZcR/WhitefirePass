/**
 * Gothic Design Demo - Using Mature UI Components
 * Based on established patterns from Diablo, Darkest Dungeon UI
 */

'use client';

import { useState } from 'react';
import {
  Mountain, Skull, Flame, Moon, Crown, Sword,
  ChevronLeft, ChevronRight, X, Award, Shield,
  Sparkles, Target, Zap
} from 'lucide-react';

export default function GothicDemoPage() {
  const [activeButton, setActiveButton] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Page Header */}
        <div className="text-center space-y-4 mb-16">
          <div className="inline-block relative">
            <h1 className="text-6xl font-cinzel text-amber-200 tracking-wider relative z-10
              [text-shadow:_0_0_30px_rgb(251_191_36_/_50%),_0_2px_4px_rgb(0_0_0_/_80%)]">
              Gothic UI System
            </h1>
            {/* Decorative underline */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-64 h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-amber-600/50 to-transparent" />
          </div>
          <p className="text-slate-400 font-serif text-lg">
            Production-Ready Dark Fantasy Components
          </p>
        </div>

        {/* Buttons Section */}
        <section className="space-y-8">
          <SectionHeader icon={<Sparkles className="w-6 h-6" />} title="Action Buttons" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <DiabloButton
              variant="gold"
              icon={<Crown className="w-5 h-5" />}
              onClick={() => setActiveButton('gold')}
            >
              Golden Action
            </DiabloButton>

            <DiabloButton
              variant="red"
              icon={<Flame className="w-5 h-5" />}
              onClick={() => setActiveButton('red')}
            >
              Danger Action
            </DiabloButton>

            <DiabloButton
              variant="purple"
              icon={<Moon className="w-5 h-5" />}
              onClick={() => setActiveButton('purple')}
            >
              Magic Action
            </DiabloButton>

            <DiabloButton
              variant="blue"
              icon={<Shield className="w-5 h-5" />}
              onClick={() => setActiveButton('blue')}
            >
              Defense Action
            </DiabloButton>

            <DiabloButton
              variant="green"
              icon={<Target className="w-5 h-5" />}
              onClick={() => setActiveButton('green')}
            >
              Success Action
            </DiabloButton>

            <DiabloButton
              variant="gray"
              icon={<Skull className="w-5 h-5" />}
              onClick={() => setActiveButton('gray')}
            >
              Neutral Action
            </DiabloButton>
          </div>
        </section>

        {/* Panels Section */}
        <section className="space-y-8">
          <SectionHeader icon={<Award className="w-6 h-6" />} title="Content Panels" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DiabloPanel variant="gold" title="Character Stats">
              <div className="space-y-4">
                <StatBar label="Health" value={850} max={1000} color="red" />
                <StatBar label="Mana" value={420} max={500} color="blue" />
                <StatBar label="Stamina" value={750} max={800} color="green" />
              </div>
            </DiabloPanel>

            <DiabloPanel variant="red" title="Active Effects">
              <div className="space-y-2">
                <EffectBadge icon={<Flame />} label="Burning" stacks={3} />
                <EffectBadge icon={<Shield />} label="Protected" stacks={1} />
                <EffectBadge icon={<Zap />} label="Empowered" stacks={2} />
              </div>
            </DiabloPanel>

            <DiabloPanel variant="purple" title="Inventory">
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square border-2 border-purple-500/30 bg-purple-950/20
                      hover:border-purple-400/60 hover:bg-purple-900/30 transition-all cursor-pointer
                      flex items-center justify-center text-purple-500/30 text-xs"
                  >
                    {i === 0 && <Sword className="w-6 h-6 text-purple-400" />}
                    {i === 1 && <Shield className="w-6 h-6 text-blue-400" />}
                    {i === 2 && <Crown className="w-6 h-6 text-amber-400" />}
                  </div>
                ))}
              </div>
            </DiabloPanel>

            <DiabloPanel variant="blue" title="Quest Log">
              <div className="space-y-3">
                <QuestItem
                  title="Defeat the Marked"
                  progress={2}
                  total={3}
                  status="active"
                />
                <QuestItem
                  title="Protect the Innocent"
                  progress={5}
                  total={5}
                  status="complete"
                />
                <QuestItem
                  title="Discover the Truth"
                  progress={0}
                  total={1}
                  status="locked"
                />
              </div>
            </DiabloPanel>
          </div>
        </section>

        {/* Modal Example */}
        <section className="space-y-8">
          <SectionHeader icon={<Mountain className="w-6 h-6" />} title="Dialog / Modal" />

          <DiabloModal>
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <Crown className="w-16 h-16 mx-auto text-amber-400" />
                <h2 className="text-3xl font-cinzel text-amber-200">The Whitefire Covenant</h2>
                <p className="text-sm text-slate-400 font-cinzel tracking-widest uppercase">
                  A Sacred Contract
                </p>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

              <div className="space-y-4 text-slate-300 font-serif">
                <p>
                  Fifteen travelers stand at the threshold of fate. The mountain spirit has spoken:
                  only truth shall break the storm.
                </p>
                <p>
                  Three souls bear the mark of harvest. Twelve seek salvation.
                  All must choose: sacrifice or damnation.
                </p>
              </div>

              <div className="flex gap-4">
                <DiabloButton variant="gold" icon={<ChevronRight className="w-4 h-4" />}>
                  Accept Contract
                </DiabloButton>
                <DiabloButton variant="gray" icon={<X className="w-4 h-4" />}>
                  Decline
                </DiabloButton>
              </div>
            </div>
          </DiabloModal>
        </section>

        {/* Navigation Example */}
        <section className="space-y-8">
          <SectionHeader icon={<Target className="w-6 h-6" />} title="Navigation" />

          <DiabloNavigation />
        </section>
      </div>
    </div>
  );
}

/**
 * Section Header Component
 */
function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="p-2 bg-amber-500/10 border border-amber-500/30 text-amber-400">
        {icon}
      </div>
      <h2 className="text-2xl font-cinzel text-amber-200 tracking-wide">{title}</h2>
      <div className="flex-1 h-px bg-gradient-to-r from-amber-500/30 to-transparent" />
    </div>
  );
}

/**
 * Diablo-style Button
 */
interface DiabloButtonProps {
  children: React.ReactNode;
  variant: 'gold' | 'red' | 'purple' | 'blue' | 'green' | 'gray';
  icon?: React.ReactNode;
  onClick?: () => void;
}

function DiabloButton({ children, variant, icon, onClick }: DiabloButtonProps) {
  const variants = {
    gold: {
      bg: 'bg-gradient-to-b from-amber-600 via-amber-700 to-amber-900',
      border: 'border-amber-500/60',
      shadow: 'shadow-[0_0_20px_rgba(217,119,6,0.3)]',
      hover: 'hover:from-amber-500 hover:via-amber-600 hover:to-amber-800 hover:shadow-[0_0_30px_rgba(217,119,6,0.5)]',
      text: 'text-amber-50',
    },
    red: {
      bg: 'bg-gradient-to-b from-red-700 via-red-800 to-red-950',
      border: 'border-red-500/60',
      shadow: 'shadow-[0_0_20px_rgba(185,28,28,0.3)]',
      hover: 'hover:from-red-600 hover:via-red-700 hover:to-red-900 hover:shadow-[0_0_30px_rgba(185,28,28,0.5)]',
      text: 'text-red-50',
    },
    purple: {
      bg: 'bg-gradient-to-b from-purple-700 via-purple-800 to-purple-950',
      border: 'border-purple-500/60',
      shadow: 'shadow-[0_0_20px_rgba(126,34,206,0.3)]',
      hover: 'hover:from-purple-600 hover:via-purple-700 hover:to-purple-900 hover:shadow-[0_0_30px_rgba(126,34,206,0.5)]',
      text: 'text-purple-50',
    },
    blue: {
      bg: 'bg-gradient-to-b from-blue-700 via-blue-800 to-blue-950',
      border: 'border-blue-500/60',
      shadow: 'shadow-[0_0_20px_rgba(29,78,216,0.3)]',
      hover: 'hover:from-blue-600 hover:via-blue-700 hover:to-blue-900 hover:shadow-[0_0_30px_rgba(29,78,216,0.5)]',
      text: 'text-blue-50',
    },
    green: {
      bg: 'bg-gradient-to-b from-green-700 via-green-800 to-green-950',
      border: 'border-green-500/60',
      shadow: 'shadow-[0_0_20px_rgba(21,128,61,0.3)]',
      hover: 'hover:from-green-600 hover:via-green-700 hover:to-green-900 hover:shadow-[0_0_30px_rgba(21,128,61,0.5)]',
      text: 'text-green-50',
    },
    gray: {
      bg: 'bg-gradient-to-b from-slate-700 via-slate-800 to-slate-950',
      border: 'border-slate-500/60',
      shadow: 'shadow-[0_0_20px_rgba(71,85,105,0.3)]',
      hover: 'hover:from-slate-600 hover:via-slate-700 hover:to-slate-900 hover:shadow-[0_0_30px_rgba(71,85,105,0.5)]',
      text: 'text-slate-50',
    },
  };

  const v = variants[variant];

  return (
    <button
      onClick={onClick}
      className={`
        relative group px-6 py-3
        ${v.bg} ${v.border} ${v.text}
        border-2 border-t-4 border-b
        ${v.shadow} ${v.hover}
        font-cinzel tracking-wider text-sm uppercase
        transition-all duration-300
        active:translate-y-0.5 active:shadow-none

        before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/10 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity

        after:absolute after:inset-x-0 after:top-0 after:h-px after:bg-white/20
      `}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {icon}
        {children}
      </span>

      {/* Corner accents */}
      <span className="absolute top-0 left-0 w-1 h-1 bg-white/40" />
      <span className="absolute top-0 right-0 w-1 h-1 bg-white/40" />
      <span className="absolute bottom-0 left-0 w-1 h-1 bg-black/40" />
      <span className="absolute bottom-0 right-0 w-1 h-1 bg-black/40" />
    </button>
  );
}

/**
 * Diablo-style Panel
 */
interface DiabloPanelProps {
  children: React.ReactNode;
  variant: 'gold' | 'red' | 'purple' | 'blue';
  title: string;
}

function DiabloPanel({ children, variant, title }: DiabloPanelProps) {
  const variants = {
    gold: {
      border: 'border-amber-600/40',
      titleBg: 'bg-gradient-to-r from-amber-900/80 to-amber-800/60',
      titleText: 'text-amber-200',
      glow: 'shadow-[inset_0_0_20px_rgba(217,119,6,0.1)]',
    },
    red: {
      border: 'border-red-600/40',
      titleBg: 'bg-gradient-to-r from-red-900/80 to-red-800/60',
      titleText: 'text-red-200',
      glow: 'shadow-[inset_0_0_20px_rgba(185,28,28,0.1)]',
    },
    purple: {
      border: 'border-purple-600/40',
      titleBg: 'bg-gradient-to-r from-purple-900/80 to-purple-800/60',
      titleText: 'text-purple-200',
      glow: 'shadow-[inset_0_0_20px_rgba(126,34,206,0.1)]',
    },
    blue: {
      border: 'border-blue-600/40',
      titleBg: 'bg-gradient-to-r from-blue-900/80 to-blue-800/60',
      titleText: 'text-blue-200',
      glow: 'shadow-[inset_0_0_20px_rgba(29,78,216,0.1)]',
    },
  };

  const v = variants[variant];

  return (
    <div className={`
      border-4 ${v.border} ${v.glow}
      bg-gradient-to-br from-slate-900/90 via-slate-950/95 to-black/90
      backdrop-blur-sm
    `}>
      {/* Title bar */}
      <div className={`
        ${v.titleBg} ${v.titleText}
        px-4 py-2 border-b-2 ${v.border}
        font-cinzel tracking-wider uppercase text-sm
        flex items-center justify-between
      `}>
        <span>{title}</span>
        <ChevronRight className="w-4 h-4 opacity-50" />
      </div>

      {/* Content */}
      <div className="p-6">
        {children}
      </div>

      {/* Corner decorations */}
      <span className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-white/20" />
      <span className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-white/20" />
      <span className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-white/20" />
      <span className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-white/20" />
    </div>
  );
}

/**
 * Modal Component
 */
function DiabloModal({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="
        relative
        border-4 border-amber-600/60
        bg-gradient-to-br from-slate-900 via-slate-950 to-black
        shadow-[0_0_60px_rgba(217,119,6,0.3),inset_0_0_40px_rgba(0,0,0,0.5)]
        p-8
      ">
        {/* Decorative corners */}
        <div className="absolute -top-3 -left-3 w-6 h-6 border-t-4 border-l-4 border-amber-500" />
        <div className="absolute -top-3 -right-3 w-6 h-6 border-t-4 border-r-4 border-amber-500" />
        <div className="absolute -bottom-3 -left-3 w-6 h-6 border-b-4 border-l-4 border-amber-500" />
        <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b-4 border-r-4 border-amber-500" />

        {children}
      </div>
    </div>
  );
}

/**
 * Navigation Component
 */
function DiabloNavigation() {
  const tabs = [
    { icon: <Sword />, label: 'Combat' },
    { icon: <Shield />, label: 'Defense' },
    { icon: <Crown />, label: 'Character' },
    { icon: <Target />, label: 'Skills' },
  ];

  return (
    <div className="flex gap-2 bg-slate-950/50 p-2 border-2 border-slate-700/50">
      {tabs.map((tab, i) => (
        <button
          key={i}
          className="
            flex-1 flex items-center justify-center gap-2 px-4 py-3
            bg-gradient-to-b from-slate-700 to-slate-800
            border-2 border-slate-600/60
            hover:from-amber-700 hover:to-amber-800 hover:border-amber-500/60
            text-slate-300 hover:text-amber-100
            font-cinzel text-sm uppercase tracking-wider
            transition-all duration-300
            active:translate-y-0.5
          "
        >
          <span className="w-5 h-5">{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </div>
  );
}

/**
 * Helper Components
 */
function StatBar({ label, value, max, color }: { label: string; value: number; max: number; color: 'red' | 'blue' | 'green' }) {
  const percentage = (value / max) * 100;
  const colors = {
    red: 'bg-red-600',
    blue: 'bg-blue-600',
    green: 'bg-green-600',
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-slate-400 font-cinzel">
        <span>{label}</span>
        <span>{value} / {max}</span>
      </div>
      <div className="h-3 bg-slate-950 border border-slate-700">
        <div
          className={`h-full ${colors[color]} transition-all duration-300 shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)]`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function EffectBadge({ icon, label, stacks }: { icon: React.ReactNode; label: string; stacks: number }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2 bg-slate-900/50 border border-slate-700/50 hover:border-amber-500/30 transition-colors">
      <div className="w-8 h-8 flex items-center justify-center text-amber-400">
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-sm text-slate-200 font-cinzel">{label}</div>
      </div>
      <div className="px-2 py-0.5 bg-slate-800 border border-slate-600 text-xs text-slate-300 font-bold">
        x{stacks}
      </div>
    </div>
  );
}

function QuestItem({ title, progress, total, status }: { title: string; progress: number; total: number; status: 'active' | 'complete' | 'locked' }) {
  const statusColors = {
    active: 'border-blue-500/40 text-blue-300',
    complete: 'border-green-500/40 text-green-300',
    locked: 'border-slate-600/40 text-slate-500',
  };

  return (
    <div className={`p-3 border-2 ${statusColors[status]} bg-slate-950/30`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-cinzel">{title}</span>
        <span className="text-xs">{progress}/{total}</span>
      </div>
      <div className="h-1 bg-slate-900 border border-slate-800">
        <div
          className="h-full bg-current transition-all duration-300"
          style={{ width: `${(progress / total) * 100}%` }}
        />
      </div>
    </div>
  );
}
