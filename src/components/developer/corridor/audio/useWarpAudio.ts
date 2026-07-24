import React from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { corridorAudioManager } from "./AudioManager";
import { WARP_CONFIG } from "../../../../data/warpConfig";

interface WarpPortalAmbienceOptions {
  playerPositionRef: React.MutableRefObject<THREE.Vector3>;
  enabled: boolean;
}

export const useWarpAudio = () => {
  const playWarpTransition = React.useCallback(() => {
    if (!corridorAudioManager.isUnlocked()) return null;

    const audio = corridorAudioManager.getAudio(
      WARP_CONFIG.audio.transitionSrc
    );
    audio.pause();
    audio.loop = false;
    audio.volume = WARP_CONFIG.audio.transitionVolume;

    const startPlayback = () => {
      try {
        audio.currentTime = Number.isFinite(audio.duration)
          ? Math.min(
              WARP_CONFIG.audio.transitionStartOffsetSeconds,
              Math.max(0, audio.duration - 0.1)
            )
          : WARP_CONFIG.audio.transitionStartOffsetSeconds;
      } catch {
        // A browser may briefly reject seeking while metadata is loading.
      }
      void audio.play().catch(() => undefined);
    };

    if (audio.readyState >= HTMLMediaElement.HAVE_METADATA) {
      startPlayback();
    } else {
      audio.addEventListener("loadedmetadata", startPlayback, { once: true });
      audio.load();
    }

    return audio;
  }, []);

  return { playWarpTransition };
};

export const useWarpPortalAmbience = ({
  playerPositionRef,
  enabled,
}: WarpPortalAmbienceOptions) => {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const currentVolumeRef = React.useRef(0);
  const playPendingRef = React.useRef(false);
  const enabledRef = React.useRef(enabled);
  const portalPosition = React.useMemo(
    () => new THREE.Vector3(...WARP_CONFIG.position),
    []
  );
  enabledRef.current = enabled;

  const ensurePlayback = React.useCallback(() => {
    const audio = audioRef.current;
    if (
      !audio ||
      !corridorAudioManager.isUnlocked() ||
      !audio.paused ||
      playPendingRef.current
    ) {
      return;
    }

    playPendingRef.current = true;
    void audio
      .play()
      .catch(() => undefined)
      .finally(() => {
        playPendingRef.current = false;
      });
  }, []);

  React.useEffect(() => {
    const audio = corridorAudioManager.getAudio(
      WARP_CONFIG.audio.ambienceSrc
    );
    audio.preload = "auto";
    audio.loop = false;
    audio.volume = 0;
    audioRef.current = audio;

    const handleUnlocked = () => {
      if (
        enabledRef.current &&
        playerPositionRef.current.distanceTo(portalPosition) <
          WARP_CONFIG.audio.ambienceRadius
      ) {
        ensurePlayback();
      }
    };

    window.addEventListener("corridor-audio-unlocked", handleUnlocked);

    return () => {
      window.removeEventListener("corridor-audio-unlocked", handleUnlocked);
      audio.pause();
      audio.volume = 0;
      try {
        audio.currentTime = 0;
      } catch {
        // Metadata may not be ready while the scene is being destroyed.
      }
      audioRef.current = null;
      currentVolumeRef.current = 0;
      playPendingRef.current = false;
    };
  }, [ensurePlayback, playerPositionRef, portalPosition]);

  useFrame((_, delta) => {
    const audio = audioRef.current;
    if (!audio) return;

    const distance = playerPositionRef.current.distanceTo(portalPosition);
    const proximity = enabled
      ? THREE.MathUtils.clamp(
          1 - distance / WARP_CONFIG.audio.ambienceRadius,
          0,
          1
        )
      : 0;
    const targetVolume =
      WARP_CONFIG.audio.ambienceMaxVolume *
      Math.pow(proximity, WARP_CONFIG.audio.ambienceDistanceCurve);

    currentVolumeRef.current = THREE.MathUtils.damp(
      currentVolumeRef.current,
      targetVolume,
      WARP_CONFIG.audio.ambienceFadeSpeed,
      delta
    );

    if (targetVolume > 0 || currentVolumeRef.current > 0.001) {
      ensurePlayback();
    } else if (!audio.paused) {
      audio.pause();
      try {
        audio.currentTime = 0;
      } catch {
        // Seeking can fail until metadata is available.
      }
    }

    const duration = audio.duration;
    const loopEnd = Number.isFinite(duration)
      ? Math.max(0.2, duration - WARP_CONFIG.audio.loopTrimEndSeconds)
      : Number.POSITIVE_INFINITY;

    if (audio.currentTime >= loopEnd - 0.025) {
      audio.currentTime = 0;
      ensurePlayback();
    }

    const fadeDuration = Math.min(
      WARP_CONFIG.audio.loopFadeSeconds,
      loopEnd * 0.25
    );
    const fadeIn =
      fadeDuration > 0
        ? THREE.MathUtils.smoothstep(audio.currentTime, 0, fadeDuration)
        : 1;
    const fadeOut =
      fadeDuration > 0 && Number.isFinite(loopEnd)
        ? THREE.MathUtils.smoothstep(
            loopEnd - audio.currentTime,
            0,
            fadeDuration
          )
        : 1;
    const loopEnvelope = Math.min(fadeIn, fadeOut);

    audio.volume = THREE.MathUtils.clamp(
      currentVolumeRef.current * loopEnvelope,
      0,
      1
    );
  });
};
