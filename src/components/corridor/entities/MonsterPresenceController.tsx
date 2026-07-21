import React from "react";
import * as THREE from "three";
import {
  EMPTY_MONSTER_DEBUG_STATE,
  MONSTER_MUTANT_CONFIG,
  MONSTER_TEST_MODE,
  MONSTER_TEST_POSITION,
  MONSTER_TEST_ROTATION_Y,
  type MonsterDebugState,
  type MonsterSpawnConfig,
} from "../../../data/monsterMutantConfig";
import { useMonsterVisibility } from "../../../hooks/useMonsterVisibility";
import type { CorridorModule } from "../../developer/corridor/CorridorMapLoader";
import {
  resolveCorridorCollision,
  type CorridorBounds,
} from "../../developer/corridor/CorridorCollisionSystem";
import { PLAYER_HEIGHT, PLAYER_SPAWN } from "../../developer/corridor/CorridorSpawn";
import type { ExperiencePhase } from "../../developer/corridor/intro/introConfig";
import { MonsterMutant } from "./MonsterMutant";

interface MonsterPresenceControllerProps {
  modules: CorridorModule[];
  collisionBounds: CorridorBounds[];
  playerPositionRef: React.MutableRefObject<THREE.Vector3>;
  introPhase: ExperiencePhase;
  active: boolean;
  onDebugChange: (debug: MonsterDebugState) => void;
  onPlayerDamage?: () => void;
  playerDowned?: boolean;
  spawnCycleToken?: number;
}

const isMonsterSpawn = (module: CorridorModule): module is MonsterSpawnConfig =>
  module.type === "monsterSpawn" &&
  module.asset === "monster-mutant-7" &&
  module.props?.enabled !== false;

const isEditableTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;
  const tagName = target.tagName.toLowerCase();
  return tagName === "input" || tagName === "textarea" || tagName === "select" || target.isContentEditable;
};

const forwardFromYaw = (yaw: number) => new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
const CORRIDOR_WALK_CENTER_OFFSET = new THREE.Vector3(-2.35, 0, 0);
const CORRIDOR_WALK_HALF_LENGTH = 3.25;
const MONSTER_SPAWN_INSET = 1.15;

const rotateVectorXZ = (vector: THREE.Vector3, yaw: number) => {
  const cos = Math.cos(yaw);
  const sin = Math.sin(yaw);

  return new THREE.Vector3(
    vector.x * cos + vector.z * sin,
    0,
    -vector.x * sin + vector.z * cos
  );
};

const getCorridorWalkCenter = (module: CorridorModule) => {
  const rotationY = (module.rotation * Math.PI) / 180;
  return new THREE.Vector3(module.position[0], 0, module.position[2]).add(
    rotateVectorXZ(CORRIDOR_WALK_CENTER_OFFSET, rotationY)
  );
};

