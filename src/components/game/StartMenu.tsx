/**
 * Title screen - snow over the lodge window, the pale hearth, the contract.
 */

'use client';

import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FrameCorners } from '@/components/ui/dialog';
import { useGameStore } from '@/stores/game-store';
import { testApiKey, DEFAULT_API_URL } from '@/lib/deepseek';
import { cn } from '@/lib/utils';
import type { GameConfig } from '@/types/game';
import { SceneBackdrop } from './SceneBackdrop';

const DEFAULT_CONFIG: GameConfig = {
  playerCount: 15,
  roles: [
    'marked', 'marked', 'marked',
    'heretic',
    'listener',
    'coroner',
    'twin', 'twin',
    'guard',
    'innocent', 'innocent', 'innocent', 'innocent', 'innocent', 'innocent',
  ],
  enableWitch: false,
  enableHunter: false,
};

/** Reveal order of the title elements */
const STEPS = ['initial', 'title', 'divider', 'subtitle', 'description', 'buttons', 'complete'] as const;
type Step = (typeof STEPS)[number];

function MenuItem({ children, onClick, primary }: { children: React.ReactNode; onClick: () => void; primary?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative flex items-center gap-4 px-6 py-2 font-serif tracking-[0.6em] transition-colors',
        primary ? 'text-xl text-parchment hover:text-brass-light' : 'text-base text-frost-dim hover:text-parchment',
      )}
    >
      <span className="h-px w-6 bg-brass/0 transition-all group-hover:w-10 group-hover:bg-brass/70" />
      {children}
      <span className="h-px w-6 bg-brass/0 transition-all group-hover:w-10 group-hover:bg-brass/70" />
    </button>
  );
}

function SettingsModal({ onClose }: { onClose: () => void }) {
  const { apiKey, apiUrl, setApiKey, setApiUrl } = useGameStore();
  const [tempKey, setTempKey] = useState(apiKey || '');
  const [tempUrl, setTempUrl] = useState(apiUrl || DEFAULT_API_URL);
  const [isTesting, setIsTesting] = useState(false);
  const [result, setResult] = useState<'success' | 'error' | null>(null);

  const test = async () => {
    if (!tempKey.trim()) return alert('请输入 API 密钥');
    setIsTesting(true);
    setResult(null);
    try {
      const ok = await testApiKey(tempKey, tempUrl || undefined);
      setResult(ok ? 'success' : 'error');
      if (ok) {
        setApiKey(tempKey);
        setApiUrl(tempUrl);
      }
    } catch (error) {
      console.error('API key test failed:', error);
      setResult('error');
    } finally {
      setIsTesting(false);
    }
  };

  const save = () => {
    if (!tempKey.trim()) return alert('请输入 API 密钥');
    setApiKey(tempKey);
    setApiUrl(tempUrl);
    onClose();
  };

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="brass-frame panel-ink relative mx-4 w-full max-w-md p-8">
        <FrameCorners />
        <button onClick={onClose} className="absolute right-4 top-4 text-brass/70 hover:text-brass-light" aria-label="关闭">
          <X className="h-5 w-5" />
        </button>
        <h2 className="font-serif text-xl tracking-[0.4em] text-parchment">契约设置</h2>
        <p className="mb-6 font-latin text-sm italic text-brass/60">Pactum</p>

        <div className="space-y-5">
          <div>
            <Label htmlFor="apiKey" className="font-serif tracking-widest text-parchment">DeepSeek API 密钥</Label>
            <Input id="apiKey" type="password" value={tempKey} onChange={(e) => setTempKey(e.target.value)} placeholder="输入你的 DeepSeek API Key" className="mt-1.5 font-mono" />
            <p className="mt-1 text-xs text-frost-dim">
              从{' '}
              <a href="https://platform.deepseek.com/api_keys" target="_blank" rel="noopener noreferrer" className="text-pyre hover:underline">
                DeepSeek 开放平台
              </a>{' '}
              获取
            </p>
          </div>
          <div>
            <Label htmlFor="apiUrl" className="font-serif tracking-widest text-parchment">API URL（可选）</Label>
            <Input id="apiUrl" value={tempUrl} onChange={(e) => setTempUrl(e.target.value)} placeholder={DEFAULT_API_URL} className="mt-1.5 font-mono text-sm" />
            <p className="mt-1 text-xs text-frost-dim">默认使用官方 API 地址，如需使用代理可修改</p>
          </div>

          {result && (
            <div className={cn('flex items-center gap-2 rounded-sm border px-3 py-2 text-sm', result === 'success' ? 'border-pyre/40 text-pyre' : 'border-seal-light/50 text-seal-light')}>
              {result === 'success' ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
              {result === 'success' ? 'API 密钥验证成功！已自动保存' : 'API 密钥验证失败，请检查后重试'}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button onClick={() => void test()} disabled={isTesting || !tempKey.trim()} variant="outline" className="flex-1">
              {isTesting ? '测试中…' : '测试连接'}
            </Button>
            <Button onClick={save} disabled={!tempKey.trim()} className="flex-1">
              保存配置
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function StartMenu() {
  const [step, setStep] = useState<Step>('initial');
  const [showSettings, setShowSettings] = useState(false);
  const { apiKey, startGame } = useGameStore();

  useEffect(() => {
    const timers = STEPS.slice(1).map((s, i) => setTimeout(() => setStep(s), 700 + i * 550));
    return () => timers.forEach(clearTimeout);
  }, []);

  const shown = (s: Step) => STEPS.indexOf(step) >= STEPS.indexOf(s);

  const handleStart = () => {
    if (!apiKey?.trim()) {
      setShowSettings(true);
      return;
    }
    startGame(DEFAULT_CONFIG);
  };

  const reveal = (s: Step) => cn('transition-all duration-1000 ease-out', shown(s) ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0');

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-ink">
      <SceneBackdrop mood="night" className={cn('transition-opacity duration-[2000ms]', step === 'initial' ? 'opacity-0' : 'opacity-100')} />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-8 text-center">
        <div className={reveal('title')}>
          <div className="mb-4 font-latin text-lg italic tracking-[0.4em] text-brass/60">Mons Ignis Albi</div>
          <h1 className="text-brass-gradient font-serif text-7xl font-black tracking-[0.35em] md:text-8xl">白烬山口</h1>
        </div>

        <div className={cn('rule-brass my-8 w-72 transition-transform duration-1000', shown('divider') ? 'scale-x-100' : 'scale-x-0')} />

        <p className={cn('font-cinzel text-lg tracking-[0.6em] text-frost', reveal('subtitle'))}>WHITEFIRE PASS</p>

        <p className={cn('mt-8 max-w-xl font-serif text-sm leading-loose tracking-[0.2em] text-frost-dim', reveal('description'))}>
          一九一三年深冬，十五名旅人被困于寂静山庄。
          <br />
          壁炉里燃着不发热的苍白火焰——山灵的契约已成。
        </p>

        <nav className={cn('mt-14 flex flex-col items-center gap-3', reveal('buttons'))}>
          <MenuItem primary onClick={handleStart}>开始游戏</MenuItem>
          <MenuItem onClick={() => setShowSettings(true)}>契约设置</MenuItem>
        </nav>

        <p className={cn('absolute bottom-10 font-serif text-xs italic tracking-[0.4em] text-frost-dim/60', reveal('complete'))}>
          「每个秘密都致命」
        </p>
      </div>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}
