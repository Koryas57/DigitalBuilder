import React from "react";
import { Html } from "@react-three/drei";

interface MonsterSpawnPointProps {
  selected?: boolean;
}

export const MonsterSpawnPoint: React.FC<MonsterSpawnPointProps> = ({ selected = false }) => (
  <group>
    <mesh position={[0, 0.82, 0]}>
      <capsuleGeometry args={[0.28, 1.15, 8, 18]} />
      <meshBasicMaterial
        color={selected ? "#d8ffb8" : "#b992ff"}
        wireframe
        transparent
        opacity={selected ? 0.9 : 0.62}
      />
    </mesh>
    <mesh position={[0, 1.25, -0.55]} rotation={[Math.PI / 2, 0, 0]}>
      <coneGeometry args={[0.16, 0.42, 24]} />
      <meshBasicMaterial color="#fff0c2" transparent opacity={0.82} />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.035, 0]}>
      <ringGeometry args={[0.55, 0.74, 48]} />
      <meshBasicMaterial color={selected ? "#d8ffb8" : "#b992ff"} transparent opacity={0.38} />
    </mesh>
    <Html position={[0, 1.72, 0]} center>
      <div className="map-builder-object-label">Monster Mutant 7</div>
    </Html>
  </group>
);
