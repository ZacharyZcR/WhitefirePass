/**
 * 语音 / 音效 / 环境音三路音量，放在乐声弹窗里
 */

'use client';

import { Slider } from '@/components/ui/slider';
import { setAmbientLevel, useAudioMix } from '@/lib/audio/player';

const ROWS = [
  ['voice', '人声'],
  ['sfx', '音效'],
  ['ambient', '风雪'],
] as const;

export function AudioSliders() {
  const mix = useAudioMix();
  return (
    <div className="mt-4 space-y-3 border-t border-brass/15 pt-3">
      {ROWS.map(([key, label]) => (
        <div key={key} className="flex items-center gap-3">
          <span className="w-8 font-serif text-xs tracking-widest text-parchment">{label}</span>
          <Slider
            value={[mix[key] * 100]}
            onValueChange={(v) => {
              mix.set(key, v[0] / 100);
              if (key === 'ambient') setAmbientLevel(v[0] / 100);
            }}
            max={100}
            step={1}
          />
        </div>
      ))}
    </div>
  );
}
