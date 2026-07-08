import React from "react";
import { COLLISION_MODE, DEBUG_MAP } from "./MineConfig";
import { MANUAL_MINE_WALKABLE_AREAS } from "./CameraBounds";

export const ManualMineBounds: React.FC = () => {
  if (!DEBUG_MAP || COLLISION_MODE !== "manual") return null;

  return (
    <group>
      {MANUAL_MINE_WALKABLE_AREAS.map((zone) => {
        const width = zone.maxX - zone.minX;
        const depth = zone.maxZ - zone.minZ;

        return (
          <mesh
            position={[zone.minX + width / 2, 0.16, zone.minZ + depth / 2]}
            rotation={[-Math.PI / 2, 0, 0]}
            key={zone.id}
          >
            <planeGeometry args={[width, depth]} />
            <meshBasicMaterial color="#b7f8ca" transparent opacity={0.11} depthWrite={false} />
          </mesh>
        );
      })}
    </group>
  );
};
