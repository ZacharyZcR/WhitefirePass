/**
 * Top HUD: crest · phase plaque · head count · menu buttons.
 */

'use client';

import {
  BookOpen,
  Brain,
  Eye,
  EyeOff,
  Feather,
  Menu,
  Moon,
  Mountain,
  ScrollText,
  Sparkles,
  Sun,
  Users,
  Vote,
} from 'lucide-react';
import type { GameState } from '@/types/game';
import { PHASE_LABELS } from '@/lib/latin-text';
import {
  NIGHT_PHASE_NAME,
  PHASE_NAME,
  getActingPlayers,
  isHarvest,
  isNightScene,
  toHanzi,
} from '@/lib/design-tokens';
import { HudButton } from './HudButton';
import { useGodView } from '@/hooks/useGodView';
import { VolumeControl } from './VolumeControl';
import type { LedgerTab } from './Ledger';

const PHASE_ICON = {
  prologue: Mountain,
  setup: Mountain,
  day: Sun,
  voting: Vote,
  event: Sparkles,
  night: Moon,
  end: Feather,
} as const;

function PhasePlaque({ state }: { state: GameState }) {
  const { phase, round, nightPhase } = state;
  const Icon = PHASE_ICON[phase];
  const isPrologue = phase === 'prologue' || phase === 'setup';
  const day = `第${toHanzi(round)}${isNightScene(phase) && phase !== 'end' ? '夜' : '日'}`;
  const actors = getActingPlayers(state);
  const speaking = phase === 'day' || phase === 'voting' || phase === 'night';

  const detail = [
    phase === 'night' && nightPhase ? NIGHT_PHASE_NAME[nightPhase] : null,
    phase === 'day' && state.isGathering ? '自我介绍' : null,
    phase === 'voting' && !state.ballot ? '黄昏议论' : null,
    state.lastWords ? `${state.lastWords} · 临终` : null,
    state.mourners?.length ? '死后' : null,
    state.isRevote && phase !== 'night' ? '平票重议' : null,
    speaking && actors.length > 0
      ? `${Math.min(state.currentPlayerIndex, actors.length)} / ${actors.length}`
      : null,
  ].filter(Boolean);

  return (
    <div className="relative flex items-center gap-4 border-y border-brass/25 bg-ink/50 px-8 py-1.5">
      <span className="absolute -left-1.5 top-1/2 h-3 w-3 -translate-y-1/2 rotate-45 border border-brass/50 bg-ink" />
      <span className="absolute -right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 rotate-45 border border-brass/50 bg-ink" />
      <Icon className="h-5 w-5 animate-flicker text-pyre" strokeWidth={1.25} />
      <div className="text-center leading-tight">
        <div className="font-serif text-base font-semibold tracking-[0.25em] text-parchment">
          {isPrologue ? '序章' : `${day} · ${PHASE_NAME[phase]}`}
        </div>
        <div className="font-latin text-[11px] italic tracking-wider text-brass/70">
          {PHASE_LABELS[phase].latin}
          {detail.length > 0 && (
            <span className="not-italic text-frost-dim">
              {' '}
              — {detail.join(' · ')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function HeadCount({ state }: { state: GameState }) {
  const godView = useGodView((s) => s.godView);
  const alive = state.players.filter((p) => p.isAlive);
  const harvest = alive.filter((p) => isHarvest(p.role)).length;
  const lambs = alive.length - harvest;
  return (
    <div className="flex items-center gap-4 font-serif">
      <Stat
        label="存活"
        value={`${alive.length}`}
        sub={`/${state.players.length}`}
      />
      {godView && <FactionCount lambs={lambs} harvest={harvest} />}
    </div>
  );
}

// 阵营人数会泄露谁死了是不是烙印者，只在上帝视角下显示
function FactionCount({ lambs, harvest }: { lambs: number; harvest: number }) {
  return (
    <>
      <div className="h-7 w-px bg-brass/20" />
      <Stat label="羔羊" value={`${lambs}`} tone="text-frost" />
      <Stat label="收割" value={`${harvest}`} tone="text-seal-light" />
      <div
        className="flex h-1 w-20 overflow-hidden rounded-full bg-ink-600"
        title="羔羊 / 收割"
      >
        <div
          className="bg-frost-dim transition-all duration-700"
          style={{ width: `${(lambs / Math.max(lambs + harvest, 1)) * 100}%` }}
        />
        <div className="flex-1 bg-seal-light" />
      </div>
    </>
  );
}

function Stat({
  label,
  value,
  sub,
  tone = 'text-parchment',
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: string;
}) {
  return (
    <div className="flex flex-col items-center leading-none">
      <span className="text-[10px] tracking-[0.3em] text-frost-dim">
        {label}
      </span>
      <span className={`mt-1 font-cinzel text-lg ${tone}`}>
        {value}
        {sub && <span className="text-xs text-frost-dim">{sub}</span>}
      </span>
    </div>
  );
}

interface TopHudProps {
  state: GameState;
  unreadClues: number;
  ledgerTab: LedgerTab | null;
  onLedger: (tab: LedgerTab) => void;
  onTravelers: () => void;
  onOracle: () => void;
  onMenu: () => void;
  bgm: React.ComponentProps<typeof VolumeControl>;
}

function GodViewButton() {
  const { godView, toggleGodView } = useGodView();
  return (
    <HudButton
      icon={godView ? Eye : EyeOff}
      label={
        godView
          ? '上帝视角：开（看得见所有身份）'
          : '上帝视角：关（只看得见在场的人看得见的）'
      }
      active={godView}
      onClick={toggleGodView}
    />
  );
}

export function TopHud({
  state,
  unreadClues,
  ledgerTab,
  onLedger,
  onTravelers,
  onOracle,
  onMenu,
  bgm,
}: TopHudProps) {
  return (
    <header className="relative z-20 grid grid-cols-[1fr_auto_1fr] items-center gap-6 px-5 py-2.5">
      <div className="flex items-center gap-5">
        <div className="hidden leading-none lg:block">
          <div className="text-brass-gradient font-serif text-xl font-black tracking-[0.35em]">
            白烬山口
          </div>
          <div className="mt-1 font-cinzel text-[9px] tracking-[0.45em] text-brass/50">
            WHITEFIRE PASS · 1913
          </div>
        </div>
        <HeadCount state={state} />
      </div>

      <PhasePlaque state={state} />

      <nav className="flex items-center justify-end gap-2">
        <HudButton
          icon={ScrollText}
          label="记录簿"
          active={ledgerTab === 'log'}
          onClick={() => onLedger('log')}
        />
        <HudButton
          icon={Vote}
          label="票决与查验"
          active={ledgerTab === 'votes'}
          onClick={() => onLedger('votes')}
        />
        <HudButton
          icon={BookOpen}
          label="线索"
          badge={unreadClues}
          active={ledgerTab === 'clues'}
          onClick={() => onLedger('clues')}
        />
        <span className="mx-1 h-5 w-px bg-brass/20" />
        <HudButton icon={Users} label="旅者档案" onClick={onTravelers} />
        <HudButton icon={Brain} label="神谕指引（提示词）" onClick={onOracle} />
        <GodViewButton />
        <VolumeControl {...bgm} />
        <HudButton icon={Menu} label="菜单 · 存档 · 设置" onClick={onMenu} />
      </nav>
    </header>
  );
}
