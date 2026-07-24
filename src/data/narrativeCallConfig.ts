import {
  FIRST_CALL_SUBTITLES,
  type SubtitleCue,
} from "./firstCallSubtitles";
import { SECOND_CALL_SUBTITLES } from "./secondCallSubtitles";

export type NarrativeCallState =
  | "idle"
  | "scheduled"
  | "ringing"
  | "answering"
  | "playingMessage"
  | "ending"
  | "completed";

export interface NarrativeCallConfig {
  id: "first-call" | "second-call";
  audio: {
    ringingSrc: string;
    voiceSrc: string;
    endCallSrc: string;
  };
  delayAfterControlMs: number;
  ringingVolume: number;
  voiceVolume: number;
  endCallVolume: number;
  ambienceDuckFactor: number;
  fadeDurationMs: number;
  answerDelayMs: number;
  endCallDelayMs: number;
  endCallStartOffsetSeconds: number;
  objectiveDurationMs: number;
  caller: string;
  incomingLabel: string;
  slideHint: string;
  completedLabel: string;
  resumeHint: string;
  subtitles: SubtitleCue[];
  objective?: {
    label: string;
    text: string;
  };
}

const SHARED_CALL_AUDIO = {
  ringingSrc: "/assets/audio/PhoneVibrating.wav",
  endCallSrc: "/assets/audio/EndCall.mp3",
};

const SHARED_CALL_BEHAVIOR = {
  delayAfterControlMs: 5000,
  ringingVolume: 0.64,
  voiceVolume: 1,
  endCallVolume: 0.78,
  ambienceDuckFactor: 0.35,
  fadeDurationMs: 450,
  answerDelayMs: 160,
  endCallDelayMs: 110,
  endCallStartOffsetSeconds: 2,
  objectiveDurationMs: 4200,
  caller: "INCONNU",
  incomingLabel: "APPEL ENTRANT",
  slideHint: "Glissez pour décrocher",
  completedLabel: "APPEL TERMINÉ",
  resumeHint: "Cliquez dans la scène pour reprendre les contrôles.",
};

export const FIRST_CALL_CONFIG: NarrativeCallConfig = {
  ...SHARED_CALL_BEHAVIOR,
  id: "first-call",
  audio: {
    ...SHARED_CALL_AUDIO,
    voiceSrc: "/assets/audio/FirstCall.wav",
  },
  subtitles: FIRST_CALL_SUBTITLES,
  objective: {
    label: "OBJECTIF MIS À JOUR",
    text: "Trouver une sortie.",
  },
};

export const SECOND_CALL_CONFIG: NarrativeCallConfig = {
  ...SHARED_CALL_BEHAVIOR,
  id: "second-call",
  audio: {
    ...SHARED_CALL_AUDIO,
    voiceSrc: "/assets/audio/SecondCall.wav",
  },
  subtitles: SECOND_CALL_SUBTITLES,
};
