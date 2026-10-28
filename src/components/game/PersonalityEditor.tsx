/**
 * 旅者卷宗：画廊（十五张肖像）+ 每个人的卷宗（立绘、生平、自述、自传、关系）。
 * 身份只在上帝视角下出现；卷宗之间可以用 ← → 翻页。
 */

'use client';

import { useEffect, useState } from 'react';
import {
  BookOpen,
  Cake,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Coins,
  Droplet,
  Feather,
  Handshake,
  Heart,
  HeartCrack,
  Link2,
  Ruler,
  Skull,
  Sparkle,
  Swords,
  User as UserIcon,
  Users,
  type LucideIcon,
} from 'lucide-react';
import type {
  CharacterRelationship,
  DeathRecord,
  GameState,
  Player,
} from '@/types/game';
import { useGameStore } from '@/stores/game-store';
import { useGodView } from '@/hooks/useGodView';
import { DEBT_TIES, HATRED, HATRED_TITLE } from '@/lib/hatred';
import { debtsOf } from '@/lib/sins';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  artSrc,
  isHarvestNow,
  roleInfo,
  toHanzi,
  toRoman,
} from '@/lib/design-tokens';
import {
  getRelationshipLabel,
  getRelationshipsForCharacter,
} from '@/lib/relationships';
import {
  getStateChangeDescription,
  type StateChangeDescription,
} from '@/lib/emotional-prompts';
import { getCharacterAutobiographies } from '@/lib/character-autobiographies';
import { Portrait } from './Portrait';
import {
  FrameFlourish,
  OrnamentRule,
  RoleSigil,
  SeatMedallion,
} from './Sigils';

interface PersonalityEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Jump straight to this traveler's dossier when opening */
  focusPlayerId?: string | null;
}

type Filter = 'all' | 'alive' | 'dead';

const RELATION_ICON: Record<CharacterRelationship['type'], LucideIcon> = {
  sibling: Users,
  lover: Heart,
  crush: HeartCrack,
  rival: Swords,
  debtor: Coins,
  acquaintance: Handshake,
};

const MOOD = {
  virtue: { label: '美德', className: 'border-pyre/50 text-pyre' },
  vice: { label: '堕落', className: 'border-seal-light/60 text-seal-light' },
} as const;

const deathOf = (state: GameState, name: string): DeathRecord | undefined =>
  state.deathLog?.find((d) => d.name === name);
const deathText = (d: DeathRecord) =>
  d.cause === 'night'
    ? `殁于第${toHanzi(d.round)}夜`
    : `第${toHanzi(d.round)}日被献祭`;

