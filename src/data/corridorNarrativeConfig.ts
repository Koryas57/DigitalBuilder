export type CorridorNarrativePhase =
  | "intro"
  | "firstCallPending"
  | "firstCallPlaying"
  | "firstWarpAvailable"
  | "firstWarpTransition"
  | "secondLoop"
  | "secondCallPending"
  | "secondCallPlaying"
  | "secondCallCompleted";

export type WarpTransitionState =
  | "idle"
  | "entering"
  | "fadingOut"
  | "teleporting"
  | "fadingIn"
  | "completed";

export type WarpOutcome =
  | "loopToSpawn"
  | "playCinematic"
  | "changeScene";

export type MonsterLoopState = "firstLoopActive" | "secondLoopHidden";

export const CORRIDOR_NARRATIVE_CONFIG = {
  warpOutcome: "loopToSpawn" as WarpOutcome,
  warpCooldownMs: 1500,
  warpEnteringMs: 300,
  warpFadeOutMs: 950,
  warpTeleportHoldMs: 420,
  warpFadeInMs: 1200,
  reducedMotionFadeOutMs: 180,
  reducedMotionFadeInMs: 220,
  warpAmbienceFactor: {
    entering: 0.72,
    fadingOut: 0.22,
    teleporting: 0.08,
    fadingIn: 0.48,
  },
} as const;

export const resolveWarpOutcome = (
  narrativePhase: CorridorNarrativePhase
): WarpOutcome => {
  void narrativePhase;
  return CORRIDOR_NARRATIVE_CONFIG.warpOutcome;
};
