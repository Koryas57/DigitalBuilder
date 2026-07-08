import React from "react";
import * as THREE from "three";
import {
  COLLISION_MODE,
  DEBUG_MAP,
  MINE_FREE_BOUNDS,
  MINE_SPAWN,
  MINE_SPAWN_STORAGE_KEY,
  type MineSpawnConfig,
} from "./MineConfig";

export { COLLISION_MODE, MINE_FREE_BOUNDS, MINE_SPAWN, MINE_SPAWN_STORAGE_KEY };
export type { MineSpawnConfig };

export interface BoundsZone {
  id: string;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export const MANUAL_MINE_WALKABLE_AREAS: BoundsZone[] = [
  { id: "main-gallery", minX: -3.35, maxX: 3.35, minZ: -15.2, maxZ: 7.8 },
  { id: "left-niche", minX: -4.6, maxX: -1.1, minZ: -7.8, maxZ: -3.6 },
  { id: "right-niche", minX: 1.1, maxX: 4.6, minZ: -12.8, maxZ: -8.4 },
];

const CAMERA_RADIUS = 0.28;

const clampToFreeBounds = (desired: THREE.Vector3) =>
  new THREE.Vector3(
    THREE.MathUtils.clamp(
      desired.x,
      MINE_FREE_BOUNDS.minX + CAMERA_RADIUS,
      MINE_FREE_BOUNDS.maxX - CAMERA_RADIUS
    ),
    THREE.MathUtils.clamp(MINE_SPAWN.height, MINE_FREE_BOUNDS.minY, MINE_FREE_BOUNDS.maxY),
    THREE.MathUtils.clamp(
      desired.z,
      MINE_FREE_BOUNDS.minZ + CAMERA_RADIUS,
      MINE_FREE_BOUNDS.maxZ - CAMERA_RADIUS
    )
  );

const pointInZone = (point: THREE.Vector3, zone: BoundsZone) =>
  point.x >= zone.minX + CAMERA_RADIUS &&
  point.x <= zone.maxX - CAMERA_RADIUS &&
  point.z >= zone.minZ + CAMERA_RADIUS &&
  point.z <= zone.maxZ - CAMERA_RADIUS;

const resolveManual = (previous: THREE.Vector3, desired: THREE.Vector3) => {
  const clamped = clampToFreeBounds(desired);
  const allowed = MANUAL_MINE_WALKABLE_AREAS.some((zone) => pointInZone(clamped, zone));
  if (allowed) return clamped;

  const xOnly = new THREE.Vector3(clamped.x, clamped.y, previous.z);
  if (MANUAL_MINE_WALKABLE_AREAS.some((zone) => pointInZone(xOnly, zone))) return xOnly;

  const zOnly = new THREE.Vector3(previous.x, clamped.y, clamped.z);
  if (MANUAL_MINE_WALKABLE_AREAS.some((zone) => pointInZone(zOnly, zone))) return zOnly;

  return previous.clone();
};

export const resolveCameraBounds = (previous: THREE.Vector3, desired: THREE.Vector3) => {
  if (COLLISION_MODE === "manual") return resolveManual(previous, desired);
  return clampToFreeBounds(desired);
};

export const CameraBounds: React.FC = () => {
  if (!DEBUG_MAP) return null;

  const width = MINE_FREE_BOUNDS.maxX - MINE_FREE_BOUNDS.minX;
  const depth = MINE_FREE_BOUNDS.maxZ - MINE_FREE_BOUNDS.minZ;
  const centerX = MINE_FREE_BOUNDS.minX + width / 2;
  const centerZ = MINE_FREE_BOUNDS.minZ + depth / 2;

  return (
    <group>
      <mesh position={[centerX, 0.035, centerZ]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshBasicMaterial
          color="#b7f8ca"
          transparent
          opacity={0.026}
          wireframe
          depthWrite={false}
        />
      </mesh>

      <mesh
        position={[MINE_SPAWN.position[0], 0.065, MINE_SPAWN.position[2]]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[0.22, 0.44, 48]} />
        <meshBasicMaterial color="#fff0c2" transparent opacity={0.62} depthWrite={false} />
      </mesh>

      {COLLISION_MODE === "manual" &&
        MANUAL_MINE_WALKABLE_AREAS.map((zone) => {
          const zoneWidth = zone.maxX - zone.minX;
          const zoneDepth = zone.maxZ - zone.minZ;
          return (
            <mesh
              position={[zone.minX + zoneWidth / 2, 0.09, zone.minZ + zoneDepth / 2]}
              rotation={[-Math.PI / 2, 0, 0]}
              key={zone.id}
            >
              <planeGeometry args={[zoneWidth, zoneDepth]} />
              <meshBasicMaterial color="#b7f8ca" transparent opacity={0.1} wireframe depthWrite={false} />
            </mesh>
          );
        })}
    </group>
  );
};
