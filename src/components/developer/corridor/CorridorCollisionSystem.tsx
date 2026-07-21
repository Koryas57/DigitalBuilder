import React from "react";
import * as THREE from "three";
import type { CorridorModule } from "./CorridorMapLoader";
import { DEBUG_COLLISIONS, PLAYER_HEIGHT } from "./CorridorSpawn";

const CORRIDOR_WIDTH = 6.8;
const CORRIDOR_LENGTH = 8.2;
const CORRIDOR_LOCAL_CENTER_OFFSET = new THREE.Vector3(-2.35, 0, 0);
const PLAYER_RADIUS = 0.28;
const WALL_COLLISION_THICKNESS = 0.18;
const WALL_DEBUG_HEIGHT = 0.18;
const WALL_MATERIAL_KEYWORDS = ["mur", "wall"];
const EXCLUDED_COLLIDER_IDS = new Set<string>();

export interface CorridorBounds {
  id: string;
  center: THREE.Vector3;
  start: THREE.Vector2;
  end: THREE.Vector2;
  thickness: number;
  rotationRadians: number;
}

export interface CollisionResult {
  position: THREE.Vector3;
  collided: boolean;
  nearestModuleId: string | null;
}

export interface PrefabWallSegment {
  id: string;
  start: THREE.Vector2;
  end: THREE.Vector2;
}

export const normalizeCollisionAngle = (degrees: number) => ((degrees % 360) + 360) % 360;

export const createCorridorBound = (
  id: string,
  start: THREE.Vector2,
  end: THREE.Vector2,
  thickness = WALL_COLLISION_THICKNESS
): CorridorBounds => {
  const center = new THREE.Vector3(
    (start.x + end.x) * 0.5,
    PLAYER_HEIGHT,
    (start.y + end.y) * 0.5
  );
  const direction = end.clone().sub(start);

  return {
    id,
    center,
    start,
    end,
    thickness,
    rotationRadians: Math.atan2(direction.x, direction.y),
  };
};

export const buildCorridorBounds = (modules: CorridorModule[]): CorridorBounds[] =>
  modules.flatMap((module, index) => {
    const rotation = normalizeCollisionAngle(module.rotation);
    const rotationRadians = THREE.MathUtils.degToRad(rotation);
    const localOffset = CORRIDOR_LOCAL_CENTER_OFFSET
      .clone()
      .applyAxisAngle(new THREE.Vector3(0, 1, 0), rotationRadians);
    const center = new THREE.Vector3(
      module.position[0],
      PLAYER_HEIGHT,
      module.position[2]
    ).add(localOffset);
    const halfWidth = CORRIDOR_WIDTH * 0.5;
    const halfLength = CORRIDOR_LENGTH * 0.5;
    const localCorners = [
      [new THREE.Vector2(-halfWidth, -halfLength), new THREE.Vector2(halfWidth, -halfLength)],
      [new THREE.Vector2(halfWidth, -halfLength), new THREE.Vector2(halfWidth, halfLength)],
      [new THREE.Vector2(halfWidth, halfLength), new THREE.Vector2(-halfWidth, halfLength)],
      [new THREE.Vector2(-halfWidth, halfLength), new THREE.Vector2(-halfWidth, -halfLength)],
    ];

    return localCorners.map(([localStart, localEnd], wallIndex) => {
      const start = rotateCollisionPoint(localStart, rotationRadians).add(new THREE.Vector2(center.x, center.z));
      const end = rotateCollisionPoint(localEnd, rotationRadians).add(new THREE.Vector2(center.x, center.z));
      return createCorridorBound(`${module.asset}-${index}-fallback-wall-${wallIndex}`, start, end);
    });
  });

const getMaterialNames = (material: THREE.Material | THREE.Material[]) =>
  (Array.isArray(material) ? material : [material])
    .map((entry) => entry?.name?.toLowerCase() ?? "")
    .filter(Boolean);

const isWallMesh = (mesh: THREE.Mesh) => {
  const materialNames = getMaterialNames(mesh.material);
  return materialNames.some((name) =>
    WALL_MATERIAL_KEYWORDS.some((keyword) => name.includes(keyword))
  );
};

