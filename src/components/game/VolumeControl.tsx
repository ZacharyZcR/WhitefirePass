/**
 * BGM volume popover for the HUD.
 */

'use client';

import { Volume2, VolumeX } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { AudioSliders } from '@/components/audio/AudioSliders';
import { HudButton } from './HudButton';

interface VolumeControlProps {
  volume: number;
  isMuted: boolean;
  setVolume: (v: number) => void;
  toggleMute: () => void;
}

export function VolumeControl({ volume, isMuted, setVolume, toggleMute }: VolumeControlProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <HudButton icon={isMuted ? VolumeX : Volume2} label="背景音乐" />
      </PopoverTrigger>
      <PopoverContent className="w-56" align="end">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-serif text-sm tracking-widest text-parchment">乐声</span>
          <button onClick={toggleMute} className="text-xs text-brass hover:text-brass-light">
            {isMuted ? '取消静音' : '静音'}
          </button>
        </div>
        <Slider
          value={[volume * 100]}
          onValueChange={(v) => setVolume(v[0] / 100)}
          max={100}
          step={1}
          disabled={isMuted}
        />
        <div className="mt-2 text-center font-cinzel text-xs text-frost-dim">
          {isMuted ? 'SILENT' : `${Math.round(volume * 100)}%`}
        </div>
        <AudioSliders />
      </PopoverContent>
    </Popover>
  );
}
