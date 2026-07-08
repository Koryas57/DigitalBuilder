import React, { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { CorridorModule } from "./CorridorMapLoader";
import {
  buildCorridorBounds,
  type CorridorBounds,
  findNearestModuleId,
  resolveCorridorCollision,
} from "./CorridorCollisionSystem";
import {
  DEBUG_DISABLE_COLLISIONS,
  DEBUG_PLAYER,
  PLAYER_HEIGHT,
  SPAWN_PRESETS,
} from "./CorridorSpawn";
import {
  DEFAULT_BACKGROUND_VOLUME,
  useAmbienceAudio,
} from "./audio/useAmbienceAudio";
import { useBreathingAudio } from "./audio/useBreathingAudio";
import {
  DEFAULT_FOOTSTEP_VOLUME,
  useFootstepAudio,
} from "./audio/useFootstepAudio";
import {
  SPRINT_BOB_FREQUENCY,
  WALK_BOB_FREQUENCY,
  getHeadBob,
} from "./useHeadBob";
import { MOUSE_SENSITIVITY, updatePlayerMovement } from "./usePlayerMovement";

export interface CorridorPlayerDebugState {
  position: [number, number, number];
  rotation: number;
  nearestModuleId: string | null;
  collided: boolean;
  fps: number;
  speed: number;
  sprinting: boolean;
  grounded: boolean;
  collisionEnabled: boolean;
  footstepVolume: number;
  backgroundVolume: number;
  footstepStep: number;
}

interface CorridorPlayerControllerProps {
  modules: CorridorModule[];
  movementInput: { x: number; z: number };
  lookInput: { x: number; y: number };
  reducedMotion: boolean;
  playerPositionRef: React.MutableRefObject<THREE.Vector3>;
  onDebugChange: (debug: CorridorPlayerDebugState) => void;
  overviewMode: boolean;
  onOverviewModeChange: (enabled: boolean) => void;
  spawnConfig: { name: string; position: [number, number, number]; rotation: number; source: string };
  collisionBounds: CorridorBounds[];
  audioUnlocked: boolean;
}

const MOBILE_LOOK_SENSITIVITY = 0.0036;
const PITCH_LIMIT = Math.PI * 0.24;

const roundVector = (vector: THREE.Vector3): [number, number, number] => [
  Number(vector.x.toFixed(3)),
  Number(vector.y.toFixed(3)),
  Number(vector.z.toFixed(3)),
];

export const CorridorPlayerController: React.FC<CorridorPlayerControllerProps> = ({
  modules,
  movementInput,
  lookInput,
  reducedMotion,
  playerPositionRef,
  onDebugChange,
  overviewMode,
  onOverviewModeChange,
  spawnConfig,
  collisionBounds,
  audioUnlocked,
}) => {
  const { camera, gl } = useThree();
  const keysRef = useRef<Record<string, boolean>>({});
  const dragRef = useRef(false);
  const lastPointerRef = useRef({ x: 0, y: 0 });
  const lastLookRef = useRef({ x: 0, y: 0 });
  const yawRef = useRef(spawnConfig.rotation);
  const pitchRef = useRef(0);
  const positionRef = useRef(new THREE.Vector3(...spawnConfig.position));
  const activeSpawnIndexRef = useRef(0);
  const velocityRef = useRef(new THREE.Vector3());
  const collidedRef = useRef(false);
  const frameStatsRef = useRef({ elapsed: 0, frames: 0, fps: 0 });
  const previousFootPhaseRef = useRef(0);
  const wasMovingRef = useRef(false);
  const lastFootstepTimeRef = useRef(0);
  const [footstepStep, setFootstepStep] = React.useState(0);
  const [sprintingState, setSprintingState] = React.useState(false);
  const [footstepVolume, setFootstepVolume] = React.useState(DEFAULT_FOOTSTEP_VOLUME);
  const [backgroundVolume, setBackgroundVolume] = React.useState(DEFAULT_BACKGROUND_VOLUME);

  useAmbienceAudio(backgroundVolume, audioUnlocked);
  useBreathingAudio(sprintingState);
  useFootstepAudio(footstepStep, sprintingState, footstepVolume);

  const fallbackBounds = useMemo(() => buildCorridorBounds(modules), [modules]);
  const bounds = collisionBounds.length ? collisionBounds : fallbackBounds;

  const resetToSpawn = React.useCallback((presetIndex = activeSpawnIndexRef.current) => {
    const preset =
      presetIndex === 0
        ? spawnConfig
        : SPAWN_PRESETS[presetIndex] ?? spawnConfig;
    const spawnPosition = new THREE.Vector3(...preset.position);
    const resolvedSpawn = DEBUG_DISABLE_COLLISIONS || !bounds.length
      ? spawnPosition.setY(PLAYER_HEIGHT)
      : resolveCorridorCollision(spawnPosition, spawnPosition, bounds).position;

    activeSpawnIndexRef.current = presetIndex;
    positionRef.current.copy(resolvedSpawn);
    velocityRef.current.set(0, 0, 0);
    yawRef.current = preset.rotation;
    pitchRef.current = 0;
    camera.position.copy(positionRef.current);
    camera.rotation.set(0, yawRef.current, 0, "YXZ");
    playerPositionRef.current.copy(positionRef.current);
    console.info("[Corridor spawn]", {
      preset: preset.name,
      position: preset.position,
      resolvedPosition: roundVector(resolvedSpawn),
      rotation: preset.rotation,
      collisionBounds: bounds.length,
    });
  }, [bounds, camera, playerPositionRef, spawnConfig]);

  useEffect(() => {
    resetToSpawn();
  }, [resetToSpawn]);

  useEffect(() => {
    const canvas = gl.domElement;

    const handlePointerDown = (event: PointerEvent) => {
      dragRef.current = true;
      lastPointerRef.current = { x: event.clientX, y: event.clientY };
      canvas.setPointerCapture(event.pointerId);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!dragRef.current) return;
      const dx = event.clientX - lastPointerRef.current.x;
      const dy = event.clientY - lastPointerRef.current.y;
      lastPointerRef.current = { x: event.clientX, y: event.clientY };
      yawRef.current -= dx * MOUSE_SENSITIVITY;
      pitchRef.current = THREE.MathUtils.clamp(
        pitchRef.current - dy * MOUSE_SENSITIVITY,
        -PITCH_LIMIT,
        PITCH_LIMIT
      );
    };

    const stopDrag = () => {
      dragRef.current = false;
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      keysRef.current[event.key.toLowerCase()] = true;

      if (event.key.toLowerCase() === "r") {
        resetToSpawn();
      }

      if (["1", "2", "3"].includes(event.key)) {
        resetToSpawn(Number(event.key) - 1);
      }

      if (event.key.toLowerCase() === "o") {
        onOverviewModeChange(!overviewMode);
      }

      if (event.key.toLowerCase() === "p") {
        const direction = new THREE.Vector3();
        camera.getWorldDirection(direction);
        const mapCenter = bounds.length
          ? bounds.reduce((acc, bound) => acc.add(bound.center), new THREE.Vector3()).divideScalar(bounds.length)
          : new THREE.Vector3();
        console.info("[Corridor player]", {
          position: roundVector(camera.position),
          yaw: Number(yawRef.current.toFixed(3)),
          rotationY: Number(camera.rotation.y.toFixed(3)),
          lookAt: roundVector(camera.position.clone().add(direction.multiplyScalar(2))),
          nearestModuleId: findNearestModuleId(camera.position, bounds),
          mapCenter: roundVector(mapCenter),
          distanceToMapCenter: Number(camera.position.distanceTo(mapCenter).toFixed(3)),
          overviewMode,
          spawnSource: spawnConfig.source,
        });
      }

      if (event.key === "[") {
        setFootstepVolume((current) => Math.max(0, Number((current - 0.04).toFixed(2))));
      }

      if (event.key === "]") {
        setFootstepVolume((current) => Math.min(1, Number((current + 0.04).toFixed(2))));
      }

      if (event.key.toLowerCase() === "v") {
        setBackgroundVolume((current) => Math.max(0, Number((current - 0.04).toFixed(2))));
      }

      if (event.key.toLowerCase() === "b") {
        setBackgroundVolume((current) => Math.min(1, Number((current + 0.04).toFixed(2))));
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      keysRef.current[event.key.toLowerCase()] = false;
    };

    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", stopDrag);
    canvas.addEventListener("pointercancel", stopDrag);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", stopDrag);
      canvas.removeEventListener("pointercancel", stopDrag);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [bounds, camera, gl.domElement, onOverviewModeChange, overviewMode, resetToSpawn, spawnConfig.source]);

  useFrame((_, delta) => {
    if (overviewMode) {
      velocityRef.current.set(0, 0, 0);
      return;
    }

    const lookDeltaX = lookInput.x - lastLookRef.current.x;
    const lookDeltaY = lookInput.y - lastLookRef.current.y;
    if (lookDeltaX || lookDeltaY) {
      yawRef.current -= lookDeltaX * MOBILE_LOOK_SENSITIVITY;
      pitchRef.current = THREE.MathUtils.clamp(
        pitchRef.current - lookDeltaY * MOBILE_LOOK_SENSITIVITY,
        -PITCH_LIMIT,
        PITCH_LIMIT
      );
      lastLookRef.current = lookInput;
    }

    const keys = keysRef.current;
    const forward =
      (keys.w || keys.z || keys.arrowup ? 1 : 0) -
      (keys.s || keys.arrowdown ? 1 : 0);
    const strafe =
      (keys.d || keys.arrowright ? 1 : 0) -
      (keys.a || keys.q || keys.arrowleft ? 1 : 0);
    const input = new THREE.Vector3(strafe + movementInput.x, 0, -forward + movementInput.z);
    if (input.lengthSq() > 1) input.normalize();

    const movement = updatePlayerMovement({
      velocity: velocityRef.current,
      input,
      yaw: yawRef.current,
      sprinting: Boolean(keys.shift),
      delta,
    });

    const desiredPosition = positionRef.current.clone().addScaledVector(velocityRef.current, delta);
    const collision = DEBUG_DISABLE_COLLISIONS
      ? {
          position: desiredPosition.setY(PLAYER_HEIGHT),
          collided: false,
          nearestModuleId: findNearestModuleId(desiredPosition, bounds),
        }
      : resolveCorridorCollision(positionRef.current, desiredPosition, bounds);
    collidedRef.current = collision.collided;

    if (collision.collided) velocityRef.current.multiplyScalar(0.22);

    positionRef.current.copy(collision.position);
    playerPositionRef.current.copy(positionRef.current);

    const time = performance.now() * 0.001;
    const headBob = getHeadBob({
      time,
      speed: movement.speed,
      sprinting: movement.sprinting,
      reducedMotion,
    });
    const moving = !reducedMotion && movement.speed > 0.08;
    const footFrequency = movement.sprinting ? SPRINT_BOB_FREQUENCY : WALK_BOB_FREQUENCY;
    const footPhase = moving ? Math.sin(time * footFrequency) : 0;
    const phaseThreshold = 0.72;
    const minStepGap = movement.sprinting ? 0.04 : 0.1;
    const stepMultiplier = movement.sprinting ? 4 : 2;
    const crossedStepPeak =
      moving &&
      (
        (previousFootPhaseRef.current < phaseThreshold && footPhase >= phaseThreshold) ||
        (previousFootPhaseRef.current > -phaseThreshold && footPhase <= -phaseThreshold)
      );
    const startedMoving = moving && !wasMovingRef.current;

    if (
      (startedMoving || crossedStepPeak) &&
      time - lastFootstepTimeRef.current >= minStepGap
    ) {
      lastFootstepTimeRef.current = time;
      setFootstepStep((current) => current + stepMultiplier);
    }

    previousFootPhaseRef.current = footPhase;
    wasMovingRef.current = moving;
    setSprintingState((current) => (current === movement.sprinting ? current : movement.sprinting));

    const breathing = reducedMotion ? 0 : Math.sin(time * 0.85) * 0.011;
    const targetPosition = positionRef.current.clone();
    targetPosition.y = PLAYER_HEIGHT + breathing + headBob.y;
    targetPosition.x += headBob.x;

    camera.position.lerp(targetPosition, 1 - Math.pow(0.0012, delta));
    camera.rotation.set(pitchRef.current, yawRef.current, headBob.roll, "YXZ");

    frameStatsRef.current.elapsed += delta;
    frameStatsRef.current.frames += 1;
    if (DEBUG_PLAYER && frameStatsRef.current.elapsed >= 0.35) {
      frameStatsRef.current.fps = Math.round(
        frameStatsRef.current.frames / frameStatsRef.current.elapsed
      );
      frameStatsRef.current.elapsed = 0;
      frameStatsRef.current.frames = 0;

      onDebugChange({
        position: roundVector(positionRef.current),
        rotation: Number(yawRef.current.toFixed(3)),
        nearestModuleId: collision.nearestModuleId,
        collided: collidedRef.current,
        fps: frameStatsRef.current.fps,
        speed: Number(movement.speed.toFixed(3)),
        sprinting: movement.sprinting,
        grounded: true,
        collisionEnabled: !DEBUG_DISABLE_COLLISIONS,
        footstepVolume,
        backgroundVolume,
        footstepStep,
      });
    }
  });

  return null;
};
