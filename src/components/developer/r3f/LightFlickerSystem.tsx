import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface LightFlickerSystemProps {
  reducedMotion: boolean;
}

export const LightFlickerSystem: React.FC<LightFlickerSystemProps> = ({ reducedMotion }) => {
  const coldLightRef = useRef<THREE.PointLight | null>(null);
  const pulseLightRef = useRef<THREE.PointLight | null>(null);

  const flickerOffsets = useMemo(
    () => ({
      cold: Math.random() * 20,
      pulse: Math.random() * 20,
    }),
    []
  );

  useFrame(({ clock }) => {
    if (reducedMotion) return;

    const time = clock.getElapsedTime();
    const rareBlink = Math.max(0, Math.sin(time * 0.77 + flickerOffsets.cold) - 0.92) * 4.8;
    const unstablePulse = Math.sin(time * 2.1 + flickerOffsets.pulse) * 0.08;

    if (coldLightRef.current) {
      coldLightRef.current.intensity = 1.05 + unstablePulse + rareBlink;
    }

    if (pulseLightRef.current) {
      pulseLightRef.current.intensity = 0.35 + Math.max(0, Math.sin(time * 0.36) - 0.35) * 0.22;
    }
  });

  return (
    <>
      <pointLight
        ref={coldLightRef}
        position={[-2.8, 2.55, -2.2]}
        color="#b9d6ff"
        intensity={1.05}
        distance={7.5}
        castShadow
      />
      <pointLight
        ref={pulseLightRef}
        position={[2.2, 1.8, 1.5]}
        color="#b7f8ca"
        intensity={0.35}
        distance={5.5}
      />
    </>
  );
};
