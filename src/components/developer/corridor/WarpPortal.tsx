import React from "react";
import * as THREE from "three";

interface WarpPortalProps {
  position: THREE.Vector3;
}

export const WarpPortal: React.FC<WarpPortalProps> = ({ position }) => (
  <group position={position.toArray()}>
    <mesh>
      <torusGeometry args={[0.9, 0.045, 12, 96]} />
      <meshBasicMaterial color="#111111" transparent opacity={0.92} />
    </mesh>
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <circleGeometry args={[0.72, 64]} />
      <meshBasicMaterial color="#020202" transparent opacity={0.72} depthWrite={false} />
    </mesh>
    <pointLight color="#6546ff" intensity={0.55} distance={3.2} />
  </group>
);
