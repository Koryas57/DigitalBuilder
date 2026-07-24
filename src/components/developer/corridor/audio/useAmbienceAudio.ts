import React from "react";
import { corridorAudioManager } from "./AudioManager";

const BACKGROUND_SOURCE = "/assets/audio/Background.mp3";
const BACKGROUND_START_OFFSET = 3;

export const DEFAULT_BACKGROUND_VOLUME = 1;

export const useAmbienceAudio = (
  volume: number,
  enabled: boolean,
  fadeInMs = 0,
  startDelayMs = 0,
  volumeTransitionMs = 0
) => {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const targetVolumeRef = React.useRef(volume);
  const frameRef = React.useRef<number | null>(null);
  const volumeFrameRef = React.useRef<number | null>(null);
  const timerRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    targetVolumeRef.current = volume;
  }, [volume]);

  React.useEffect(() => {
    let pendingPlayingAudio: HTMLAudioElement | null = null;
    let pendingPlayingHandler: (() => void) | null = null;

    const clearScheduled = () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      if (volumeFrameRef.current !== null) {
        window.cancelAnimationFrame(volumeFrameRef.current);
        volumeFrameRef.current = null;
      }
      if (pendingPlayingAudio && pendingPlayingHandler) {
        pendingPlayingAudio.removeEventListener(
          "playing",
          pendingPlayingHandler
        );
        pendingPlayingAudio = null;
        pendingPlayingHandler = null;
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

      let fadeStarted = false;
      const beginFade = () => {
        if (fadeStarted) return;
        fadeStarted = true;
        if (pendingPlayingAudio && pendingPlayingHandler) {
          pendingPlayingAudio.removeEventListener(
            "playing",
            pendingPlayingHandler
          );
        }
        pendingPlayingAudio = null;
        pendingPlayingHandler = null;
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

      pendingPlayingAudio = audio;
      pendingPlayingHandler = beginFade;
      audio.addEventListener("playing", beginFade, { once: true });
      if (!audio.paused && audio.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        beginFade();
      }
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

    const resumeAfterGesture = () => {
      if (!enabled || !audioRef.current || !audioRef.current.paused) return;
      void audioRef.current.play().catch(() => undefined);
    };

    window.addEventListener("corridor-audio-unlocked", handleAudioUnlocked);
    window.addEventListener("pointerdown", resumeAfterGesture);
    window.addEventListener("keydown", resumeAfterGesture);
    window.addEventListener("keyup", resumeAfterGesture);

    return () => {
      clearScheduled();
      window.removeEventListener("corridor-audio-unlocked", handleAudioUnlocked);
      window.removeEventListener("pointerdown", resumeAfterGesture);
      window.removeEventListener("keydown", resumeAfterGesture);
      window.removeEventListener("keyup", resumeAfterGesture);
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, [enabled, fadeInMs, startDelayMs]);

  React.useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;
    if (volumeFrameRef.current !== null) {
      window.cancelAnimationFrame(volumeFrameRef.current);
      volumeFrameRef.current = null;
    }
    if (volumeTransitionMs <= 0) {
      audio.volume = volume;
      return undefined;
    }

    const initialVolume = audio.volume;
    const startedAt = performance.now();
    const transition = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / volumeTransitionMs);
      audio.volume = initialVolume + (volume - initialVolume) * progress;
      if (progress < 1) {
        volumeFrameRef.current = window.requestAnimationFrame(transition);
      } else {
        volumeFrameRef.current = null;
      }
    };
    volumeFrameRef.current = window.requestAnimationFrame(transition);

    return () => {
      if (volumeFrameRef.current !== null) {
        window.cancelAnimationFrame(volumeFrameRef.current);
        volumeFrameRef.current = null;
      }
    };
  }, [volume, volumeTransitionMs]);
};