const getModuleFootprintFromBounds = (
  module: CorridorModule,
  moduleIndex: number,
  bounds: CorridorBounds[]
) => {
  const prefix = `${module.asset}-${moduleIndex}-`;
  const moduleBounds = bounds.filter((bound) => bound.id.startsWith(prefix));
  if (!moduleBounds.length) return null;

  const points = moduleBounds.flatMap((bound) => [bound.start, bound.end]);
  const minX = Math.min(...points.map((point) => point.x));
  const maxX = Math.max(...points.map((point) => point.x));
  const minZ = Math.min(...points.map((point) => point.y));
  const maxZ = Math.max(...points.map((point) => point.y));
  const sizeX = maxX - minX;
  const sizeZ = maxZ - minZ;
  const center = new THREE.Vector3((minX + maxX) * 0.5, 0, (minZ + maxZ) * 0.5);
  const longAxis = sizeZ >= sizeX
    ? new THREE.Vector3(0, 0, 1)
    : new THREE.Vector3(1, 0, 0);
  const lateralAxis = new THREE.Vector3(longAxis.z, 0, -longAxis.x);

  return {
    center,
    longAxis,
    lateralAxis,
    halfLong: Math.max(sizeX, sizeZ) * 0.5,
  };
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

const distanceToClosestWall = (position: THREE.Vector3, bounds: CorridorBounds[]) => {
  if (!bounds.length) return Infinity;
  const point = new THREE.Vector2(position.x, position.z);
  return Math.min(
    ...bounds.map((bound) => point.distanceTo(closestPointOnSegment(point, bound)))
  );
};

const findSpawnFromPlayerCorridor = (bounds: CorridorBounds[]) => {
  if (!bounds.length) return null;

  const playerOrigin = new THREE.Vector3(
    PLAYER_SPAWN.position[0],
    PLAYER_HEIGHT,
    PLAYER_SPAWN.position[2]
  );
  const playerYaw = PLAYER_SPAWN.rotation;
  const forward = forwardFromYaw(playerYaw);
  let previous = playerOrigin.clone();
  let chosen = playerOrigin.clone();

  for (let distance = 0.35; distance <= 8.5; distance += 0.35) {
    const desired = playerOrigin.clone().addScaledVector(forward, distance);
    const collision = resolveCorridorCollision(
      previous,
      desired,
      bounds,
      MONSTER_MUTANT_CONFIG.ai.collisionRadius
    );

    if (collision.collided || collision.position.distanceTo(desired) > 0.08) break;

    chosen = collision.position.clone();
    previous = collision.position.clone();
  }

  if (chosen.distanceTo(playerOrigin) < 2.2) return null;

  const spawnPosition = chosen
    .clone()
    .addScaledVector(forward, -0.65)
    .setY(0);

  return {
    position: [
      spawnPosition.x,
      0,
      spawnPosition.z,
    ] as [number, number, number],
    rotationY: playerYaw + Math.PI,
  };
};

const findMonsterFallbackSpawn = (
  modules: CorridorModule[],
  bounds: CorridorBounds[]
) => {
  const playerSpawn = modules.find((module) => module.type === "playerSpawn");
  const playerCorridorSpawn = findSpawnFromPlayerCorridor(bounds);
  if (playerCorridorSpawn) return playerCorridorSpawn;

  const corridorModules = modules.filter((module) => (module.type ?? "corridor") === "corridor");
  const playerOrigin = playerSpawn
    ? new THREE.Vector3(playerSpawn.position[0], 0, playerSpawn.position[2])
    : new THREE.Vector3();
  const fallbackEntry = corridorModules
    .map((module, index) => ({
      module,
      index,
      footprint: getModuleFootprintFromBounds(module, index, bounds),
    }))
    .map((entry) => ({
      ...entry,
      center: entry.footprint?.center ?? getCorridorWalkCenter(entry.module),
    }))
    .map((entry) => ({
      ...entry,
      distance: entry.center.distanceTo(playerOrigin),
    }))
    .sort((left, right) => right.distance - left.distance)[0];
  if (!fallbackEntry) return null;

  const fallbackCorridor = fallbackEntry.module;
  const rotationY = (fallbackCorridor.rotation * Math.PI) / 180;
  const forward = fallbackEntry.footprint?.longAxis ?? forwardFromYaw(rotationY);
  const right = fallbackEntry.footprint?.lateralAxis ?? new THREE.Vector3(forward.z, 0, -forward.x);
  const origin = fallbackEntry.footprint?.center ?? getCorridorWalkCenter(fallbackCorridor);
  const halfLong = Math.max(
    MONSTER_SPAWN_INSET + 0.4,
    (fallbackEntry.footprint?.halfLong ?? CORRIDOR_WALK_HALF_LENGTH) - MONSTER_SPAWN_INSET
  );
  const endA = origin.clone().addScaledVector(forward, halfLong);
  const endB = origin.clone().addScaledVector(forward, -halfLong);
  const farEnd = endA.distanceTo(playerOrigin) >= endB.distanceTo(playerOrigin) ? endA : endB;
  const inwardDirection = origin.clone().sub(farEnd).normalize();
  const candidates = [
    farEnd,
    farEnd.clone().addScaledVector(inwardDirection, 0.55),
    farEnd.clone().addScaledVector(inwardDirection, 1.05),
    farEnd.clone().addScaledVector(inwardDirection, 1.65),
    origin,
    origin.clone().addScaledVector(right, 0.18),
    origin.clone().addScaledVector(right, -0.18),
    farEnd.clone().addScaledVector(inwardDirection, 1.05).addScaledVector(right, 0.18),
    farEnd.clone().addScaledVector(inwardDirection, 1.05).addScaledVector(right, -0.18),
  ];
  const best = candidates
    .map((candidate) => ({
      candidate,
      clearance: distanceToClosestWall(candidate, bounds),
      distanceFromPlayer: candidate.distanceTo(playerOrigin),
    }))
    .filter((entry) =>
      entry.clearance > MONSTER_MUTANT_CONFIG.ai.collisionRadius + 0.18 &&
      entry.clearance < 2.9
    )
    .sort((left, right) => right.distanceFromPlayer - left.distanceFromPlayer || right.clearance - left.clearance)[0];
  const chosen = best?.candidate ?? farEnd.clone().addScaledVector(inwardDirection, 1.05);

  return {
    position: [
      chosen.x,
      0,
      chosen.z,
    ] as [number, number, number],
    rotationY: playerSpawn ? Math.atan2(chosen.x - playerOrigin.x, chosen.z - playerOrigin.z) : rotationY,
  };
};

export const MonsterPresenceController: React.FC<MonsterPresenceControllerProps> = ({
  modules,
  collisionBounds,
  playerPositionRef,
  introPhase,
  active,
  onDebugChange,
  onPlayerDamage,
  playerDowned = false,
  spawnCycleToken = 0,
}) => {
  const [spawnDelayComplete, setSpawnDelayComplete] = React.useState(false);
  const spawn = React.useMemo(() => {
    const jsonSpawn = modules.find(isMonsterSpawn);
    if (jsonSpawn) {
      return {
        id: jsonSpawn.id,
        position: jsonSpawn.position,
        rotationY: (jsonSpawn.rotation * Math.PI) / 180,
        scale: jsonSpawn.scale[0] * MONSTER_MUTANT_CONFIG.scale,
        initialAnimation: jsonSpawn.props.initialAnimation,
      };
    }

    if (!MONSTER_TEST_MODE || !MONSTER_MUTANT_CONFIG.debug) return null;

    const fallbackSpawn = findMonsterFallbackSpawn(modules, collisionBounds);
    if (fallbackSpawn) {
      return {
        id: "monster-mutant-corridor-fallback",
        position: fallbackSpawn.position,
        rotationY: fallbackSpawn.rotationY,
        scale: MONSTER_MUTANT_CONFIG.scale,
        initialAnimation: "idle",
      };
    }

    return {
      id: "monster-mutant-test-spawn",
      position: MONSTER_TEST_POSITION,
      rotationY: MONSTER_TEST_ROTATION_Y,
      scale: MONSTER_MUTANT_CONFIG.scale,
      initialAnimation: "idle",
    };
  }, [collisionBounds, modules]);

  const { visible, state, show, hide, toggle } = useMonsterVisibility(false);
  const keyboardEnabled = MONSTER_MUTANT_CONFIG.debug && introPhase === "playing";

  React.useEffect(() => {
    setSpawnDelayComplete(false);
    hide();
    if (!spawn || introPhase !== "playing" || playerDowned) return undefined;

    const timer = window.setTimeout(() => {
      setSpawnDelayComplete(true);
      if (MONSTER_MUTANT_CONFIG.debug) show();
    }, MONSTER_MUTANT_CONFIG.ai.spawnDelayMs);

    return () => window.clearTimeout(timer);
  }, [hide, introPhase, playerDowned, show, spawn, spawnCycleToken]);

  React.useEffect(() => {
    if (!spawn) {
      onDebugChange({
        ...EMPTY_MONSTER_DEBUG_STATE,
        state: "hidden",
      });
    }
  }, [onDebugChange, spawn]);

  React.useEffect(() => {
    if (!keyboardEnabled) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return;
      if (event.key.toLowerCase() !== "n") return;
      event.preventDefault();
      toggle();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [keyboardEnabled, toggle]);

  if (!spawn) return null;

  return (
    <MonsterMutant
      visible={visible && spawnDelayComplete && !playerDowned}
      position={spawn.position}
      rotationY={spawn.rotationY}
      scale={spawn.scale}
      initialAnimation={spawn.initialAnimation}
      keyboardEnabled={keyboardEnabled}
      active={active && !playerDowned}
      playerPositionRef={playerPositionRef}
      collisionBounds={collisionBounds}
      state={state}
      onDebugChange={onDebugChange}
      onPlayerDamage={onPlayerDamage}
    />
  );
};
