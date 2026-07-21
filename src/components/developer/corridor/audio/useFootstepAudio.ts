import React from "react";
import { corridorAudioManager } from "./AudioManager";

const FOOTSTEP_SOURCE = "/assets/audio/Footsteps.mp3";
const FOOTSTEP_SEGMENTS = [0.04, 0.38, 0.72, 1.06, 1.4, 1.74];
const WALK_SEGMENT_DURATION = 0.28;
const SPRINT_SEGMENT_DURATION = 0.22;
const WALK_MIN_INTERVAL_MS = 190;
const SPRINT_MIN_INTERVAL_MS = 132;

export const DEFAULT_FOOTSTEP_VOLUME = 1;

export const useFootstepAudio = (
  footstepStep: number,
  sprinting: boolean,
  volume: number
) => {
  const stepIndexRef = React.useRef(0);
  const previousFootstepStepRef = React.useRef(0);

  React.useEffect(() => {
    if (footstepStep <= 0 || volume <= 0) return;
    const pendingSteps = footstepStep - previousFootstepStepRef.current;
    previousFootstepStepRef.current = footstepStep;
    if (pendingSteps <= 0) return;

    const segmentIndex = stepIndexRef.current % FOOTSTEP_SEGMENTS.length;
    const startTime = FOOTSTEP_SEGMENTS[segmentIndex];
    stepIndexRef.current += 1;

    corridorAudioManager.playSegment(
      FOOTSTEP_SOURCE,
      startTime,
      sprinting ? SPRINT_SEGMENT_DURATION : WALK_SEGMENT_DURATION,
      Math.min(1, sprinting ? volume * 1.1 : volume),
      sprinting ? 1.06 : 0.96 + (segmentIndex % 3) * 0.025,
      sprinting ? SPRINT_MIN_INTERVAL_MS : WALK_MIN_INTERVAL_MS
    );
  }, [footstepStep, sprinting, volume]);
};
