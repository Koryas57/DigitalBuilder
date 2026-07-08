import * as THREE from "three";
import type { CameraEase, CameraSequence, CameraSequenceStep } from "./CameraSequence";

export const easeCamera = (progress: number, ease: CameraEase = "smooth") => {
  const t = THREE.MathUtils.clamp(progress, 0, 1);
  if (ease === "out") return 1 - Math.pow(1 - t, 3);
  if (ease === "inOut") return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  return t * t * (3 - 2 * t);
};

export const getSequenceDuration = (sequence: CameraSequence) =>
  sequence.steps.reduce((total, step) => total + step.duration, 0);

export const getSequenceFrame = (
  sequence: CameraSequence,
  elapsed: number
): {
  step: CameraSequenceStep;
  stepProgress: number;
  totalProgress: number;
  position: THREE.Vector3;
  lookAt: THREE.Vector3;
} => {
  const duration = getSequenceDuration(sequence);
  let cursor = 0;

  for (let index = 0; index < sequence.steps.length; index += 1) {
    const step = sequence.steps[index];
    const nextCursor = cursor + step.duration;
    if (elapsed <= nextCursor || index === sequence.steps.length - 1) {
      const previousStep = sequence.steps[Math.max(0, index - 1)] ?? step;
      const eased = easeCamera((elapsed - cursor) / step.duration, step.ease);
      const fromPosition = new THREE.Vector3(...previousStep.position);
      const toPosition = new THREE.Vector3(...step.position);
      const fromLookAt = new THREE.Vector3(...previousStep.lookAt);
      const toLookAt = new THREE.Vector3(...step.lookAt);

      return {
        step,
        stepProgress: eased,
        totalProgress: THREE.MathUtils.clamp(elapsed / duration, 0, 1),
        position: fromPosition.lerp(toPosition, eased),
        lookAt: fromLookAt.lerp(toLookAt, eased),
      };
    }

    cursor = nextCursor;
  }

  const last = sequence.steps[sequence.steps.length - 1];
  return {
    step: last,
    stepProgress: 1,
    totalProgress: 1,
    position: new THREE.Vector3(...last.position),
    lookAt: new THREE.Vector3(...last.lookAt),
  };
};

