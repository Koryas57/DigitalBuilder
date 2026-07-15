import React from "react";
import * as THREE from "three";
import {
  BASE_FOV,
  DEFAULT_INTRO_CAMERA_STATE,
  INTRO_FOV_MIN,
  INTRO_YAW_OFFSET,
  type ExperiencePhase,
  type IntroCameraState,
} from "./introConfig";

interface IntroCameraControllerProps {
  phase: ExperiencePhase;
  finalYaw: number;
  progress: number;
  reducedMotion: boolean;
  onCameraStateChange: (state: IntroCameraState) => void;
}

const easeInOutCubic = (value: number) =>
  value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2;

const lerpAngle = (from: number, to: number, progress: number) => {
  const delta = Math.atan2(Math.sin(to - from), Math.cos(to - from));
  return from + delta * progress;
};

export const IntroCameraController: React.FC<IntroCameraControllerProps> = ({
  phase,
  finalYaw,
  progress,
  reducedMotion,
  onCameraStateChange,
}) => {
  React.useEffect(() => {
    if (phase === "playing") {
      onCameraStateChange({
        ...DEFAULT_INTRO_CAMERA_STATE,
        yaw: finalYaw,
        fov: BASE_FOV,
      });
      return;
    }

    if (phase === "loading") {
      onCameraStateChange({
        ...DEFAULT_INTRO_CAMERA_STATE,
        active: false,
        yaw: finalYaw,
        fov: BASE_FOV,
      });
      return;
    }

    const cameraProgress = phase === "introCamera"
      ? THREE.MathUtils.clamp(reducedMotion ? 1 : progress, 0, 1)
      : 0;
    const easedProgress = easeInOutCubic(cameraProgress);
    const startYaw = finalYaw;
    const targetYaw = finalYaw + INTRO_YAW_OFFSET;
    const yaw = lerpAngle(startYaw, targetYaw, easedProgress);
    const vertigo = Math.sin(cameraProgress * Math.PI);
    const fov = reducedMotion
      ? BASE_FOV
      : THREE.MathUtils.lerp(BASE_FOV, INTRO_FOV_MIN, vertigo);
    const settle = 1 - easedProgress;

    onCameraStateChange({
      active: true,
      progress: cameraProgress,
      yaw,
      pitch: reducedMotion ? 0 : Math.sin(cameraProgress * Math.PI * 0.9) * 0.012 * settle,
      roll: reducedMotion ? 0 : Math.sin(cameraProgress * Math.PI * 1.35) * 0.004 * settle,
      fov,
      verticalOffset: reducedMotion ? 0 : Math.sin(cameraProgress * Math.PI * 1.8) * 0.012 * settle,
      lateralOffset: reducedMotion ? 0 : Math.sin(cameraProgress * Math.PI * 1.15) * 0.008 * settle,
    });
  }, [finalYaw, onCameraStateChange, phase, progress, reducedMotion]);

  return null;
};
