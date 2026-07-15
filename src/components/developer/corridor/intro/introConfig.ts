export type ExperiencePhase =
  | "loading"
  | "introBlack"
  | "introText"
  | "introReveal"
  | "introCamera"
  | "playing";

export interface PlayerControlState {
  controlsEnabled: boolean;
  movementEnabled: boolean;
  lookEnabled: boolean;
  headBobEnabled: boolean;
  sprintEnabled: boolean;
}

export interface IntroCameraState {
  active: boolean;
  progress: number;
  yaw: number;
  pitch: number;
  roll: number;
  fov: number;
  verticalOffset: number;
  lateralOffset: number;
}

export interface IntroSentenceConfig {
  text: string;
  fadeIn: number;
  hold: number;
  fadeOut: number;
  pauseAfter: number;
}

export const INTRO_ENABLED = true;
export const INTRO_SKIP_IN_DEBUG = false;

export const INITIAL_BLACK_MS = 1000;
export const REVEAL_DURATION_MS = 1400;
export const INTRO_CAMERA_DURATION_MS = 3000;
export const INTRO_STABILIZE_MS = 280;
export const CONTROL_HINT_DELAY_MS = 3000;
export const CONTROL_HINT_DURATION_MS = 4800;

export const INTRO_YAW_OFFSET = Math.PI / 2;
export const BASE_FOV = 72;
export const INTRO_FOV_MIN = 69;

export const INTRO_AUDIO = {
  backgroundSrc: "/assets/audio/Background.mp3",
  neonSrc: "/assets/audio/Neon.mp3",
  backgroundFadeInMs: 2000,
  backgroundStartDelayMs: 250,
  neonDelayMs: 700,
  neonVolume: 0.42,
};

export const LOCKED_CONTROL_STATE: PlayerControlState = {
  controlsEnabled: false,
  movementEnabled: false,
  lookEnabled: false,
  headBobEnabled: false,
  sprintEnabled: false,
};

export const PLAYING_CONTROL_STATE: PlayerControlState = {
  controlsEnabled: true,
  movementEnabled: true,
  lookEnabled: true,
  headBobEnabled: true,
  sprintEnabled: true,
};

export const INTRO_TEXT_SEQUENCE: IntroSentenceConfig[] = [
  {
    text: "...",
    fadeIn: 700,
    hold: 950,
    fadeOut: 700,
    pauseAfter: 320,
  },
  {
    text: "Vous ne savez plus depuis combien de temps vous marchez.",
    fadeIn: 900,
    hold: 1700,
    fadeOut: 900,
    pauseAfter: 400,
  },
  {
    text: "...",
    fadeIn: 700,
    hold: 950,
    fadeOut: 700,
    pauseAfter: 320,
  },
  {
    text: "Vous ne vous souvenez même plus de votre nom.",
    fadeIn: 900,
    hold: 1700,
    fadeOut: 900,
    pauseAfter: 400,
  },
  {
    text: "...",
    fadeIn: 700,
    hold: 950,
    fadeOut: 700,
    pauseAfter: 320,
  },
  {
    text: "Une seule chose est certaine.",
    fadeIn: 900,
    hold: 1700,
    fadeOut: 900,
    pauseAfter: 400,
  },
  {
    text: "...",
    fadeIn: 700,
    hold: 950,
    fadeOut: 700,
    pauseAfter: 320,
  },
  {
    text: "Quelque chose vous attend au bout du couloir.",
    fadeIn: 900,
    hold: 1700,
    fadeOut: 900,
    pauseAfter: 400,
  },
  {
    text: "...",
    fadeIn: 700,
    hold: 950,
    fadeOut: 700,
    pauseAfter: 320,
  },
  {
    text: "Avancez.",
    fadeIn: 900,
    hold: 1700,
    fadeOut: 900,
    pauseAfter: 500,
  },
];

export const DEFAULT_INTRO_CAMERA_STATE: IntroCameraState = {
  active: false,
  progress: 1,
  yaw: 0,
  pitch: 0,
  roll: 0,
  fov: BASE_FOV,
  verticalOffset: 0,
  lateralOffset: 0,
};
