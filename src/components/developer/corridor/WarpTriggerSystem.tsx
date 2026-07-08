import React from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useWarpAudio } from "./audio/useWarpAudio";

interface WarpTriggerSystemProps {
  position: THREE.Vector3;
  playerPositionRef: React.MutableRefObject<THREE.Vector3>;
  onPortalContactChange: (active: boolean) => void;
}

export const WarpTriggerSystem: React.FC<WarpTriggerSystemProps> = ({
  position,
  playerPositionRef,
  onPortalContactChange,
}) => {
  const contactRef = React.useRef(false);
  const { playWarpLocked } = useWarpAudio();

  useFrame(() => {
    const distance = playerPositionRef.current.distanceTo(position);
    const active = distance < 1.25;
    if (active !== contactRef.current) {
      contactRef.current = active;
      onPortalContactChange(active);
      if (active) playWarpLocked();
    }
  });

  return null;
};
