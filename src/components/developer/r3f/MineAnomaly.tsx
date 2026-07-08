import React, { useMemo, useRef, useState } from "react";
import { Text, useCursor } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { DeveloperStationPlacement } from "../../../data/developerPath";

interface MineAnomalyProps {
  placement: DeveloperStationPlacement;
  onOpen: (stationId: string) => void;
}

export const MineAnomaly: React.FC<MineAnomalyProps> = ({ placement, onOpen }) => {
  const groupRef = useRef<THREE.Group | null>(null);
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  const color = useMemo(() => new THREE.Color(placement.accentColor), [placement.accentColor]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const time = clock.getElapsedTime();
    const pulse = hovered ? 0.18 : Math.sin(time * 1.15 + placement.position[0]) * 0.045;
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
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.028, 0]}>
        <ringGeometry args={[0.34, 0.92, 72]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={hovered ? 0.28 : 0.13}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh position={[0, 0.72, 0]}>
        <planeGeometry args={[1.62, 0.02]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={hovered ? 0.84 : 0.46}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh position={[-0.28, 0.92, 0.005]} rotation={[0, 0, -0.26]}>
        <planeGeometry args={[0.92, 0.014]} />
        <meshBasicMaterial
          color="#fff0c2"
          transparent
          opacity={hovered ? 0.58 : 0.24}
          depthWrite={false}
        />
      </mesh>

      <Text
        position={[0, 1.1, 0.018]}
        fontSize={0.09}
        maxWidth={1.55}
        color={hovered ? "#fffaf0" : placement.accentColor}
        anchorX="center"
        anchorY="middle"
        textAlign="center"
        outlineWidth={0.004}
        outlineColor="#020403"
      >
        {placement.title}
      </Text>

      <Text
        position={[0, 0.91, 0.018]}
        fontSize={0.038}
        maxWidth={1.35}
        color="#d8d4c8"
        anchorX="center"
        anchorY="middle"
        textAlign="center"
      >
        Appuyez sur E
      </Text>
    </group>
  );
};
