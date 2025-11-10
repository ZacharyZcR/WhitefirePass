/**
 * Start Menu - Game landing page with snow effect
 * 白烬山口 - 极简艺术化启动界面
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { Mountain, Settings, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/stores/game-store';
import { testGeminiKey } from '@/lib/gemini';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { GameConfig } from '@/types/game';

interface Snowflake {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  drift: number;
}

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

export function StartMenu() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  // Animation stages
  const [stage, setStage] = useState<'initial' | 'icon' | 'title' | 'divider' | 'subtitle' | 'description' | 'buttons' | 'complete'>('initial');
  const [snowVisible, setSnowVisible] = useState(false);
  const [backgroundVisible, setBackgroundVisible] = useState(false);

  const {
    apiKey: storedApiKey,
    setApiKey: saveApiKey,
    startGame,
    executeNextStep
  } = useGameStore();

  useEffect(() => {
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, [storedApiKey]);

  // Orchestrated entry animation sequence
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    // Sequence timing (in milliseconds)
    timers.push(setTimeout(() => setBackgroundVisible(true), 100));  // Background fades in from black
    timers.push(setTimeout(() => setStage('icon'), 600));            // Mountain icon appears
    timers.push(setTimeout(() => setStage('title'), 1300));          // Title fades in
    timers.push(setTimeout(() => setStage('divider'), 1900));        // Divider draws
    timers.push(setTimeout(() => setStage('subtitle'), 2300));       // English subtitle
    timers.push(setTimeout(() => setStage('description'), 2800));    // Description
    timers.push(setTimeout(() => setStage('buttons'), 3300));        // Buttons appear
    timers.push(setTimeout(() => setStage('complete'), 3800));       // Complete
    timers.push(setTimeout(() => setSnowVisible(true), 2300));       // Snow starts falling

    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Create snowflakes
    const snowflakes: Snowflake[] = [];
    const snowflakeCount = 150;

    for (let i = 0; i < snowflakeCount; i++) {
      snowflakes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speed: Math.random() * 1 + 0.5,
        opacity: Math.random() * 0.6 + 0.2,
        drift: Math.random() * 0.5 - 0.25,
      });
    }

    // Animation loop
    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      snowflakes.forEach((flake) => {
        ctx.beginPath();
        ctx.arc(flake.x, flake.y, flake.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;
        ctx.fill();

        // Update position
        flake.y += flake.speed;
        flake.x += flake.drift;

        // Reset snowflake when it goes off screen
        if (flake.y > canvas.height) {
          flake.y = -10;
          flake.x = Math.random() * canvas.width;
        }
        if (flake.x > canvas.width) {
          flake.x = 0;
        } else if (flake.x < 0) {
          flake.x = canvas.width;
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  const handleStart = async () => {
    const trimmedKey = apiKey.trim();
    if (!trimmedKey) {
      alert('请先在设置中配置 Gemini API 密钥');
      setSettingsOpen(true);
      return;
    }

    setIsValidating(true);
    const isValid = await testGeminiKey(trimmedKey);
    setIsValidating(false);

    if (!isValid) {
      alert(
        'API 密钥验证失败！\n\n请检查：\n1. API 密钥是否正确\n2. 是否已启用 Gemini API\n3. 网络连接是否正常'
      );
      setSettingsOpen(true);
      return;
    }

    saveApiKey(trimmedKey);
    startGame(DEFAULT_CONFIG);
    // Game will start at prologue phase, user needs to click next to proceed
  };

  return (
    <>
    {/* Black overlay that fades out */}
    <div
      className={`
        fixed inset-0 bg-black z-50 pointer-events-none
        transition-opacity duration-1000 ease-out
        ${backgroundVisible ? 'opacity-0' : 'opacity-100'}
      `}
    />

    <div className="relative h-screen w-screen overflow-hidden bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200">
      {/* Snow effect canvas */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 pointer-events-none transition-opacity duration-2000 ${
          snowVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ zIndex: 10 }}
      />

      {/* Background mountain silhouette - subtle */}
      <div className="absolute inset-0 opacity-5">
        <svg
          viewBox="0 0 1200 600"
          className="w-full h-full"
          preserveAspectRatio="xMidYMax slice"
        >
          <path
            d="M0,400 L200,200 L400,350 L600,100 L800,300 L1000,150 L1200,400 L1200,600 L0,600 Z"
            fill="currentColor"
            className="text-slate-700"
          />
        </svg>
      </div>

      {/* Subtle vignette */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-slate-900/10" />

      {/* Main content - Centered */}
      <div className="relative z-20 flex flex-col items-center justify-center h-full px-8">
        <div className="text-center space-y-16">

          {/* Single Mountain Icon - Appears with scale and glow */}
          <div className="flex justify-center">
            <Mountain
              className={`
                w-32 h-32 text-slate-400 drop-shadow-[0_2px_20px_rgba(0,0,0,0.15)]
                transition-all duration-1000 ease-out
                ${stage === 'initial' ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}
              `}
              strokeWidth={1.5}
            />
          </div>

          {/* Game Title - Fades in with slight upward movement */}
          <div className="space-y-6">
            <h1
              className={`
                text-8xl font-bold font-cinzel tracking-[0.2em] text-slate-700 drop-shadow-sm
                transition-all duration-1000 ease-out
                ${['initial', 'icon'].includes(stage)
                  ? 'opacity-0 translate-y-4'
                  : 'opacity-100 translate-y-0'
                }
              `}
            >
              白烬山口
            </h1>

            {/* Divider - Draws from center */}
            <div className="relative h-px w-48 mx-auto overflow-hidden">
              <div
                className={`
                  absolute inset-0 bg-gradient-to-r from-transparent via-slate-400 to-transparent
                  transition-all duration-800 ease-out
                  ${['initial', 'icon', 'title'].includes(stage)
                    ? 'scale-x-0'
                    : 'scale-x-100'
                  }
                `}
              />
            </div>

            {/* English subtitle - Fades in */}
            <p
              className={`
                text-xl font-cinzel tracking-[0.3em] text-slate-500 uppercase
                transition-all duration-800 ease-out
                ${['initial', 'icon', 'title', 'divider'].includes(stage)
                  ? 'opacity-0'
                  : 'opacity-100'
                }
              `}
            >
              Whitefire Pass
            </p>
          </div>

          {/* Description - Fades in with delay */}
          <p
            className={`
              text-base font-serif text-slate-600 tracking-wide max-w-xl mx-auto leading-relaxed
              transition-all duration-800 ease-out
              ${['initial', 'icon', 'title', 'divider', 'subtitle'].includes(stage)
                ? 'opacity-0 translate-y-2'
                : 'opacity-100 translate-y-0'
              }
            `}
          >
            十五名旅人困于暴雪山庄，白蜡篝火见证生死博弈
          </p>

          {/* Action Buttons - Slide up from bottom */}
          <div
            className={`
              flex gap-6 justify-center pt-8
              transition-all duration-800 ease-out
              ${['initial', 'icon', 'title', 'divider', 'subtitle', 'description'].includes(stage)
                ? 'opacity-0 translate-y-8'
                : 'opacity-100 translate-y-0'
              }
            `}
          >
            <Button
              onClick={handleStart}
              disabled={isValidating}
              className="group relative px-12 py-6 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-cinzel tracking-widest text-lg transition-all duration-300 shadow-lg hover:shadow-xl border-2 border-slate-700"
            >
              {isValidating ? (
                <span className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  验证中
                </span>
              ) : (
                <span className="flex items-center gap-3">
                  <Play className="w-5 h-5" strokeWidth={2} />
                  开始游戏
                </span>
              )}
            </Button>

            <Button
              onClick={() => setSettingsOpen(true)}
              variant="outline"
              className="px-12 py-6 bg-transparent hover:bg-slate-200/50 text-slate-700 border-2 border-slate-400 rounded-full font-cinzel tracking-widest text-lg transition-all duration-300"
            >
              <span className="flex items-center gap-3">
                <Settings className="w-5 h-5" strokeWidth={2} />
                设置
              </span>
            </Button>
          </div>

        </div>

        {/* Footer Quote - Fades in last */}
        <div
          className={`
            absolute bottom-12 left-0 right-0 text-center
            transition-all duration-1000 ease-out delay-500
            ${stage === 'complete' ? 'opacity-100' : 'opacity-0'}
          `}
        >
          <p className="text-sm text-slate-500 font-serif italic tracking-wider">
            "每个秘密都致命"
          </p>
        </div>
      </div>

      {/* Subtle frost overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-white to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-white to-transparent" />
      </div>
    </div>

    {/* Settings Dialog */}
    <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
      <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-md border-2 border-slate-300">
        <DialogHeader>
          <DialogTitle className="text-2xl font-cinzel tracking-wide text-slate-800">
            游戏设置
          </DialogTitle>
          <DialogDescription className="text-slate-600 font-serif">
            配置 Gemini API 以开始游戏
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label htmlFor="apiKey" className="text-sm font-medium text-slate-700">
              Gemini API 密钥
            </Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="输入你的 API 密钥"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="border-2 border-slate-300 focus:border-slate-500 bg-white/50"
            />
            <p className="text-xs text-slate-600">
              从{' '}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-800 underline hover:text-slate-900"
              >
                Google AI Studio
              </a>
              {' '}获取密钥
            </p>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button
              onClick={() => setSettingsOpen(false)}
              variant="outline"
              className="border-2 border-slate-300 text-slate-700 hover:bg-slate-100"
            >
              取消
            </Button>
            <Button
              onClick={() => {
                if (apiKey.trim()) {
                  saveApiKey(apiKey.trim());
                  setSettingsOpen(false);
                }
              }}
              className="bg-slate-800 hover:bg-slate-700 text-white"
            >
              保存
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
