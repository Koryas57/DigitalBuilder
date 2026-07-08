import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface FlickerLightProps {
  position: [number, number, number];
  color?: string;
  intensity?: number;
  distance?: number;
  reducedMotion: boolean;
}

export const FlickerLight: React.FC<FlickerLightProps> = ({
  position,
  color = "#fff0c2",
  intensity = 1,
  distance = 6,
  reducedMotion,
}) => {
  const lightRef = useRef<THREE.PointLight | null>(null);

  useFrame(({ clock }) => {
    if (!lightRef.current || reducedMotion) return;
    const time = clock.getElapsedTime();
    const pulse = Math.sin(time * 8.7 + position[2]) * 0.13;
    const rareDip = Math.sin(time * 1.3 + position[0] * 4) > 0.96 ? -0.28 : 0;
    lightRef.current.intensity = Math.max(0.12, intensity + pulse + rareDip);
  });

  return <pointLight ref={lightRef} position={position} color={color} intensity={intensity} distance={distance} castShadow />;
};
