import * as THREE from "three";
import type { CorridorModule } from "./CorridorMapLoader";
import {
  createCorridorBound,
  normalizeCollisionAngle,
  rotateCollisionPoint,
  type CorridorBounds,
} from "./CorridorCollisionSystem";

export const ENABLE_END_CAP_COLLIDERS = true;
export const END_CAP_THICKNESS = 0.25;
export const END_CAP_HEIGHT = 2.4;
const EXCLUDED_END_CAP_IDS = new Set([
  "corridor-0-end-cap",
  "corridor-1-start-cap",
  "corridor-1-end-cap",
]);

export interface CorridorPrefabFootprint {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export const getCorridorPrefabFootprint = (scene: THREE.Group): CorridorPrefabFootprint => {
  const box = new THREE.Box3().setFromObject(scene);

  return {
    minX: box.min.x,
    maxX: box.max.x,
    minZ: box.min.z,
    maxZ: box.max.z,
  };
};

export const buildEndCapColliders = (
  modules: CorridorModule[],
  footprint: CorridorPrefabFootprint
): CorridorBounds[] => {
  if (!ENABLE_END_CAP_COLLIDERS) return [];

  return modules.flatMap((module, moduleIndex) => {
    const rotationRadians = THREE.MathUtils.degToRad(normalizeCollisionAngle(module.rotation));
    const moduleOrigin = new THREE.Vector2(module.position[0], module.position[2]);
    const localCaps = [
      {
        id: "start-cap",
        start: new THREE.Vector2(footprint.minX, footprint.minZ),
        end: new THREE.Vector2(footprint.maxX, footprint.minZ),
      },
      {
        id: "end-cap",
        start: new THREE.Vector2(footprint.minX, footprint.maxZ),
        end: new THREE.Vector2(footprint.maxX, footprint.maxZ),
      },
    ];

    return localCaps.map((cap) => {
      const start = rotateCollisionPoint(cap.start, rotationRadians).add(moduleOrigin);
      const end = rotateCollisionPoint(cap.end, rotationRadians).add(moduleOrigin);

      const colliderId = `${module.asset}-${moduleIndex}-${cap.id}`;
      if (EXCLUDED_END_CAP_IDS.has(colliderId)) return null;

      return createCorridorBound(
        colliderId,
        start,
        end,
        END_CAP_THICKNESS
      );
    }).filter((bound): bound is CorridorBounds => Boolean(bound));
  });
};
