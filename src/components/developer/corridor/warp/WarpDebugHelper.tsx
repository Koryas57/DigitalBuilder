import React from "react";
import * as THREE from "three";

interface WarpDebugHelperProps {
  position: [number, number, number];
  rotation: [number, number, number];
  size: [number, number, number];
  visible: boolean;
}

export const WarpDebugHelper: React.FC<WarpDebugHelperProps> = ({
  position,
  rotation,
  size,
  visible,
}) => {
  if (!visible) return null;

  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0, size[2] * 0.5]}>
        <boxGeometry args={size} />
        <meshBasicMaterial
          color="#50f6ff"
          wireframe
          transparent
          opacity={0.72}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};
