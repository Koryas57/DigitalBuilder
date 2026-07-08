import React from "react";
import { corridorAudioManager } from "./AudioManager";

const BACKGROUND_SOURCE = "/assets/audio/Background.mp3";
const BACKGROUND_START_OFFSET = 3;

export const DEFAULT_BACKGROUND_VOLUME = 0.18;

export const useAmbienceAudio = (volume: number, enabled: boolean) => {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  React.useEffect(() => {
    if (!enabled || volume <= 0) {
      audioRef.current?.pause();
      audioRef.current = null;
      return undefined;
    }

    const audio = corridorAudioManager.playLoop(BACKGROUND_SOURCE, volume, BACKGROUND_START_OFFSET);
    audioRef.current = audio;

    return () => {
      audio?.pause();
      audioRef.current = null;
    };
  }, [enabled, volume > 0]);

  React.useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);
};
