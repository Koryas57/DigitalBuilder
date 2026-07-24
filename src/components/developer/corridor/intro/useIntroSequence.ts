import React from "react";
import { corridorAudioManager } from "../audio/AudioManager";
import {
  INITIAL_BLACK_MS,
  INTRO_AUDIO,
  INTRO_CAMERA_DURATION_MS,
  INTRO_ENABLED,
  INTRO_SKIP_IN_DEBUG,
  INTRO_STABILIZE_MS,
  INTRO_TEXT_SEQUENCE,
  LOCKED_CONTROL_STATE,
  PLAYING_CONTROL_STATE,
  REVEAL_DURATION_MS,
  type ExperiencePhase,
  type PlayerControlState,
} from "./introConfig";

interface UseIntroSequenceOptions {
  mapReady: boolean;
  audioUnlocked: boolean;
  reducedMotion: boolean;
}

export interface IntroSequenceState {
  phase: ExperiencePhase;
  introEnabled: boolean;
  sentenceIndex: number;
  sentenceVisible: boolean;
  sentenceDissolving: boolean;
  overlayOpacity: number;
  revealProgress: number;
  cameraProgress: number;
  neonPlayed: boolean;
  introAudioFinished: boolean;
  ambienceReady: boolean;
  controlState: PlayerControlState;
  skipIntro: () => void;
}

const wait = (duration: number, registerTimer: (id: number) => void) =>
  new Promise<void>((resolve) => {
    const timer = window.setTimeout(resolve, duration);
    registerTimer(timer);
  });

const animateProgress = (
  duration: number,
  onProgress: (progress: number) => void,
  registerFrame: (id: number) => void
) =>
  new Promise<void>((resolve) => {
    if (duration <= 0) {
      onProgress(1);
      resolve();
      return;
    }

    const startedAt = performance.now();
    const frame = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      onProgress(progress);
      if (progress >= 1) {
        resolve();
        return;
      }
      const frameId = window.requestAnimationFrame(frame);
      registerFrame(frameId);
    };

    const frameId = window.requestAnimationFrame(frame);
    registerFrame(frameId);
  });