const readVertex = (
  attribute: THREE.BufferAttribute | THREE.InterleavedBufferAttribute,
  index: number,
  target: THREE.Vector3
) => target.fromBufferAttribute(attribute, index);

const getTriangleVertexIndex = (geometry: THREE.BufferGeometry, triangleOffset: number) =>
  geometry.index ? geometry.index.getX(triangleOffset) : triangleOffset;

const roundPointKey = (point: THREE.Vector2) =>
  `${point.x.toFixed(2)}:${point.y.toFixed(2)}`;

const segmentKey = (start: THREE.Vector2, end: THREE.Vector2) => {
  const a = roundPointKey(start);
  const b = roundPointKey(end);
  return a < b ? `${a}|${b}` : `${b}|${a}`;
};

const longestProjectedEdge = (
  a: THREE.Vector3,
  b: THREE.Vector3,
  c: THREE.Vector3
) => {
  const edges = [
    [new THREE.Vector2(a.x, a.z), new THREE.Vector2(b.x, b.z)],
    [new THREE.Vector2(b.x, b.z), new THREE.Vector2(c.x, c.z)],
    [new THREE.Vector2(c.x, c.z), new THREE.Vector2(a.x, a.z)],
  ] as const;

  return edges
    .map(([start, end]) => ({ start, end, length: start.distanceTo(end) }))
    .sort((left, right) => right.length - left.length)[0];
};

export const extractPrefabWallSegments = (scene: THREE.Group): PrefabWallSegment[] => {
  const segments: PrefabWallSegment[] = [];
  const seen = new Set<string>();
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();

  scene.updateMatrixWorld(true);

  scene.traverse((child) => {
    if (!(child instanceof THREE.Mesh) || !isWallMesh(child)) return;

    const geometry = child.geometry;
    const positionAttribute = geometry.attributes.position;
    if (!positionAttribute) return;

    const triangleCount = geometry.index
      ? geometry.index.count / 3
      : positionAttribute.count / 3;

    for (let triangleIndex = 0; triangleIndex < triangleCount; triangleIndex += 1) {
      const offset = triangleIndex * 3;
      readVertex(positionAttribute, getTriangleVertexIndex(geometry, offset), a).applyMatrix4(child.matrixWorld);
      readVertex(positionAttribute, getTriangleVertexIndex(geometry, offset + 1), b).applyMatrix4(child.matrixWorld);
      readVertex(positionAttribute, getTriangleVertexIndex(geometry, offset + 2), c).applyMatrix4(child.matrixWorld);

      const normal = b
        .clone()
        .sub(a)
        .cross(c.clone().sub(a))
        .normalize();
      if (Math.abs(normal.y) > 0.42) continue;

      const edge = longestProjectedEdge(a, b, c);
      if (!edge || edge.length < 0.55) continue;

      const key = segmentKey(edge.start, edge.end);
      if (seen.has(key)) continue;
      seen.add(key);
      segments.push({
        id: `prefab-wall-${segments.length}`,
        start: edge.start,
        end: edge.end,
      });
    }
  });

  console.info("[Corridor collisions] prefab wall segments", segments.length);
  return segments;
};

export const rotateCollisionPoint = (point: THREE.Vector2, rotationRadians: number) => {
  const cos = Math.cos(rotationRadians);
  const sin = Math.sin(rotationRadians);

  return new THREE.Vector2(
    point.x * cos + point.y * sin,
    -point.x * sin + point.y * cos
  );
};

