import React from "react";
import {
  CORRIDOR_NARRATIVE_CONFIG,
  type WarpTransitionState,
} from "../../../../data/corridorNarrativeConfig";

interface UseWarpTransitionOptions {
  reducedMotion: boolean;
  onTeleport: () => void;
  onCompleted: () => void;
}

export const useWarpTransition = ({
  reducedMotion,
  onTeleport,
  onCompleted,
}: UseWarpTransitionOptions) => {
  const [state, setState] = React.useState<WarpTransitionState>("idle");
  const stateRef = React.useRef<WarpTransitionState>("idle");
  const timersRef = React.useRef<number[]>([]);
  const onTeleportRef = React.useRef(onTeleport);
  const onCompletedRef = React.useRef(onCompleted);

  onTeleportRef.current = onTeleport;
  onCompletedRef.current = onCompleted;

  const clearTimers = React.useCallback(() => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  }, []);

  const moveTo = React.useCallback((nextState: WarpTransitionState) => {
    stateRef.current = nextState;
    setState(nextState);
  }, []);

  const schedule = React.useCallback((callback: () => void, delay: number) => {
    const timer = window.setTimeout(callback, delay);
    timersRef.current.push(timer);
  }, []);

  const start = React.useCallback(() => {
    if (stateRef.current !== "idle" && stateRef.current !== "completed") {
      return false;
    }

    clearTimers();
    moveTo("entering");
    schedule(() => {
      moveTo("fadingOut");
      schedule(() => {
        moveTo("teleporting");
        onTeleportRef.current();
        schedule(() => {
          moveTo("fadingIn");
          schedule(() => {
            moveTo("completed");
            onCompletedRef.current();
            schedule(
              () => moveTo("idle"),
              CORRIDOR_NARRATIVE_CONFIG.warpCooldownMs
            );
          }, reducedMotion
            ? CORRIDOR_NARRATIVE_CONFIG.reducedMotionFadeInMs
            : CORRIDOR_NARRATIVE_CONFIG.warpFadeInMs);
        }, CORRIDOR_NARRATIVE_CONFIG.warpTeleportHoldMs);
      }, reducedMotion
        ? CORRIDOR_NARRATIVE_CONFIG.reducedMotionFadeOutMs
        : CORRIDOR_NARRATIVE_CONFIG.warpFadeOutMs);
    }, reducedMotion ? 0 : CORRIDOR_NARRATIVE_CONFIG.warpEnteringMs);

    return true;
  }, [clearTimers, moveTo, reducedMotion, schedule]);

  const reset = React.useCallback(() => {
    clearTimers();
    moveTo("idle");
  }, [clearTimers, moveTo]);

  React.useEffect(
    () => () => {
      clearTimers();
      stateRef.current = "idle";
    },
    [clearTimers]
  );

  const active =
    state === "entering" ||
    state === "fadingOut" ||
    state === "teleporting" ||
    state === "fadingIn";

  return {
    state,
    active,
    start,
    reset,
  };
};