export const useIntroSequence = ({
  mapReady,
  audioUnlocked,
  reducedMotion,
}: UseIntroSequenceOptions): IntroSequenceState => {
  const [phase, setPhase] = React.useState<ExperiencePhase>(
    INTRO_ENABLED && !INTRO_SKIP_IN_DEBUG ? "loading" : "playing"
  );
  const [sentenceIndex, setSentenceIndex] = React.useState(-1);
  const [sentenceVisible, setSentenceVisible] = React.useState(false);
  const [sentenceDissolving, setSentenceDissolving] = React.useState(false);
  const [overlayOpacity, setOverlayOpacity] = React.useState(1);
  const [revealProgress, setRevealProgress] = React.useState(0);
  const [cameraProgress, setCameraProgress] = React.useState(0);
  const [neonPlayed, setNeonPlayed] = React.useState(false);
  const [introAudioFinished, setIntroAudioFinished] = React.useState(false);
  const [ambienceReady, setAmbienceReady] = React.useState(false);
  const neonPlayedRef = React.useRef(false);
  const introAudioRef = React.useRef<HTMLAudioElement | null>(null);
  const introFadeFrameRef = React.useRef<number | null>(null);
  const cancelledRef = React.useRef(false);
  const completedRef = React.useRef(!INTRO_ENABLED || INTRO_SKIP_IN_DEBUG);
  const timersRef = React.useRef<number[]>([]);
  const framesRef = React.useRef<number[]>([]);

  const clearScheduledWork = React.useCallback(() => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    framesRef.current.forEach((frame) => window.cancelAnimationFrame(frame));
    timersRef.current = [];
    framesRef.current = [];
  }, []);

  const stopIntroAudio = React.useCallback(() => {
    if (introFadeFrameRef.current !== null) {
      window.cancelAnimationFrame(introFadeFrameRef.current);
      introFadeFrameRef.current = null;
    }
    const audio = introAudioRef.current;
    if (!audio) return;
    audio.pause();
    audio.loop = false;
    try {
      audio.currentTime = 0;
    } catch {
      // Metadata may still be loading during a fast skip.
    }
    introAudioRef.current = null;
  }, []);

  const completeIntro = React.useCallback(() => {
    clearScheduledWork();
    stopIntroAudio();
    setIntroAudioFinished(true);
    setAmbienceReady(true);
    cancelledRef.current = true;
    completedRef.current = true;
    setPhase("playing");
    setSentenceIndex(-1);
    setSentenceVisible(false);
    setSentenceDissolving(false);
    setOverlayOpacity(0);
    setRevealProgress(1);
    setCameraProgress(1);
    try {
      sessionStorage.setItem("developerIntroSeen", "true");
    } catch {
      // Session storage can be unavailable in private contexts.
    }
  }, [clearScheduledWork, stopIntroAudio]);

  React.useEffect(() => {
    if (!INTRO_ENABLED || INTRO_SKIP_IN_DEBUG) {
      completeIntro();
      return undefined;
    }

    if (!mapReady || !audioUnlocked || completedRef.current) return undefined;

    cancelledRef.current = false;
    setPhase("introBlack");
    setOverlayOpacity(1);
    setRevealProgress(0);
    setCameraProgress(0);

    const registerTimer = (id: number) => timersRef.current.push(id);
    const registerFrame = (id: number) => framesRef.current.push(id);

    const neonTimer = window.setTimeout(() => {
      if (cancelledRef.current || neonPlayedRef.current) return;
      const introAudio = corridorAudioManager
        .getAudio(INTRO_AUDIO.neonSrc)
        .cloneNode(true) as HTMLAudioElement;
      introAudio.preload = "auto";
      introAudio.loop = false;
      introAudio.volume = INTRO_AUDIO.neonVolume;
      introAudioRef.current = introAudio;
      neonPlayedRef.current = true;
      setNeonPlayed(true);

      let fadeStarted = false;
      const removeAudioListeners = () => {
        introAudio.removeEventListener("timeupdate", handleTimeUpdate);
        introAudio.removeEventListener("ended", finishIntroAudio);
        introAudio.removeEventListener("error", finishIntroAudio);
      };
      const finishIntroAudio = () => {
        removeAudioListeners();
        if (introFadeFrameRef.current !== null) {
          window.cancelAnimationFrame(introFadeFrameRef.current);
          introFadeFrameRef.current = null;
        }
        introAudioRef.current = null;
        setAmbienceReady(true);
        setIntroAudioFinished(true);
      };
      const beginCrossfade = () => {
        if (fadeStarted) return;
        fadeStarted = true;
        setAmbienceReady(true);
        const initialVolume = introAudio.volume;
        const remainingMs = Math.max(
          100,
          (introAudio.duration - introAudio.currentTime) * 1000
        );
        const startedAt = performance.now();
        const fadeOut = (now: number) => {
          const progress = Math.min(1, (now - startedAt) / remainingMs);
          introAudio.volume = initialVolume * (1 - progress);
          if (progress < 1 && !introAudio.ended) {
            introFadeFrameRef.current = window.requestAnimationFrame(fadeOut);
          } else {
            introFadeFrameRef.current = null;
          }
        };
        introFadeFrameRef.current = window.requestAnimationFrame(fadeOut);
      };
      const handleTimeUpdate = () => {
        if (!Number.isFinite(introAudio.duration)) return;
        const remainingMs =
          (introAudio.duration - introAudio.currentTime) * 1000;
        if (remainingMs <= INTRO_AUDIO.backgroundCrossfadeMs) {
          beginCrossfade();
        }
      };
      introAudio.addEventListener("timeupdate", handleTimeUpdate);
      introAudio.addEventListener("ended", finishIntroAudio, { once: true });
      introAudio.addEventListener("error", finishIntroAudio, { once: true });
      void introAudio.play().catch(finishIntroAudio);
    }, INTRO_AUDIO.neonDelayMs);
    registerTimer(neonTimer);

    const run = async () => {
      await wait(INITIAL_BLACK_MS, registerTimer);
      if (cancelledRef.current) return;

      for (let index = 0; index < INTRO_TEXT_SEQUENCE.length; index += 1) {
        const sentence = INTRO_TEXT_SEQUENCE[index];
        setPhase("introText");
        setSentenceIndex(index);
        setSentenceVisible(true);
        setSentenceDissolving(false);
        await wait(reducedMotion ? Math.min(sentence.fadeIn, 260) : sentence.fadeIn, registerTimer);
        if (cancelledRef.current) return;
        await wait(sentence.hold, registerTimer);
        if (cancelledRef.current) return;
        setSentenceDissolving(true);
        await wait(reducedMotion ? Math.min(sentence.fadeOut, 280) : sentence.fadeOut, registerTimer);
        if (cancelledRef.current) return;
        setSentenceVisible(false);
        setSentenceDissolving(false);
        await wait(sentence.pauseAfter, registerTimer);
        if (cancelledRef.current) return;
      }

      setSentenceIndex(-1);
      setPhase("introReveal");
      await wait(reducedMotion ? 120 : 420, registerTimer);
      if (cancelledRef.current) return;

      await animateProgress(
        reducedMotion ? 420 : REVEAL_DURATION_MS,
        (progress) => {
          setRevealProgress(progress);
          setOverlayOpacity(1 - progress);
        },
        registerFrame
      );
      if (cancelledRef.current) return;

      setPhase("introCamera");
      await animateProgress(
        reducedMotion ? 360 : INTRO_CAMERA_DURATION_MS,
        setCameraProgress,
        registerFrame
      );
      if (cancelledRef.current) return;

      await wait(reducedMotion ? 80 : INTRO_STABILIZE_MS, registerTimer);
      if (cancelledRef.current) return;

      completeIntro();
    };

    void run();

    return () => {
      cancelledRef.current = true;
      clearScheduledWork();
      stopIntroAudio();
    };
  }, [
    audioUnlocked,
    clearScheduledWork,
    completeIntro,
    mapReady,
    reducedMotion,
    stopIntroAudio,
  ]);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && phase !== "playing") {
        event.preventDefault();
        completeIntro();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [completeIntro, phase]);

  return {
    phase,
    introEnabled: INTRO_ENABLED,
    sentenceIndex,
    sentenceVisible,
    sentenceDissolving,
    overlayOpacity,
    revealProgress,
    cameraProgress,
    neonPlayed,
    introAudioFinished,
    ambienceReady,
    controlState: phase === "playing" ? PLAYING_CONTROL_STATE : LOCKED_CONTROL_STATE,
    skipIntro: completeIntro,
  };
};
