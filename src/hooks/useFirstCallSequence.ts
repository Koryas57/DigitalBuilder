import React from "react";
import {
  FIRST_CALL_AUDIO,
  FIRST_CALL_AUDIO_CONFIG,
  type FirstCallState,
} from "../data/firstCallConfig";
import {
  FIRST_CALL_SUBTITLES,
  type SubtitleCue,
} from "../data/firstCallSubtitles";
import { corridorAudioManager } from "../components/developer/corridor/audio/AudioManager";

export interface FirstCallRuntime {
  state: FirstCallState;
  timerActive: boolean;
  ringingAudioActive: boolean;
  voiceCurrentTime: number;
  voiceDuration: number;
  currentCueIndex: number;
  audioUnlocked: boolean;
  controlsSuspended: boolean;
  completed: boolean;
  ambienceDuckFactor: number;
  objectiveVisible: boolean;
  resumeHintVisible: boolean;
  error: string | null;
}

interface UseFirstCallSequenceOptions {
  ready: boolean;
  audioUnlocked: boolean;
  resetToken: number;
}

const pauseAndReset = (audio: HTMLAudioElement | null) => {
  if (!audio) return;
  audio.pause();
  audio.loop = false;
  try {
    audio.currentTime = 0;
  } catch {
    // Metadata may not be available yet.
  }
};

