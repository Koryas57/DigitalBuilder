import React from "react";
import {
  type NarrativeCallConfig,
  type NarrativeCallState,
} from "../data/narrativeCallConfig";
import {
  type SubtitleCue,
} from "../data/firstCallSubtitles";
import { corridorAudioManager } from "../components/developer/corridor/audio/AudioManager";

export interface NarrativeCallRuntime {
  callId: NarrativeCallConfig["id"];
  state: NarrativeCallState;
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

interface UseNarrativeCallSequenceOptions {
  config: NarrativeCallConfig;
  ready: boolean;
  audioUnlocked: boolean;
  resetToken: number;
  triggerToken?: number;
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

export const useNarrativeCallSequence = ({
  config,
  ready,
  audioUnlocked,
  resetToken,
  triggerToken = 0,
}: UseNarrativeCallSequenceOptions) => {
  const [state, setState] = React.useState<NarrativeCallState>("idle");
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
  const previousTriggerTokenRef = React.useRef(triggerToken);
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
        config.objectiveDurationMs
      ),
      window.setTimeout(() => setResumeHintVisible(false), 3200)
    );
  }, [clearUiTimers, config.objectiveDurationMs]);

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
    ringingRef.current = corridorAudioManager.getAudio(config.audio.ringingSrc);
    voiceRef.current = corridorAudioManager.getAudio(config.audio.voiceSrc);
    endCallRef.current = corridorAudioManager.getAudio(config.audio.endCallSrc);

    ringingRef.current.preload = "auto";
    voiceRef.current.preload = "metadata";
    endCallRef.current.preload = "auto";
    voiceRef.current.load();

    return () => {
      clearUiTimers();
      stopCallAudio();
    };
  }, [
    clearUiTimers,
    config.audio.endCallSrc,
    config.audio.ringingSrc,
    config.audio.voiceSrc,
    stopCallAudio,
  ]);

  React.useEffect(() => {
    if (resetToken === previousResetTokenRef.current) return;
    previousResetTokenRef.current = resetToken;
    reset();
  }, [reset, resetToken]);

  React.useEffect(() => {
    if (triggerToken === previousTriggerTokenRef.current) return;
    previousTriggerTokenRef.current = triggerToken;
    triggerNow();
  }, [triggerNow, triggerToken]);

  React.useEffect(() => {
    if (!ready || state !== "idle") return;
    setState("scheduled");
  }, [ready, state]);

  React.useEffect(() => {
    if (ready || state !== "scheduled") return;
    setState("idle");
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
    }, config.delayAfterControlMs);

    return () => {
      window.clearTimeout(timer);
      setTimerActive(false);
    };
  }, [config.delayAfterControlMs, state]);

  React.useEffect(() => {
    if (state !== "ringing") return undefined;
    const ringing = ringingRef.current;
    if (!ringing) return undefined;

    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
    ringing.loop = true;
    ringing.volume = config.ringingVolume;
    const handlePlaying = () => setRingingAudioActive(true);
    const handleError = () => {
      setRingingAudioActive(false);
      if (import.meta.env.DEV) {
        console.warn(`[${config.id}] Ringing audio could not be loaded.`);
      }
    };
    ringing.addEventListener("playing", handlePlaying);
    ringing.addEventListener("error", handleError);

    void ringing.play().catch(() => {
      setRingingAudioActive(false);
      if (import.meta.env.DEV) {
        console.warn(`[${config.id}] Ringing audio is waiting for audio unlock.`);
      }
    });

    return () => {
      ringing.removeEventListener("playing", handlePlaying);
      ringing.removeEventListener("error", handleError);
      pauseAndReset(ringing);
      setRingingAudioActive(false);
    };
  }, [audioUnlocked, config.id, config.ringingVolume, state]);

  React.useEffect(() => {
    if (state !== "answering") return undefined;
    const timer = window.setTimeout(
      () => setState("playingMessage"),
      config.answerDelayMs
    );
    return () => window.clearTimeout(timer);
  }, [config.answerDelayMs, state]);

  React.useEffect(() => {
    if (state !== "playingMessage") return undefined;
    const voice = voiceRef.current;
    if (!voice) {
      setError("Le message téléphonique est indisponible.");
      setState("ending");
      return undefined;
    }

    voice.loop = false;
    voice.volume = config.voiceVolume;
    voice.currentTime = 0;

    const updateMetadata = () => {
      setVoiceDuration(Number.isFinite(voice.duration) ? voice.duration : 0);
    };
    const updateTime = () => {
      const nextTime = voice.currentTime;
      setVoiceCurrentTime(nextTime);
      const nextCue = config.subtitles.findIndex(
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
        console.warn(`[${config.id}] Voice audio could not be loaded.`);
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
  }, [config.id, config.subtitles, config.voiceVolume, state]);

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
      endCall.volume = config.endCallVolume;
      endCall.addEventListener("ended", complete, { once: true });
      endCall.addEventListener("error", complete, { once: true });
      startEndCallPlayback = () => {
        const startOffset = Number.isFinite(endCall.duration)
          ? Math.min(
              config.endCallStartOffsetSeconds,
              Math.max(0, endCall.duration - 0.05)
            )
          : config.endCallStartOffsetSeconds;
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
      config.endCallDelayMs
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
  }, [
    config.endCallDelayMs,
    config.endCallStartOffsetSeconds,
    config.endCallVolume,
    finishSequence,
    state,
  ]);

  // Only the drag-to-look input is suspended while the slider needs the pointer.
  // Keyboard/touch movement remains enabled by the corridor controller.
  const controlsSuspended = state === "ringing";
  const ambienceDuckFactor =
    state === "answering" || state === "playingMessage" || state === "ending"
      ? config.ambienceDuckFactor
      : 1;
  const currentCue: SubtitleCue | null =
    currentCueIndex >= 0 ? config.subtitles[currentCueIndex] : null;

  const runtime = React.useMemo<NarrativeCallRuntime>(
    () => ({
      callId: config.id,
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
      config.id,
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
    triggerNow,
  };
};
