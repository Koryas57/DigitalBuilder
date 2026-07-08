import React from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { CameraSequence } from "./CameraSequence";

interface SequenceTriggerProps {
  sequence: CameraSequence;
  position: [number, number, number];
  radius: number;
  disabled?: boolean;
  replayable?: boolean;
  onTrigger: (sequence: CameraSequence) => void;
}

export const SequenceTrigger: React.FC<SequenceTriggerProps> = ({
  sequence,
  position,
  radius,
  disabled = false,
  replayable,
  onTrigger,
}) => {
  const { camera } = useThree();
  const hasTriggeredRef = React.useRef(false);
  const center = React.useMemo(() => new THREE.Vector3(...position), [position]);

  useFrame(() => {
    if (disabled) return;
    if (hasTriggeredRef.current && !replayable && !sequence.replayable) return;

    const distance = camera.position.distanceTo(center);
    if (distance > radius) return;

    hasTriggeredRef.current = true;
    onTrigger(sequence);
  });

  return null;
};
