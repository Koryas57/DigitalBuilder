import React from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { WarpTriggerSnapshot } from "../../../../data/warpConfig";

interface WarpTriggerProps {
  position: [number, number, number];
  rotation: [number, number, number];
  size: [number, number, number];
  playerPositionRef: React.MutableRefObject<THREE.Vector3>;
  active: boolean;
  onEnter: () => void;
  onDebugChange: (snapshot: WarpTriggerSnapshot) => void;
}

export const WarpTrigger: React.FC<WarpTriggerProps> = ({
  position,
  rotation,
  size,
  playerPositionRef,
  active,
  onEnter,
  onDebugChange,
}) => {
  const enteredRef = React.useRef(false);
  const lastDebugUpdateRef = React.useRef(0);
  const portalPosition = React.useMemo(() => new THREE.Vector3(...position), [position]);
  const inverseRotation = React.useMemo(
    () =>
      new THREE.Quaternion()
        .setFromEuler(new THREE.Euler(...rotation))
        .invert(),
    [rotation]
  );
  const localPlayerRef = React.useRef(new THREE.Vector3());

  React.useEffect(() => {
    if (!active) enteredRef.current = false;
  }, [active]);

  useFrame(({ clock }) => {
    const playerPosition = playerPositionRef.current;
    const localPlayer = localPlayerRef.current
      .copy(playerPosition)
      .sub(portalPosition)
      .applyQuaternion(inverseRotation);
    const distance = playerPosition.distanceTo(portalPosition);
    const playerInsideTrigger =
      active &&
      Math.abs(localPlayer.x) <= size[0] * 0.5 &&
      Math.abs(localPlayer.y) <= size[1] * 0.5 &&
      localPlayer.z >= 0 &&
      localPlayer.z <= size[2];

    if (playerInsideTrigger && !enteredRef.current) {
      enteredRef.current = true;
      onEnter();
    }

    const elapsedMs = clock.elapsedTime * 1000;
    if (elapsedMs - lastDebugUpdateRef.current >= 120) {
      lastDebugUpdateRef.current = elapsedMs;
      onDebugChange({
        distance: Number(distance.toFixed(2)),
        triggerActive: active,
        playerInsideTrigger,
      });
    }
  });

  return null;
};
