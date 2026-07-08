import React from "react";
import { Billboard, Float, Text } from "@react-three/drei";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import type { DeveloperStationData } from "../../../data/developerPath";

interface SkillStation3DProps {
  station: DeveloperStationData;
  position: [number, number, number];
  isNear: boolean;
  isActive: boolean;
  onOpen: () => void;
}

export const SkillStation3D: React.FC<SkillStation3DProps> = ({
  station,
  position,
  isNear,
  isActive,
  onOpen,
}) => {
  const glowIntensity = isNear || isActive ? 1.8 : 0.9;
  const scale = isNear || isActive ? 1.12 : 1;

  return (
    <group position={position} scale={scale}>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[0.95, 1.2, 0.95]} position={[0, 0.8, 0]} />
      </RigidBody>

      <mesh position={[0, 0.08, 0]} receiveShadow>
        <cylinderGeometry args={[1.24, 1.55, 0.16, 48]} />
        <meshStandardMaterial
          color="#050806"
          emissive={station.accentColor}
          emissiveIntensity={isNear ? 0.38 : 0.18}
          metalness={0.4}
          roughness={0.28}
        />
      </mesh>

      <Float speed={1.35} rotationIntensity={0.22} floatIntensity={0.38}>
        <mesh position={[0, 1.38, 0]} castShadow onClick={onOpen}>
          {station.visualType === "terminal" ? (
            <boxGeometry args={[1.25, 0.82, 0.18]} />
          ) : station.visualType === "grid" ? (
            <octahedronGeometry args={[0.62, 1]} />
          ) : (
            <icosahedronGeometry args={[0.68, 2]} />
          )}
          <meshStandardMaterial
            color={station.accentColor}
            emissive={station.accentColor}
            emissiveIntensity={glowIntensity}
            metalness={0.45}
            roughness={0.12}
          />
        </mesh>
        <mesh position={[0, 1.38, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.92, 0.012, 8, 72]} />
          <meshBasicMaterial color={station.accentColor} transparent opacity={0.7} />
        </mesh>
      </Float>

      <Billboard position={[0, 2.35, 0]} follow>
        <Text
          color="#fffaf0"
          fontSize={0.18}
          maxWidth={2.8}
          textAlign="center"
          anchorX="center"
          anchorY="middle"
          outlineColor="#020403"
          outlineWidth={0.012}
        >
          {station.title}
        </Text>
        <Text
          position={[0, -0.27, 0]}
          color={station.accentColor}
          fontSize={0.105}
          maxWidth={2.45}
          textAlign="center"
          anchorX="center"
          anchorY="middle"
          outlineColor="#020403"
          outlineWidth={0.01}
        >
          {isNear ? "E / tap pour explorer" : station.subtitle}
        </Text>
      </Billboard>
    </group>
  );
};
