import React from "react";
import { corridorAudioManager } from "./AudioManager";

const BACKGROUND_SOURCE = "/assets/audio/Background.mp3";
const BACKGROUND_START_OFFSET = 3;

export const DEFAULT_BACKGROUND_VOLUME = 1;

export const useAmbienceAudio = (
  volume: number,
  enabled: boolean,
  fadeInMs = 0,
  startDelayMs = 0
) => {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const targetVolumeRef = React.useRef(volume);
  const frameRef = React.useRef<number | null>(null);
  const timerRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    targetVolumeRef.current = volume;
  }, [volume]);

  React.useEffect(() => {
    const clearScheduled = () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };

    if (targetVolumeRef.current <= 0) {
      clearScheduled();
      audioRef.current?.pause();
      audioRef.current = null;
      return undefined;
    }

    const startAudio = () => {
      const shouldFade = fadeInMs > 0;
      const audio = corridorAudioManager.playLoop(
        BACKGROUND_SOURCE,
        shouldFade ? 0 : targetVolumeRef.current,
        BACKGROUND_START_OFFSET
      );
      if (!audio) return;

      audioRef.current = audio;

      if (!shouldFade) return;

      const startedAt = performance.now();
      const fade = (now: number) => {
        const progress = Math.min(1, (now - startedAt) / fadeInMs);
        audio.volume = targetVolumeRef.current * progress;
        if (progress < 1) {
          frameRef.current = window.requestAnimationFrame(fade);
        } else {
          frameRef.current = null;
        }
      };

      frameRef.current = window.requestAnimationFrame(fade);
    };

    if (enabled && startDelayMs > 0) {
      timerRef.current = window.setTimeout(startAudio, startDelayMs);
    } else if (enabled) {
      startAudio();
    }

    const handleAudioUnlocked = () => {
      if (!enabled) return;
      if (audioRef.current && !audioRef.current.paused) return;
      clearScheduled();
      startAudio();
    };

    window.addEventListener("corridor-audio-unlocked", handleAudioUnlocked);

    return () => {
      clearScheduled();
      window.removeEventListener("corridor-audio-unlocked", handleAudioUnlocked);
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, [enabled, fadeInMs, startDelayMs]);

  React.useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);
};
