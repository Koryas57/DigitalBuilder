import React from "react";
import { Billboard, Float, Text } from "@react-three/drei";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import type { DeveloperStationData } from "../../../data/developerPath";

interface VerticalSkillCellProps {
  station: DeveloperStationData;
  position: [number, number, number];
  rotation?: [number, number, number];
  isNear: boolean;
  isActive: boolean;
  onOpen: () => void;
}

export const VerticalSkillCell: React.FC<VerticalSkillCellProps> = ({
  station,
  position,
  rotation = [0, 0, 0],
  isNear,
  isActive,
  onOpen,
}) => {
  const intensity = isNear || isActive ? 1.45 : 0.48;
  const opacity = isNear || isActive ? 0.28 : 0.12;

  return (
    <group position={position} rotation={rotation}>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[0.58, 0.82, 0.18]} position={[0, 0.92, 0]} />
      </RigidBody>

      <mesh position={[0, 0.045, 0]} receiveShadow>
        <boxGeometry args={[1.05, 0.09, 0.72]} />
        <meshStandardMaterial
          color="#040805"
          emissive={station.accentColor}
          emissiveIntensity={isNear ? 0.24 : 0.08}
          metalness={0.52}
          roughness={0.28}
        />
      </mesh>

      <mesh position={[0, 0.82, -0.02]} rotation={[0, 0, 0]} onClick={onOpen}>
        <boxGeometry args={[1.05, 1.15, 0.035]} />
        <meshPhysicalMaterial
          color={station.accentColor}
          emissive={station.accentColor}
          emissiveIntensity={isNear ? 0.36 : 0.1}
          transparent
          opacity={opacity}
          roughness={0.08}
          metalness={0.18}
          transmission={0.62}
          thickness={0.25}
          depthWrite={false}
        />
      </mesh>

      <mesh position={[0, 0.13, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.42, 0.54, 64]} />
        <meshBasicMaterial color={station.accentColor} transparent opacity={isNear ? 0.54 : 0.22} />
      </mesh>

      <Float speed={0.75} rotationIntensity={0.08} floatIntensity={0.12}>
        <mesh position={[0, 1.02, -0.08]} castShadow onClick={onOpen}>
          {station.visualType === "terminal" ? (
            <boxGeometry args={[0.36, 0.22, 0.035]} />
          ) : station.visualType === "grid" ? (
            <boxGeometry args={[0.42, 0.3, 0.025]} />
          ) : station.visualType === "core" ? (
            <cylinderGeometry args={[0.16, 0.16, 0.28, 32]} />
          ) : (
            <boxGeometry args={[0.28, 0.28, 0.028]} />
          )}
          <meshStandardMaterial
            color={station.accentColor}
            emissive={station.accentColor}
            emissiveIntensity={intensity}
            metalness={0.5}
            roughness={0.1}
          />
        </mesh>
      </Float>

      <mesh position={[0.26, 0.88, -0.06]} rotation={[0, 0, 0.16]}>
        <planeGeometry args={[0.38, 0.02]} />
        <meshBasicMaterial color="#fffaf0" transparent opacity={isNear ? 0.64 : 0.22} />
      </mesh>

      <mesh position={[-0.22, 0.62, -0.055]} rotation={[0, 0, -0.12]}>
        <planeGeometry args={[0.32, 0.02]} />
        <meshBasicMaterial color={station.accentColor} transparent opacity={isNear ? 0.7 : 0.24} />
      </mesh>

      <pointLight
        position={[0, 0.9, 0]}
        color={station.accentColor}
        intensity={isNear ? 1.55 : 0.45}
        distance={2.8}
      />

      <Billboard position={[0, 1.82, 0]} follow>
        <mesh position={[0, 0, -0.012]}>
          <planeGeometry args={[1.68, 0.48]} />
          <meshBasicMaterial color="#020403" transparent opacity={isNear ? 0.62 : 0.34} />
        </mesh>
        <Text
          color="#fffaf0"
          fontSize={0.105}
          maxWidth={1.48}
          textAlign="center"
          anchorX="center"
          anchorY="middle"
          outlineColor="#020403"
          outlineWidth={0.012}
        >
          {station.title}
        </Text>
        <Text
          position={[0, -0.23, 0]}
          color={station.accentColor}
          fontSize={0.065}
          maxWidth={1.42}
          textAlign="center"
          anchorX="center"
          anchorY="middle"
          outlineColor="#020403"
          outlineWidth={0.01}
        >
          {isNear ? "Appuyez sur E pour activer" : station.subtitle}
        </Text>
      </Billboard>
    </group>
  );
};