export const useFirstCallSequence = ({
  ready,
  audioUnlocked,
  resetToken,
}: UseFirstCallSequenceOptions) => {
  const [state, setState] = React.useState<FirstCallState>("idle");
  const [timerActive, setTimerActive] = React.useState(false);
  const [ringingAudioActive, setRingingAudioActive] = React.useState(false);
  const [voiceCurrentTime, setVoiceCurrentTime] = React.useState(0);
  const [voiceDuration, setVoiceDuration] = React.useState(0);
  const [currentCueIndex, setCurrentCueIndex] = React.useState(-1);
  const [objectiveVisible, setObjectiveVisible] = React.useState(false);
  const [resumeHintVisible, setResumeHintVisible] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const ringingRef = React.useRef<HTMLAudioElement | null>(null);
  const voiceRef = React.useRef<HTMLAudioElement | null>(null);
  const endCallRef = React.useRef<HTMLAudioElement | null>(null);
  const previousResetTokenRef = React.useRef(resetToken);
  const uiTimersRef = React.useRef<number[]>([]);

  const clearUiTimers = React.useCallback(() => {
    uiTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    uiTimersRef.current = [];
  }, []);

  const stopCallAudio = React.useCallback(() => {
    pauseAndReset(ringingRef.current);
    pauseAndReset(voiceRef.current);
    pauseAndReset(endCallRef.current);
    setRingingAudioActive(false);
  }, []);

  const finishSequence = React.useCallback(() => {
    pauseAndReset(endCallRef.current);
    setState("completed");
    setCurrentCueIndex(-1);
    setObjectiveVisible(true);
    setResumeHintVisible(true);
    clearUiTimers();
    uiTimersRef.current.push(
      window.setTimeout(
        () => setObjectiveVisible(false),
        FIRST_CALL_AUDIO_CONFIG.objectiveDurationMs
      ),
      window.setTimeout(() => setResumeHintVisible(false), 3200)
    );
  }, [clearUiTimers]);

  const reset = React.useCallback(() => {
    stopCallAudio();
    clearUiTimers();
    setTimerActive(false);
    setVoiceCurrentTime(0);
    setVoiceDuration(0);
    setCurrentCueIndex(-1);
    setObjectiveVisible(false);
    setResumeHintVisible(false);
    setError(null);
    setState("idle");
  }, [clearUiTimers, stopCallAudio]);

  const triggerNow = React.useCallback(() => {
    stopCallAudio();
    clearUiTimers();
    setError(null);
    setObjectiveVisible(false);
    setResumeHintVisible(false);
    setTimerActive(false);
    setVoiceCurrentTime(0);
    setCurrentCueIndex(-1);
    setState("ringing");
  }, [clearUiTimers, stopCallAudio]);

  const answer = React.useCallback(() => {
    if (state !== "ringing") return;
    pauseAndReset(ringingRef.current);
    setRingingAudioActive(false);
    setState("answering");
  }, [state]);

  React.useEffect(() => {
    ringingRef.current = corridorAudioManager.getAudio(FIRST_CALL_AUDIO.ringingSrc);
    voiceRef.current = corridorAudioManager.getAudio(FIRST_CALL_AUDIO.voiceSrc);
    endCallRef.current = corridorAudioManager.getAudio(FIRST_CALL_AUDIO.endCallSrc);

    ringingRef.current.preload = "auto";
    voiceRef.current.preload = "metadata";
    endCallRef.current.preload = "auto";
    voiceRef.current.load();

    return () => {
      clearUiTimers();
      stopCallAudio();
    };
  }, [clearUiTimers, stopCallAudio]);

  React.useEffect(() => {
    if (resetToken === previousResetTokenRef.current) return;
    previousResetTokenRef.current = resetToken;
    reset();
  }, [reset, resetToken]);

  React.useEffect(() => {
    if (!ready || state !== "idle") return;
    setState("scheduled");
  }, [ready, state]);

  React.useEffect(() => {
    if (state !== "scheduled") {
      setTimerActive(false);
      return undefined;
    }

    setTimerActive(true);
    const timer = window.setTimeout(() => {
      setTimerActive(false);
      setState("ringing");
    }, FIRST_CALL_AUDIO_CONFIG.delayAfterControlMs);

    return () => {
      window.clearTimeout(timer);
      setTimerActive(false);
    };
  }, [state]);

  React.useEffect(() => {
    if (state !== "ringing") return undefined;
    const ringing = ringingRef.current;
    if (!ringing) return undefined;

    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
    ringing.loop = true;
    ringing.volume = FIRST_CALL_AUDIO_CONFIG.ringingVolume;
    const handlePlaying = () => setRingingAudioActive(true);
    const handleError = () => {
      setRingingAudioActive(false);
      if (import.meta.env.DEV) {
        console.warn("[First call] PhoneVibrating.wav could not be loaded.");
      }
    };
    ringing.addEventListener("playing", handlePlaying);
    ringing.addEventListener("error", handleError);

    void ringing.play().catch(() => {
      setRingingAudioActive(false);
      if (import.meta.env.DEV) {
        console.warn("[First call] Ringing audio is waiting for audio unlock.");
      }
    });

    return () => {
      ringing.removeEventListener("playing", handlePlaying);
      ringing.removeEventListener("error", handleError);
      pauseAndReset(ringing);
      setRingingAudioActive(false);
    };
  }, [audioUnlocked, state]);

  React.useEffect(() => {
    if (state !== "answering") return undefined;
    const timer = window.setTimeout(
      () => setState("playingMessage"),
      FIRST_CALL_AUDIO_CONFIG.answerDelayMs
    );
    return () => window.clearTimeout(timer);
  }, [state]);

  React.useEffect(() => {
    if (state !== "playingMessage") return undefined;
    const voice = voiceRef.current;
    if (!voice) {
      setError("Le message téléphonique est indisponible.");
      setState("ending");
      return undefined;
    }

    voice.loop = false;
    voice.volume = FIRST_CALL_AUDIO_CONFIG.voiceVolume;
    voice.currentTime = 0;

    const updateMetadata = () => {
      setVoiceDuration(Number.isFinite(voice.duration) ? voice.duration : 0);
    };
    const updateTime = () => {
      const nextTime = voice.currentTime;
      setVoiceCurrentTime(nextTime);
      const nextCue = FIRST_CALL_SUBTITLES.findIndex(
        (cue) => nextTime >= cue.start && nextTime < cue.end
      );
      setCurrentCueIndex((current) => (current === nextCue ? current : nextCue));
    };
    const handleEnded = () => {
      setVoiceCurrentTime(voice.duration || voice.currentTime);
      setCurrentCueIndex(-1);
      setState("ending");
    };
    const handleError = () => {
      setError("Le message téléphonique est indisponible.");
      setCurrentCueIndex(-1);
      setState("ending");
      if (import.meta.env.DEV) {
        console.warn("[First call] FirstCall.mp3 could not be loaded.");
      }
    };

    voice.addEventListener("loadedmetadata", updateMetadata);
    voice.addEventListener("durationchange", updateMetadata);
    voice.addEventListener("timeupdate", updateTime);
    voice.addEventListener("ended", handleEnded);
    voice.addEventListener("error", handleError);
    updateMetadata();
    void voice.play().catch(handleError);

    return () => {
      voice.removeEventListener("loadedmetadata", updateMetadata);
      voice.removeEventListener("durationchange", updateMetadata);
      voice.removeEventListener("timeupdate", updateTime);
      voice.removeEventListener("ended", handleEnded);
      voice.removeEventListener("error", handleError);
      pauseAndReset(voice);
    };
  }, [state]);

  React.useEffect(() => {
    if (state !== "ending") return undefined;
    const endCall = endCallRef.current;
    let cancelled = false;
    let fallbackTimer: number | null = null;
    let startEndCallPlayback: (() => void) | null = null;

    const complete = () => {
      if (cancelled) return;
      if (fallbackTimer !== null) window.clearTimeout(fallbackTimer);
      finishSequence();
    };
    const playEndCall = () => {
      if (!endCall) {
        complete();
        return;
      }
      endCall.loop = false;
      endCall.volume = FIRST_CALL_AUDIO_CONFIG.endCallVolume;
      endCall.addEventListener("ended", complete, { once: true });
      endCall.addEventListener("error", complete, { once: true });
      startEndCallPlayback = () => {
        const startOffset = Number.isFinite(endCall.duration)
          ? Math.min(
              FIRST_CALL_AUDIO_CONFIG.endCallStartOffsetSeconds,
              Math.max(0, endCall.duration - 0.05)
            )
          : FIRST_CALL_AUDIO_CONFIG.endCallStartOffsetSeconds;
        endCall.currentTime = startOffset;
        void endCall.play().catch(complete);
        fallbackTimer = window.setTimeout(
          complete,
          Number.isFinite(endCall.duration)
            ? Math.max(0, endCall.duration - startOffset) * 1000 + 600
            : 3200
        );
      };

      if (endCall.readyState >= 1) {
        startEndCallPlayback();
      } else {
        endCall.addEventListener("loadedmetadata", startEndCallPlayback, {
          once: true,
        });
        endCall.load();
      }
    };

    const delayTimer = window.setTimeout(
      playEndCall,
      FIRST_CALL_AUDIO_CONFIG.endCallDelayMs
    );

    return () => {
      cancelled = true;
      window.clearTimeout(delayTimer);
      if (fallbackTimer !== null) window.clearTimeout(fallbackTimer);
      endCall?.removeEventListener("ended", complete);
      endCall?.removeEventListener("error", complete);
      if (startEndCallPlayback) {
        endCall?.removeEventListener(
          "loadedmetadata",
          startEndCallPlayback
        );
      }
      pauseAndReset(endCall);
    };
  }, [finishSequence, state]);

  React.useEffect(() => {
    if (!import.meta.env.DEV) return undefined;
    const handleDebugKey = (event: KeyboardEvent) => {
      if (event.key === "F7") {
        event.preventDefault();
        triggerNow();
      }
      if (event.key === "F8") {
        event.preventDefault();
        reset();
      }
      if (event.key === "F9") {
        event.preventDefault();
        if (state === "playingMessage" || state === "answering") {
          setCurrentCueIndex(-1);
          setState("ending");
        }
      }
    };
    window.addEventListener("keydown", handleDebugKey);
    return () => window.removeEventListener("keydown", handleDebugKey);
  }, [reset, state, triggerNow]);

  // Only the drag-to-look input is suspended while the slider needs the pointer.
  // Keyboard/touch movement remains enabled by the corridor controller.
  const controlsSuspended = state === "ringing";
  const ambienceDuckFactor =
    state === "answering" || state === "playingMessage" || state === "ending"
      ? FIRST_CALL_AUDIO_CONFIG.ambienceDuckFactor
      : 1;
  const currentCue: SubtitleCue | null =
    currentCueIndex >= 0 ? FIRST_CALL_SUBTITLES[currentCueIndex] : null;

  const runtime = React.useMemo<FirstCallRuntime>(
    () => ({
      state,
      timerActive,
      ringingAudioActive,
      voiceCurrentTime,
      voiceDuration,
      currentCueIndex,
      audioUnlocked,
      controlsSuspended,
      completed: state === "completed",
      ambienceDuckFactor,
      objectiveVisible,
      resumeHintVisible,
      error,
    }),
    [
      ambienceDuckFactor,
      audioUnlocked,
      controlsSuspended,
      currentCueIndex,
      error,
      objectiveVisible,
      resumeHintVisible,
      ringingAudioActive,
      state,
      timerActive,
      voiceCurrentTime,
      voiceDuration,
    ]
  );

  return {
    runtime,
    currentCue,
    answer,
    reset,
  };
};
