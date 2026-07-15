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
  const neonPlayedRef = React.useRef(false);
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

  const completeIntro = React.useCallback(() => {
    clearScheduledWork();
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
  }, [clearScheduledWork]);

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
      corridorAudioManager.playOneShot(INTRO_AUDIO.neonSrc, INTRO_AUDIO.neonVolume);
      neonPlayedRef.current = true;
      setNeonPlayed(true);
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
    };
  }, [audioUnlocked, clearScheduledWork, completeIntro, mapReady, reducedMotion]);

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
    controlState: phase === "playing" ? PLAYING_CONTROL_STATE : LOCKED_CONTROL_STATE,
    skipIntro: completeIntro,
  };
};
