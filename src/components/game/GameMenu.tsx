/**
 * System menu: saves, API settings, guide, reset.
 */

'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, HelpCircle, Loader2, RotateCw } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGameStore } from '@/stores/game-store';
import { testApiKey, DEFAULT_API_URL } from '@/lib/deepseek';
import { SaveGameManager } from './SaveGameManager';

function ApiSettings() {
  const { apiKey: storedKey, apiUrl: storedUrl, setApiKey, setApiUrl } = useGameStore();
  const [apiKey, setKey] = useState(storedKey);
  const [apiUrl, setUrl] = useState(storedUrl);
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    if (storedKey) setKey(storedKey);
  }, [storedKey]);
  useEffect(() => {
    if (storedUrl) setUrl(storedUrl);
  }, [storedUrl]);

  const save = async () => {
    const key = apiKey.trim();
    const url = apiUrl.trim();
    if (!key) return alert('请输入你的 DeepSeek API 密钥');
    setValidating(true);
    const ok = await testApiKey(key, url);
    setValidating(false);
    if (!ok) {
      alert(
        'API 密钥验证失败！\n\n请检查：\n1. API 密钥是否正确\n2. 账户余额是否充足\n3. 网络连接是否正常\n4. API URL 是否正确\n\n获取 API 密钥：https://platform.deepseek.com/api_keys',
      );
      return;
    }
    setApiKey(key);
    if (url) setApiUrl(url);
    alert('设置已保存！');
  };

  return (
    <div className="space-y-4">
      <label className="block space-y-1.5">
        <span className="text-sm tracking-widest text-parchment">DeepSeek API 密钥</span>
        <Input type="password" value={apiKey} onChange={(e) => setKey(e.target.value)} placeholder="请输入你的 API 密钥" className="font-mono" />
        <span className="block text-xs text-frost-dim">
          从{' '}
          <a href="https://platform.deepseek.com/api_keys" target="_blank" rel="noopener noreferrer" className="text-pyre hover:underline">
            DeepSeek 开放平台
          </a>{' '}
          获取
        </span>
      </label>
      <label className="block space-y-1.5">
        <span className="text-sm tracking-widest text-parchment">API 基础 URL</span>
        <Input value={apiUrl} onChange={(e) => setUrl(e.target.value)} placeholder={DEFAULT_API_URL} className="font-mono text-sm" />
        <span className="block text-xs text-frost-dim">默认使用 DeepSeek 官方 API（OpenAI 兼容），也可以填写其他兼容地址</span>
      </label>
      <Button onClick={() => void save()} className="w-full" disabled={validating || !apiKey.trim()}>
        {validating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
        {validating ? '验证中…' : '验证并保存'}
      </Button>
    </div>
  );
}

interface GameMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenGuide: () => void;
}

export function GameMenu({ open, onOpenChange, onOpenGuide }: GameMenuProps) {
  const resetGame = useGameStore((s) => s.resetGame);

  const reset = () => {
    if (!confirm('确定要放弃当前游戏，回到标题画面吗？未存档的进度会丢失。')) return;
    onOpenChange(false);
    resetGame();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="tracking-[0.4em]">菜单</DialogTitle>
          <DialogDescription className="font-latin italic">Imperium Ludi</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="saves">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="saves">存档</TabsTrigger>
            <TabsTrigger value="settings">设置</TabsTrigger>
          </TabsList>
          <TabsContent value="saves" className="mt-4">
            <SaveGameManager />
          </TabsContent>
          <TabsContent value="settings" className="mt-4">
            <ApiSettings />
          </TabsContent>
        </Tabs>

        <div className="flex gap-3 border-t border-brass/15 pt-4">
          <Button variant="outline" className="flex-1" onClick={onOpenGuide}>
            <HelpCircle className="mr-2 h-4 w-4" />
            游戏说明
          </Button>
          <Button variant="outline" className="flex-1 border-seal/60 text-seal-light hover:border-seal-light" onClick={reset}>
            <RotateCw className="mr-2 h-4 w-4" />
            重置游戏
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