export const buildCorridorWallColliders = (
  modules: CorridorModule[],
  prefabSegments: PrefabWallSegment[]
): CorridorBounds[] => {
  if (!prefabSegments.length) return buildCorridorBounds(modules);

  return modules.flatMap((module, moduleIndex) => {
    const rotationRadians = THREE.MathUtils.degToRad(normalizeCollisionAngle(module.rotation));
    const moduleOrigin = new THREE.Vector2(module.position[0], module.position[2]);

    return prefabSegments.map((segment, segmentIndex) => {
      const start = rotateCollisionPoint(segment.start, rotationRadians).add(moduleOrigin);
      const end = rotateCollisionPoint(segment.end, rotationRadians).add(moduleOrigin);

      const colliderId = `${module.asset}-${moduleIndex}-${segment.id}-${segmentIndex}`;
      if (EXCLUDED_COLLIDER_IDS.has(colliderId)) return null;

      return createCorridorBound(
        colliderId,
        start,
        end
      );
    }).filter((bound): bound is CorridorBounds => Boolean(bound));
  });
};

const closestPointOnSegment = (point: THREE.Vector2, bound: CorridorBounds) => {
  const segment = bound.end.clone().sub(bound.start);
  const lengthSq = segment.lengthSq();
  if (lengthSq <= 0.00001) return bound.start.clone();

  const t = THREE.MathUtils.clamp(
    point.clone().sub(bound.start).dot(segment) / lengthSq,
    0,
    1
  );

  return bound.start.clone().add(segment.multiplyScalar(t));
};

export const findNearestModuleId = (position: THREE.Vector3, bounds: CorridorBounds[]) => {
  let nearestId: string | null = null;
  let nearestDistance = Infinity;

  bounds.forEach((bound) => {
    const distance = position.distanceTo(bound.center);
    if (distance < nearestDistance) {
      nearestId = bound.id;
      nearestDistance = distance;
    }
  });

  return nearestId;
};

export const resolveCorridorCollision = (
  _previousPosition: THREE.Vector3,
  desiredPosition: THREE.Vector3,
  bounds: CorridorBounds[],
  radius = PLAYER_RADIUS
): CollisionResult => {
  const normalizedDesired = desiredPosition.clone();
  normalizedDesired.y = PLAYER_HEIGHT;
  if (!bounds.length) {
    return {
      position: normalizedDesired,
      collided: false,
      nearestModuleId: null,
    };
  }

  const resolved = normalizedDesired.clone();
  let collided = false;
  let nearestModuleId: string | null = findNearestModuleId(resolved, bounds);
  const minDistance = radius + WALL_COLLISION_THICKNESS * 0.5;

  for (let iteration = 0; iteration < 3; iteration += 1) {
    const point = new THREE.Vector2(resolved.x, resolved.z);

    bounds.forEach((bound) => {
      const closest = closestPointOnSegment(point, bound);
      const push = point.clone().sub(closest);
      const distance = push.length();
      if (distance >= minDistance) return;

      const segmentDirection = bound.end.clone().sub(bound.start).normalize();
      const fallbackNormal = new THREE.Vector2(-segmentDirection.y, segmentDirection.x);
      const normal = distance > 0.0001 ? push.normalize() : fallbackNormal;
      const amount = minDistance - distance;
      resolved.x += normal.x * amount;
      resolved.z += normal.y * amount;
      point.x = resolved.x;
      point.y = resolved.z;
      collided = true;
      nearestModuleId = bound.id;
    });
  }

  return {
    position: resolved.setY(PLAYER_HEIGHT),
    collided,
    nearestModuleId,
  };
};

interface CorridorCollisionSystemProps {
  bounds: CorridorBounds[];
  visible: boolean;
}

export const CorridorCollisionSystem: React.FC<CorridorCollisionSystemProps> = ({ bounds, visible }) => {
  if (!DEBUG_COLLISIONS || !visible) return null;

  return (
    <group>
      {bounds.map((bound) => {
        const length = bound.start.distanceTo(bound.end);

        return (
        <group
          position={[bound.center.x, 0.08, bound.center.z]}
          rotation={[0, bound.rotationRadians, 0]}
          key={bound.id}
        >
          <mesh>
            <boxGeometry args={[bound.thickness, WALL_DEBUG_HEIGHT, length]} />
            <meshBasicMaterial color="#b7f8ca" transparent opacity={0.34} depthWrite={false} />
          </mesh>
        </group>
        );
      })}
    </group>
  );
};
