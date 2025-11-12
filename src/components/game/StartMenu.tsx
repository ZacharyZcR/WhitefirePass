/**
 * Start Menu - Game landing page with snow effect
 * 白烬山口 - 极简艺术化启动界面
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { Mountain, Play, Settings, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGameStore } from '@/stores/game-store';
import { testGeminiKey } from '@/lib/gemini';
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

  // Animation stages
  const [stage, setStage] = useState<'initial' | 'icon' | 'title' | 'divider' | 'subtitle' | 'description' | 'buttons' | 'complete'>('initial');
  const [snowVisible, setSnowVisible] = useState(false);
  const [backgroundVisible, setBackgroundVisible] = useState(false);

  // Settings panel
  const [showSettings, setShowSettings] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');
  const [tempApiUrl, setTempApiUrl] = useState('https://generativelanguage.googleapis.com');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  const {
    apiKey: storedApiKey,
    apiUrl: storedApiUrl,
    setApiKey,
    setApiUrl,
    startGame,
  } = useGameStore();

  // Initialize form with stored values
  useEffect(() => {
    if (storedApiKey) {
      setTempApiKey(storedApiKey);
    }
    if (storedApiUrl) {
      setTempApiUrl(storedApiUrl);
    }
  }, [storedApiKey, storedApiUrl]);

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

  const handleTestApiKey = async () => {
    if (!tempApiKey.trim()) {
      alert('请输入 API 密钥');
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const isValid = await testGeminiKey(tempApiKey, tempApiUrl || undefined);
      setTestResult(isValid ? 'success' : 'error');
      if (isValid) {
        // Auto-save if test successful
        setApiKey(tempApiKey);
        setApiUrl(tempApiUrl);
      }
    } catch (error) {
      console.error('API key test failed:', error);
      setTestResult('error');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveConfig = () => {
    if (!tempApiKey.trim()) {
      alert('请输入 API 密钥');
      return;
    }

    setApiKey(tempApiKey);
    setApiUrl(tempApiUrl);
    setShowSettings(false);
    setTestResult(null);
  };

  const handleStart = () => {
    if (!storedApiKey?.trim()) {
      // Show settings panel if no API key configured
      setShowSettings(true);
      return;
    }

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
            1913年深冬，十五名旅人被困于寂静山庄，山灵的契约已成
          </p>

          {/* Action Buttons - Slide up from bottom */}
          <div
            className={`
              flex justify-center gap-4 pt-8
              transition-all duration-800 ease-out
              ${['initial', 'icon', 'title', 'divider', 'subtitle', 'description'].includes(stage)
                ? 'opacity-0 translate-y-8'
                : 'opacity-100 translate-y-0'
              }
            `}
          >
            <Button
              onClick={handleStart}
              className="group relative px-12 py-6 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-cinzel tracking-widest text-lg transition-all duration-300 shadow-lg hover:shadow-xl border-2 border-slate-700"
            >
              <span className="flex items-center gap-3">
                <Play className="w-5 h-5" strokeWidth={2} />
                开始游戏
              </span>
            </Button>

            <Button
              onClick={() => setShowSettings(true)}
              variant="outline"
              className="group relative px-8 py-6 bg-white/80 hover:bg-white text-slate-700 rounded-full font-cinzel tracking-widest text-lg transition-all duration-300 shadow-lg hover:shadow-xl border-2 border-slate-300"
            >
              <span className="flex items-center gap-3">
                <Settings className="w-5 h-5" strokeWidth={2} />
                配置
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

      {/* Settings Panel Modal */}
      {showSettings && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 p-8 relative">
            <button
              onClick={() => setShowSettings(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-cinzel text-slate-800 mb-6">API 配置</h2>

            <div className="space-y-4">
              <div>
                <Label htmlFor="apiKey" className="text-slate-700 font-serif">
                  Gemini API 密钥
                </Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  placeholder="输入你的 Gemini API Key"
                  className="mt-1 font-mono"
                />
                <p className="text-xs text-slate-500 mt-1">
                  从{' '}
                  <a
                    href="https://makersuite.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Google AI Studio
                  </a>{' '}
                  获取
                </p>
              </div>

              <div>
                <Label htmlFor="apiUrl" className="text-slate-700 font-serif">
                  API URL（可选）
                </Label>
                <Input
                  id="apiUrl"
                  type="text"
                  value={tempApiUrl}
                  onChange={(e) => setTempApiUrl(e.target.value)}
                  placeholder="https://generativelanguage.googleapis.com"
                  className="mt-1 font-mono text-sm"
                />
                <p className="text-xs text-slate-500 mt-1">
                  默认使用官方 API 地址，如需使用代理可修改
                </p>
              </div>

              {testResult && (
                <div
                  className={`p-3 rounded-md flex items-center gap-2 ${
                    testResult === 'success'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-red-50 text-red-700'
                  }`}
                >
                  {testResult === 'success' ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span className="text-sm">API 密钥验证成功！已自动保存</span>
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4" />
                      <span className="text-sm">API 密钥验证失败，请检查后重试</span>
                    </>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleTestApiKey}
                  disabled={isTesting || !tempApiKey.trim()}
                  className="flex-1"
                  variant="outline"
                >
                  {isTesting ? '测试中...' : '测试连接'}
                </Button>

                <Button
                  onClick={handleSaveConfig}
                  disabled={!tempApiKey.trim()}
                  className="flex-1 bg-slate-800 hover:bg-slate-700"
                >
                  保存配置
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
