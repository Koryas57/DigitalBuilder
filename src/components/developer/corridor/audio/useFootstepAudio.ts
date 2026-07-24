import React from "react";
import { corridorAudioManager } from "./AudioManager";

const FOOTSTEP_SOURCE = "/assets/audio/Footsteps.mp3";
const FOOTSTEP_SEGMENTS = [0.04, 0.38, 0.72, 1.06, 1.4, 1.74];
const WALK_SEGMENT_DURATION = 0.28;
const SPRINT_SEGMENT_DURATION = 0.22;
const WALK_STEP_SPACING_MS = 190;
const SPRINT_STEP_SPACING_MS = 68;
const WALK_MIN_INTERVAL_MS = 175;
const SPRINT_MIN_INTERVAL_MS = 55;

export const DEFAULT_FOOTSTEP_VOLUME = 1;

export const useFootstepAudio = (
  footstepStep: number,
  sprinting: boolean,
  volume: number
) => {
  const stepIndexRef = React.useRef(0);
  const previousFootstepStepRef = React.useRef(0);
  const timersRef = React.useRef<Set<number>>(new Set());

  React.useEffect(
    () => () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current.clear();
    },
    []
  );

  React.useEffect(() => {
    const pendingSteps = footstepStep - previousFootstepStepRef.current;
    previousFootstepStepRef.current = footstepStep;
    if (footstepStep <= 0 || volume <= 0 || pendingSteps <= 0) return;

    const spacingMs = sprinting
      ? SPRINT_STEP_SPACING_MS
      : WALK_STEP_SPACING_MS;

    for (let pendingIndex = 0; pendingIndex < pendingSteps; pendingIndex += 1) {
      const segmentIndex = stepIndexRef.current % FOOTSTEP_SEGMENTS.length;
      const startTime = FOOTSTEP_SEGMENTS[segmentIndex];
      stepIndexRef.current += 1;

      const playStep = () => {
        corridorAudioManager.playSegment(
          FOOTSTEP_SOURCE,
          startTime,
          sprinting ? SPRINT_SEGMENT_DURATION : WALK_SEGMENT_DURATION,
          Math.min(1, sprinting ? volume * 1.1 : volume),
          sprinting ? 1.06 : 0.96 + (segmentIndex % 3) * 0.025,
          sprinting ? SPRINT_MIN_INTERVAL_MS : WALK_MIN_INTERVAL_MS
        );
      };

      if (pendingIndex === 0) {
        playStep();
      } else {
        const timer = window.setTimeout(() => {
          timersRef.current.delete(timer);
          playStep();
        }, pendingIndex * spacingMs);
        timersRef.current.add(timer);
      }
    }
  }, [footstepStep, sprinting, volume]);
};
