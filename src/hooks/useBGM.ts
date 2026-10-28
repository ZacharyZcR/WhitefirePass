/**
 * BGM (Background Music) management hook
 * Handles music playback with fade in/out transitions
 */

import { useEffect, useRef, useState } from 'react';
import type { Cutscene, GameState } from '@/types/game';
import { assetPath } from '@/lib/design-tokens';
import { useGameStore } from '@/stores/game-store';

/**
 * BGM configuration for different game phases
 */
const BGM_TRACKS = {
  menu: '/audio/music/title.ogg',
  prologue: '/audio/music/opening.ogg', // opening cinematic: plays once, not looped
  setup: '/audio/music/title.ogg',
  day: '/audio/music/day.ogg',
  event: '/audio/music/day.ogg',
  voting: '/audio/music/voting.ogg',
  night: '/audio/music/night.ogg',
  end: '/audio/music/night.ogg', // until the winner is known
} as const;

/**
 * Get BGM track for current phase; the ending theme depends on who won, and a cutscene has its own track
 */
function getTrackForPhase(phase: GameState['phase'] | 'menu', winner?: GameState['winner'], cutscene?: Cutscene): string {
  if (cutscene) return assetPath(`/audio/music/${cutscene}.ogg`);
  if (phase === 'end' && winner) return assetPath(`/audio/music/end_${winner}.ogg`);
  return assetPath(BGM_TRACKS[phase] || BGM_TRACKS.menu);
}

/**
 * Fade audio volume
 */
function fadeVolume(
  audio: HTMLAudioElement,
  targetVolume: number,
  duration: number,
  onComplete?: () => void,
): void {
  const startVolume = audio.volume;
  const volumeDelta = targetVolume - startVolume;
  const steps = 50; // Number of volume change steps
  const stepDuration = duration / steps;
  let currentStep = 0;

  const interval = setInterval(() => {
    currentStep++;
    const progress = currentStep / steps;
    audio.volume = Math.max(0, Math.min(1, startVolume + volumeDelta * progress));

    if (currentStep >= steps) {
      clearInterval(interval);
      audio.volume = targetVolume;
      onComplete?.();
    }
  }, stepDuration);
}

/**
 * BGM hook for game phases
 */
export function useBGM(phase: GameState['phase'] | 'menu' | null, enabled = true) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [volume, setVolume] = useState(0.3); // Default volume 30%
  const [isMuted, setIsMuted] = useState(false);
  const currentTrackRef = useRef<string | null>(null);
  const winner = useGameStore((s) => s.gameState?.winner);
  const cutscene = useGameStore((s) => s.gameState?.cutscenes?.[0]);

  // Initialize audio element
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const audio = new Audio();
    audio.loop = true;
    audio.volume = volume;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, []);

  // Handle phase changes and track switching
  useEffect(() => {
    if (!enabled || !phase || !audioRef.current) return;

    const audio = audioRef.current;
    const newTrack = getTrackForPhase(phase, winner, cutscene);

    // If track hasn't changed, just ensure it's playing
    if (currentTrackRef.current === newTrack) {
      if (audio.paused && !isMuted) {
        void audio.play().catch(err => {
          console.warn('Failed to play audio:', err);
        });
      }
      return;
    }

    // Track changed - fade out, switch, fade in
    const switchTrack = () => {
      audio.pause();
      audio.src = newTrack;
      audio.loop = phase !== 'prologue';
      audio.load();
      currentTrackRef.current = newTrack;

      if (!isMuted) {
        // Start from 0 volume and fade in
        audio.volume = 0;
        void audio.play().then(() => {
          fadeVolume(audio, volume, 2000); // 2 second fade in
        }).catch(err => {
          console.warn('Failed to play audio:', err);
        });
      }
    };

    if (!audio.paused && audio.src) {
      // Fade out current track before switching
      fadeVolume(audio, 0, 1500, switchTrack); // 1.5 second fade out
    } else {
      // No current track playing, switch immediately
      switchTrack();
    }
  }, [phase, winner, cutscene, enabled, isMuted, volume]);

  // Handle volume changes
  useEffect(() => {
    if (!audioRef.current) return;
    const audio = audioRef.current;

    if (!isMuted && !audio.paused) {
      // Smooth volume change
      fadeVolume(audio, volume, 500);
    }
  }, [volume, isMuted]);

  // Handle mute state
  useEffect(() => {
    if (!audioRef.current) return;
    const audio = audioRef.current;

    if (isMuted) {
      fadeVolume(audio, 0, 500, () => {
        audio.pause();
      });
    } else if (currentTrackRef.current) {
      audio.volume = 0;
      void audio.play().then(() => {
        fadeVolume(audio, volume, 1000);
      }).catch(err => {
        console.warn('Failed to play audio:', err);
      });
    }
  }, [isMuted, volume]);

  return {
    volume,
    setVolume,
    isMuted,
    setIsMuted,
    toggleMute: () => setIsMuted(prev => !prev),
  };
}
