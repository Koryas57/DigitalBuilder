export type WarpState =
  | "inactive"
  | "available"
  | "entered"
  | "cinematic"
  | "completed";

export interface WarpTriggerSnapshot {
  distance: number;
  triggerActive: boolean;
  playerInsideTrigger: boolean;
}

export interface WarpDebugState extends WarpTriggerSnapshot {
  state: WarpState;
  position: [number, number, number];
  intensity: number;
}

export const WARP_CONFIG = {
  position: [-6.70, 1.4, -13] as [number, number, number],
  rotation: [0, 0, 0] as [number, number, number],
  scale: [1, 1, 1] as [number, number, number],
  width: 1.8,
  height: 2.8,
  intensity: 1,
  distortion: 0.82,
  colorA: "#42e8ff",
  colorB: "#8954ff",
  triggerSize: [2, 3, 1.5] as [number, number, number],
  desktopParticleCount: 20,
  mobileParticleCount: 10,
  audio: {
    transitionSrc: "/assets/audio/warpsound.mp3",
    transitionVolume: 0.9,
    transitionStartOffsetSeconds: 2,
    ambienceSrc: "/assets/audio/warpwhisper.mp3",
    ambienceRadius: 15,
    ambienceMaxVolume: 0.62,
    ambienceDistanceCurve: 1.35,
    ambienceFadeSpeed: 2.8,
    loopTrimEndSeconds: 6,
    loopFadeSeconds: 0.85,
  },
  debugToggleKey: "p",
} as const;

export const INITIAL_WARP_DEBUG_STATE: WarpDebugState = {
  state: "inactive",
  distance: 0,
  triggerActive: false,
  position: WARP_CONFIG.position,
  intensity: WARP_CONFIG.intensity,
  playerInsideTrigger: false,
};
