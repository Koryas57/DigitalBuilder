import React, { useMemo, useRef, useState } from "react";
import { Text, useCursor } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { DeveloperStationPlacement } from "../../../data/developerPath";

interface AnomalyMarkerProps {
  placement: DeveloperStationPlacement;
  onOpen: (stationId: string) => void;
}

export const AnomalyMarker: React.FC<AnomalyMarkerProps> = ({ placement, onOpen }) => {
  const groupRef = useRef<THREE.Group | null>(null);
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  const color = useMemo(() => new THREE.Color(placement.accentColor), [placement.accentColor]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const pulse = Math.sin(clock.getElapsedTime() * 1.6 + placement.position[0]) * 0.04;
    groupRef.current.position.y = placement.position[1] + pulse;
  });

  return (
    <group
      ref={groupRef}
      position={placement.position}
      rotation={placement.rotation}
      onClick={() => onOpen(placement.id)}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.018, 0]}>
        <ringGeometry args={[0.22, 0.72, 96]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={hovered ? 0.34 : 0.18}
          depthWrite={false}
        />
      </mesh>

      <mesh position={[0, 0.72, 0]}>
        <planeGeometry args={[1.18, 0.018]} />
        <meshBasicMaterial color={color} transparent opacity={hovered ? 0.75 : 0.32} />
      </mesh>

      <mesh position={[0.34, 0.86, 0]}>
        <planeGeometry args={[0.52, 0.012]} />
        <meshBasicMaterial color="#fffaf0" transparent opacity={hovered ? 0.5 : 0.18} />
      </mesh>

      <Text
        position={[0, 1.02, 0.01]}
        fontSize={0.075}
        maxWidth={1.3}
        color={hovered ? "#fffaf0" : placement.accentColor}
        anchorX="center"
        anchorY="middle"
        textAlign="center"
      >
        {placement.title}
      </Text>
    </group>
  );
};
