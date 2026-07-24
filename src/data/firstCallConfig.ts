export type FirstCallState =
  | "idle"
  | "scheduled"
  | "ringing"
  | "answering"
  | "playingMessage"
  | "ending"
  | "completed";

export const FIRST_CALL_AUDIO = {
  ringingSrc: "/assets/audio/PhoneVibrating.wav",
  voiceSrc: "/assets/audio/FirstCall.wav",
  endCallSrc: "/assets/audio/EndCall.mp3",
};

export const FIRST_CALL_AUDIO_CONFIG = {
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
};

export const FIRST_CALL_UI = {
  caller: "INCONNU",
  incomingLabel: "APPEL ENTRANT",
  slideHint: "Glissez pour décrocher",
  completedLabel: "APPEL TERMINÉ",
  resumeHint: "Cliquez dans la scène pour reprendre les contrôles.",
};

export const FIRST_CALL_OBJECTIVE = {
  label: "OBJECTIF MIS À JOUR",
  text: "Trouver une sortie.",
};