export function PersonalityEditor({
  open,
  onOpenChange,
  focusPlayerId,
}: PersonalityEditorProps) {
  const { gameState } = useGameStore();
  const godView = useGodView((s) => s.godView);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    if (open) setSelectedId(focusPlayerId ?? null);
  }, [open, focusPlayerId]);

  const players = gameState?.players ?? [];
  const index = players.findIndex((p) => p.id === selectedId);
  const selected = index >= 0 ? players[index] : null;
  const step = (delta: number) =>
    setSelectedId(
      players[(index + delta + players.length) % players.length].id
    );

  // 卷宗里用 ← → 翻到上一位、下一位
  useEffect(() => {
    if (!open || !selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!gameState) return null;

  const shown = players.filter(
    (p) => filter === 'all' || (filter === 'alive' ? p.isAlive : !p.isAlive)
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setSelectedId(null);
        onOpenChange(next);
      }}
    >
      <DialogContent className="flex max-h-[90vh] max-w-6xl flex-col overflow-hidden p-0">
        <header className="flex flex-shrink-0 items-end justify-between gap-6 border-b border-brass/15 px-8 pb-4 pt-6">
          <div>
            <div className="font-latin text-xs italic tracking-[0.4em] text-brass/60">
              Registrum Viatorum
            </div>
            <DialogTitle className="mt-1 font-serif text-2xl font-black tracking-[0.4em] text-parchment">
              {selected ? '旅者卷宗' : '旅者名册'}
            </DialogTitle>
            <DialogDescription className="mt-1 font-serif text-xs tracking-[0.2em] text-frost-dim">
              {selected ? (
                <button
                  onClick={() => setSelectedId(null)}
                  className="inline-flex items-center gap-1 text-brass hover:text-brass-light"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  回到名册
                  <span className="ml-3 text-frost-dim/60">← → 翻阅</span>
                </button>
              ) : (
                `十五位旅者，${players.filter((p) => p.isAlive).length} 人尚在人世`
              )}
            </DialogDescription>
          </div>
          {!selected && <FilterBar value={filter} onChange={setFilter} />}
          {selected && (
            <div className="flex items-center gap-2">
              <NavButton
                label="上一位"
                onClick={() => step(-1)}
                icon={ChevronLeft}
              />
              <span className="font-cinzel text-xs tracking-widest text-brass/70">
                {toRoman(index + 1)} / {toRoman(players.length)}
              </span>
              <NavButton
                label="下一位"
                onClick={() => step(1)}
                icon={ChevronRight}
              />
            </div>
          )}
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {selected ? (
            <Dossier
              key={selected.id}
              state={gameState}
              player={selected}
              seat={index + 1}
              godView={godView}
              onOpen={setSelectedId}
            />
          ) : (
            <div className="grid grid-cols-3 gap-4 p-8 sm:grid-cols-4 lg:grid-cols-5">
              {shown.map((p) => (
                <GalleryCard
                  key={p.id}
                  player={p}
                  seat={players.indexOf(p) + 1}
                  death={deathOf(gameState, p.name)}
                  godView={godView}
                  harvest={godView && isHarvestNow(p.role, gameState.round)}
                  onClick={() => setSelectedId(p.id)}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FilterBar({
  value,
  onChange,
}: {
  value: Filter;
  onChange: (f: Filter) => void;
}) {
  const options: [Filter, string][] = [
    ['all', '全部'],
    ['alive', '尚在'],
    ['dead', '已殁'],
  ];
  return (
    <div className="flex rounded-sm border border-brass/25 bg-black/30 p-0.5 font-serif text-xs tracking-[0.3em]">
      {options.map(([key, label]) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={cn(
            'px-3 py-1 transition-colors',
            value === key
              ? 'bg-brass/20 text-parchment'
              : 'text-frost-dim hover:text-parchment'
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function NavButton({
  label,
  icon: Icon,
  onClick,
}: {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-brass/30 text-brass transition-colors hover:border-brass hover:bg-brass/10"
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

function GalleryCard({
  player,
  seat,
  death,
  godView,
  harvest,
  onClick,
}: {
  player: Player;
  seat: number;
  death?: DeathRecord;
  godView: boolean;
  harvest: boolean;
  onClick: () => void;
}) {
  const role = roleInfo(player.role);
  const mood =
    player.emotionalState && player.emotionalState !== 'normal'
      ? MOOD[player.emotionalState]
      : null;
  const relations = getRelationshipsForCharacter(player.name).length;
  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-sm border border-brass/25 bg-ink-800 text-left shadow-[0_6px_20px_rgba(0,0,0,0.5)] transition-all duration-300 hover:-translate-y-1 hover:border-brass/70 hover:shadow-[0_14px_34px_rgba(0,0,0,0.65)]"
    >
      <Portrait
        name={player.name}
        dead={!player.isAlive}
        harvest={harvest}
        className="aspect-[832/1216] w-full"
        imgClassName="transition-transform duration-700 group-hover:scale-[1.04]"
      />
      <FrameFlourish className="opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <SeatMedallion
        numeral={toRoman(seat)}
        className="absolute left-2 top-2"
      />

      <div className="absolute right-2 top-2 flex flex-col items-end gap-1">
        {godView && (
          <span
            className="flex h-7 w-7 items-center justify-center rounded-full border bg-black/60"
            style={{ color: role.color, borderColor: `${role.color}80` }}
            title={role.name}
          >
            <RoleSigil role={player.role} className="h-4 w-4" />
          </span>
        )}
        {mood && (
          <span
            className={cn(
              'rounded-sm border bg-black/60 px-1.5 text-[10px] tracking-widest',
              mood.className
            )}
          >
            {mood.label}
          </span>
        )}
      </div>

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/75 to-transparent px-3 pb-2.5 pt-10">
        <div
          className={cn(
            'font-serif text-sm font-semibold tracking-wider text-parchment',
            !player.isAlive &&
              'line-through decoration-seal-light/70 opacity-70'
          )}
        >
          {player.name}
        </div>
        <div className="mt-0.5 flex items-center justify-between gap-2 text-[10px] text-frost-dim">
          <span className="truncate">
            {death ? deathText(death) : player.occupation}
          </span>
          {relations > 0 && (
            <span
              className="flex flex-shrink-0 items-center gap-0.5 text-brass/70"
              title={`${relations} 段牵连`}
            >
              <Link2 className="h-3 w-3" />
              {relations}
            </span>
          )}
        </div>
      </div>
      {death && (
        <Skull
          className="absolute bottom-12 right-2.5 h-4 w-4 text-seal-light/80"
          aria-label="已殁"
        />
      )}
    </button>
  );
}

function Dossier({
  state,
  player,
  seat,
  godView,
  onOpen,
}: {
  state: GameState;
  player: Player;
  seat: number;
  godView: boolean;
  onOpen: (id: string) => void;
}) {
  const role = roleInfo(player.role);
  const death = deathOf(state, player.name);
  // 上帝视角下的烙印者：第三夜之后，欠他血债的人置顶，旧关系翻过来
  const debts = godView && player.role === 'marked' ? debtsOf(player.name) : [];
  const relations = getRelationshipsForCharacter(player.name).filter(
    (r) => !debts.some((d) => d.target === r.target)
  );
  const oldTie = (target: string) =>
    getRelationshipsForCharacter(player.name).find((r) => r.target === target);
  const chapters = getCharacterAutobiographies(player.name);
  const facts: [LucideIcon, string, string | undefined][] = [
    [
      Cake,
      '年岁',
      player.age
        ? `${player.age} 岁 · 生于 ${1913 - player.age} 年`
        : undefined,
    ],
    [UserIcon, '性别', player.gender],
    [Feather, '营生', player.occupation],
    [Sparkle, '性情', player.trait],
    [Ruler, '身高', player.height],
    [Droplet, '血型', player.bloodType],
  ];

  return (
    <div className="grid gap-8 p-8 duration-500 animate-in fade-in lg:grid-cols-[260px_1fr]">
      <aside className="space-y-4">
        <div className="relative">
          <Portrait
            name={player.name}
            dead={!player.isAlive}
            harvest={godView && isHarvestNow(player.role, state.round)}
            className="brass-frame aspect-[832/1216] w-full"
          />
          <FrameFlourish />
          <SeatMedallion
            numeral={toRoman(seat)}
            className="absolute left-3 top-3 scale-110"
          />
        </div>

        <div className="text-center">
          <h3
            className={cn(
              'font-serif text-3xl font-black tracking-[0.2em] text-parchment',
              !player.isAlive && 'line-through decoration-seal-light/60'
            )}
          >
            {player.name}
          </h3>
          {player.englishName && (
            <div className="mt-1 font-cinzel text-sm uppercase tracking-[0.3em] text-brass">
              {player.englishName}
            </div>
          )}
          <OrnamentRule className="mt-3" />
          <div
            className={cn(
              'mt-3 inline-flex items-center gap-1.5 font-serif text-sm tracking-[0.3em]',
              death ? 'text-seal-light' : 'text-pyre-soft'
            )}
          >
            {death ? (
              <Skull className="h-4 w-4" />
            ) : (
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-pyre-soft" />
            )}
            {death ? deathText(death) : '尚在人世'}
          </div>
          {godView && (
            <div
              className="mt-3 flex items-center justify-center gap-2 font-serif text-sm tracking-[0.2em]"
              style={{ color: role.color }}
            >
              <RoleSigil role={player.role} className="h-5 w-5" />
              {role.name}
              <span className="font-cinzel text-[10px] tracking-widest opacity-70">
                {role.en}
              </span>
            </div>
          )}
        </div>

        <dl className="grid grid-cols-2 gap-x-3 gap-y-2.5 border-y border-brass/15 py-3 text-xs">
          {facts
            .filter(([, , v]) => v)
            .map(([Icon, label, value]) => (
              <div
                key={label}
                className={cn('min-w-0', label === '年岁' && 'col-span-2')}
              >
                <dt className="flex items-center gap-1.5 font-serif tracking-widest text-frost-dim">
                  <Icon className="h-3 w-3 text-brass/60" />
                  {label}
                </dt>
                <dd className="mt-0.5 truncate font-serif text-sm text-parchment">
                  {value}
                </dd>
              </div>
            ))}
        </dl>
      </aside>

      <Tabs defaultValue="self" className="min-w-0">
        <TabsList className="mb-5 grid w-full grid-cols-3 border border-brass/20 bg-black/30">
          <DossierTab value="self" icon={Feather} label="自述" />
          <DossierTab
            value="past"
            icon={BookOpen}
            label="往事"
            count={chapters.length}
          />
          <DossierTab
            value="ties"
            icon={Link2}
            label="牵连"
            count={debts.length + relations.length}
          />
        </TabsList>

        <TabsContent value="self">
          <Parchment>
            <PersonaText text={player.personality ?? ''} />
            {godView && player.role === 'marked' && HATRED[player.name] && (
              <div className="mt-6 border-t border-seal/30 pt-5">
                <h4 className="mb-3 font-serif text-base font-bold tracking-[0.3em] text-seal">
                  {HATRED_TITLE}
                </h4>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={artSrc(`chosen/${encodeURIComponent(player.name)}`)}
                  alt=""
                  className="mb-4 aspect-[1216/832] w-full rounded-sm object-cover object-[center_20%] shadow-[0_4px_18px_rgba(90,10,10,0.45)]"
                />

                <p className="whitespace-pre-line font-serif text-[15px] leading-[1.95] text-seal">
                  {HATRED[player.name]}
                </p>
              </div>
            )}
          </Parchment>
        </TabsContent>

        <TabsContent value="past" className="space-y-5">
          {chapters.map((c, i) => (
            <Parchment key={c.title}>
              <div className="mb-3 flex items-baseline gap-3">
                <span className="font-cinzel text-sm tracking-widest text-[#8a6a3c]">
                  {toRoman(i + 1)}.
                </span>
                <h4 className="font-serif text-lg font-bold tracking-[0.15em] text-[#2a1f12]">
                  {c.title}
                </h4>
              </div>
              <p className="whitespace-pre-line font-serif text-[15px] leading-[1.95] text-[#3d2f1c]">
                {c.content}
              </p>
            </Parchment>
          ))}
          {chapters.length === 0 && (
            <Empty icon={BookOpen} text="没有留下往事" />
          )}
        </TabsContent>

        <TabsContent value="ties" className="space-y-3">
          {debts.map((d) => (
            <DebtRow
              key={d.target}
              state={state}
              owner={player.name}
              debt={d}
              was={oldTie(d.target)}
              onOpen={onOpen}
            />
          ))}
          {relations.map((rel) => (
            <RelationRow
              key={rel.target}
              state={state}
              owner={player.name}
              rel={rel}
              stone={debts.length > 0}
              onOpen={onOpen}
            />
          ))}
          {debts.length + relations.length === 0 && (
            <Empty icon={Users} text="与旁人没有牵连" />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DossierTab({
  value,
  icon: Icon,
  label,
  count,
}: {
  value: string;
  icon: LucideIcon;
  label: string;
  count?: number;
}) {
  return (
    <TabsTrigger
      value={value}
      className="gap-2 font-serif tracking-[0.3em] data-[state=active]:bg-brass/15 data-[state=active]:text-parchment"
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
      {count ? (
        <span className="font-cinzel text-[10px] text-brass/70">
          {toRoman(count)}
        </span>
      ) : null}
    </TabsTrigger>
  );
}

/** 羊皮纸：旧纸色底、焦边、细颗粒 */
function Parchment({ children }: { children: React.ReactNode }) {
  return (
    <article className="relative overflow-hidden rounded-sm bg-gradient-to-br from-[#e9dcbd] via-[#e2d2ad] to-[#cdb88c] px-8 py-6 shadow-[0_10px_30px_rgba(0,0,0,0.55),inset_0_0_60px_rgba(120,85,40,0.35)]">
      <div className="grain pointer-events-none absolute inset-0 opacity-40" />
      <div className="relative">{children}</div>
    </article>
  );
}

/** 自述：去掉开头的【男性】【女性】标签，【小标题】单独成行，首段首字下沉 */
function PersonaText({ text }: { text: string }) {
  const paragraphs = text
    .replace(/^【[男女]性】/, '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (!paragraphs.length)
    return (
      <p className="font-serif italic text-[#6b5434]">没有留下只言片语。</p>
    );
  return (
    <div className="space-y-4 font-serif text-[15px] leading-[1.95] text-[#3d2f1c]">
      {paragraphs.map((p, i) => {
        const heading = /^【([^】]+)】$/.exec(p.split('\n')[0]);
        if (heading) {
          const rest = p.split('\n').slice(1).join('\n');
          return (
            <section key={i}>
              <h5 className="mb-1.5 mt-6 flex items-center gap-2 text-xs font-bold tracking-[0.4em] text-[#8a6a3c]">
                <span className="h-px w-6 bg-[#8a6a3c]/50" />
                {heading[1]}
              </h5>
              {rest && <p className="whitespace-pre-line">{rest}</p>}
            </section>
          );
        }
        return (
          <p
            key={i}
            className={cn(
              'whitespace-pre-line',
              i === 0 &&
                'first-letter:float-left first-letter:mr-2 first-letter:text-[3.2em] first-letter:font-black first-letter:leading-[0.9] first-letter:text-[#6b2d22]'
            )}
          >
            {p}
          </p>
        );
      })}
    </div>
  );
}

/** 第三夜翻过来的牵连：欠他血债的人，原来的关系划掉，写出真相 */
function DebtRow({
  state,
  owner,
  debt,
  was,
  onOpen,
}: {
  state: GameState;
  owner: string;
  debt: { target: string; truths: string[] };
  was?: CharacterRelationship;
  onOpen: (id: string) => void;
}) {
  const target = state.players.find((p) => p.name === debt.target);
  const wasLabel = was && (was.label || getRelationshipLabel(was.type));
  const now = DEBT_TIES[owner]?.[debt.target];
  return (
    <div className="rounded-sm border border-seal/50 bg-seal-dark/20 shadow-[inset_0_0_30px_rgba(120,20,20,0.25)]">
      <div className="flex items-start gap-4 p-3">
        <button
          onClick={() => target && onOpen(target.id)}
          className="group relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full border border-seal/60"
          title={`翻到 ${debt.target} 的卷宗`}
        >
          <Portrait
            name={debt.target}
            dead={target ? !target.isAlive : false}
            zoom={1.7}
            className="h-full w-full transition-transform group-hover:scale-110"
          />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-serif text-base font-semibold tracking-wider text-parchment">
              {debt.target}
            </span>
            <span className="rounded-sm border border-seal-light/60 bg-seal-dark/60 px-1.5 py-0.5 text-[11px] tracking-widest text-seal-light">
              {now?.label ?? '血债'}
            </span>
            {wasLabel && (
              <span className="text-[11px] tracking-widest text-frost-dim/60 line-through">
                {wasLabel}
              </span>
            )}
          </div>
          {was?.known && (
            <p className="mt-1.5 font-serif text-xs leading-relaxed text-parchment/40 line-through">
              {was.known}
            </p>
          )}
          <p className="mt-1.5 font-serif text-xs leading-relaxed text-[#e0645a]">
            {now?.line ?? debt.truths.join('')}
          </p>
          {now && (
            <p className="mt-1 font-serif text-[11px] leading-relaxed text-parchment/45">
              {debt.truths.join('')}
            </p>
          )}
          <div className="mt-2 font-serif text-[11px] tracking-widest text-seal-light/80">
            若 TA 死去：一笔账清了。
          </div>
        </div>
      </div>
    </div>
  );
}

function RelationRow({
  state,
  owner,
  rel,
  stone = false,
  onOpen,
}: {
  state: GameState;
  owner: string;
  rel: CharacterRelationship;
  /** 第三夜之后心如磐石：旧牵连作废 */
  stone?: boolean;
  onOpen: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const target = state.players.find((p) => p.name === rel.target);
  const Icon = RELATION_ICON[rel.type];
  const label = rel.label || getRelationshipLabel(rel.type);
  const calm = Math.max(0, 1 - rel.virtueChance - rel.viceChance);
  const virtue = getStateChangeDescription(owner, rel.target, 'virtue', label);
  const vice = getStateChangeDescription(owner, rel.target, 'vice', label);

  return (
    <div
      className={cn(
        'rounded-sm border border-brass/20 bg-black/25 transition-colors hover:border-brass/40',
        stone && 'opacity-50 grayscale'
      )}
    >
      <div className="flex items-center gap-4 p-3">
        <button
          onClick={() => target && onOpen(target.id)}
          className="group relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full border border-brass/40"
          title={`翻到 ${rel.target} 的卷宗`}
        >
          <Portrait
            name={rel.target}
            dead={target ? !target.isAlive : false}
            zoom={1.7}
            className="h-full w-full transition-transform group-hover:scale-110"
          />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-serif text-base font-semibold tracking-wider text-parchment">
              {rel.target}
            </span>
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-sm border border-brass/30 px-1.5 py-0.5 text-[11px] tracking-widest text-brass-light',
                stone && 'line-through'
              )}
            >
              <Icon className="h-3 w-3" />
              {label}
            </span>
            {stone && (
              <span className="text-[11px] tracking-[0.3em] text-frost-dim">
                心如磐石
              </span>
            )}
          </div>
          {rel.known && (
            <p
              className={cn(
                'mt-1.5 font-serif text-xs leading-relaxed text-parchment/75',
                stone && 'line-through'
              )}
            >
              {rel.known}
            </p>
          )}
          {stone ? (
            <div className="mt-2 font-serif text-[11px] tracking-widest text-frost-dim">
              若 TA 死去：无动于衷。
            </div>
          ) : (
            <>
              <div className="mt-2 text-[11px] text-frost-dim">
                若 TA 死去：
              </div>
              {/* 美德 · 平静 · 堕落 三段比例 */}
              <div className="mt-1 flex h-1.5 overflow-hidden rounded-full bg-ink-600">
                <div
                  className="bg-pyre"
                  style={{ width: `${rel.virtueChance * 100}%` }}
                />
                <div
                  className="bg-frost-dim/30"
                  style={{ width: `${calm * 100}%` }}
                />
                <div
                  className="bg-seal-light"
                  style={{ width: `${rel.viceChance * 100}%` }}
                />
              </div>
              <div className="mt-1 flex justify-between font-serif text-[10px] tracking-widest">
                <span className="text-pyre">
                  美德 {Math.round(rel.virtueChance * 100)}%
                </span>
                <span className="text-frost-dim/70">
                  平静 {Math.round(calm * 100)}%
                </span>
                <span className="text-seal-light">
                  堕落 {Math.round(rel.viceChance * 100)}%
                </span>
              </div>
            </>
          )}
        </div>
        {!stone && (
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="展开"
            className="self-start p-1 text-brass/60 hover:text-brass"
          >
            <ChevronDown
              className={cn(
                'h-4 w-4 transition-transform',
                open && 'rotate-180'
              )}
            />
          </button>
        )}
      </div>
      {open && !stone && (
        <div className="grid gap-3 border-t border-brass/10 p-3 sm:grid-cols-2">
          {rel.virtueChance > 0 && (
            <Outcome tone="text-pyre border-pyre/30 bg-pyre/5" {...virtue} />
          )}
          {rel.viceChance > 0 && (
            <Outcome
              tone="text-seal-light border-seal/40 bg-seal/10"
              {...vice}
            />
          )}
        </div>
      )}
    </div>
  );
}

function Outcome({
  tone,
  title,
  description,
  quote,
}: StateChangeDescription & { tone: string }) {
  return (
    <div className={cn('rounded-sm border p-3', tone)}>
      <div className="mb-1 font-serif text-sm font-semibold tracking-wider">
        {title}
      </div>
      <p className="font-serif text-xs leading-relaxed text-parchment/85">
        {description}
      </p>
      {quote && <p className="mt-2 font-serif text-xs italic">“{quote}”</p>}
    </div>
  );
}

function Empty({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <div className="py-16 text-center font-serif tracking-widest text-frost-dim">
      <Icon className="mx-auto mb-3 h-10 w-10 opacity-30" strokeWidth={1} />
      {text}
    </div>
  );
}
