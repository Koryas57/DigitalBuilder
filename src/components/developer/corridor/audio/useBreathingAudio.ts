import React from "react";
import { corridorAudioManager } from "./AudioManager";

const BREATHING_PLACEHOLDER = "/assets/audio/breathing/breathing_soft.mp3";

export const useBreathingAudio = (sprinting: boolean) => {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  React.useEffect(() => {
    audioRef.current = corridorAudioManager.playLoop(BREATHING_PLACEHOLDER, 0.08);
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  React.useEffect(() => {
    if (audioRef.current) audioRef.current.volume = sprinting ? 0.16 : 0.08;
  }, [sprinting]);
};
