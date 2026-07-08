import React, { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { DeveloperStationPlacement } from "../../../data/developerPath";
import {
  MINE_SPAWN,
  MINE_SPAWN_STORAGE_KEY,
  resolveCameraBounds,
  type MineSpawnConfig,
} from "./CameraBounds";
import type { CameraSequence } from "./CameraSequence";
import { getSequenceDuration, getSequenceFrame } from "./CameraSpline";

interface CinematicCameraControllerProps {
  stationPlacements: DeveloperStationPlacement[];
  movementInput: { x: number; z: number };
  lookInput: { x: number; y: number };
  activeSequence: CameraSequence | null;
  activePanelOpen: boolean;
  reducedMotion: boolean;
  onNearStationChange: (stationId: string | null) => void;
  onSequenceTextChange: (text: string | null) => void;
  onSequenceComplete: () => void;
}

const HUMAN_HEIGHT = MINE_SPAWN.height;
const MOVE_SPEED = 0.92;
const FAST_SPEED = 1.22;
const LOOK_SENSITIVITY = 0.00155;
const MOBILE_LOOK_SENSITIVITY = 0.0038;
const PITCH_LIMIT = Math.PI * 0.22;

const roundVector = (vector: THREE.Vector3): [number, number, number] => [
  Number(vector.x.toFixed(3)),
  Number(vector.y.toFixed(3)),
  Number(vector.z.toFixed(3)),
];

const getSavedSpawn = (): MineSpawnConfig => {
  try {
    const rawSpawn = window.localStorage.getItem(MINE_SPAWN_STORAGE_KEY);
    if (!rawSpawn) return MINE_SPAWN;
    const parsed = JSON.parse(rawSpawn) as MineSpawnConfig;
    if (!Array.isArray(parsed.position) || !Array.isArray(parsed.lookAt)) return MINE_SPAWN;
    return parsed;
  } catch {
    return MINE_SPAWN;
  }
};

export const CinematicCameraController: React.FC<CinematicCameraControllerProps> = ({
  stationPlacements,
  movementInput,
  lookInput,
  activeSequence,
  activePanelOpen,
  reducedMotion,
  onNearStationChange,
  onSequenceTextChange,
  onSequenceComplete,
}) => {
  const { camera, gl } = useThree();
  const keysRef = useRef<Record<string, boolean>>({});
  const spawnRef = useRef<MineSpawnConfig>(MINE_SPAWN);
  const positionRef = useRef(new THREE.Vector3(...MINE_SPAWN.position));
  const velocityRef = useRef(new THREE.Vector3());
  const initialSpawn = spawnRef.current;
  const spawnDirection = new THREE.Vector3(...initialSpawn.lookAt)
    .sub(new THREE.Vector3(...initialSpawn.position))
    .normalize();
  const yawRef = useRef(Math.atan2(-spawnDirection.x, -spawnDirection.z));
  const pitchRef = useRef(Math.asin(spawnDirection.y));
  const dragRef = useRef(false);
  const lastPointerRef = useRef({ x: 0, y: 0 });
  const lastLookRef = useRef({ x: 0, y: 0 });
  const nearStationRef = useRef<string | null>(null);
  const sequenceStartRef = useRef<number | null>(null);
  const [sequenceId, setSequenceId] = useState<string | null>(null);

  const resetCameraToSpawn = React.useCallback(() => {
    const spawn = spawnRef.current;
    positionRef.current.copy(new THREE.Vector3(...spawn.position));
    velocityRef.current.set(0, 0, 0);
    camera.position.copy(positionRef.current);
    camera.lookAt(new THREE.Vector3(...spawn.lookAt));

    const nextDirection = new THREE.Vector3(...spawn.lookAt)
      .sub(new THREE.Vector3(...spawn.position))
      .normalize();
    yawRef.current = Math.atan2(-nextDirection.x, -nextDirection.z);
    pitchRef.current = Math.asin(nextDirection.y);
  }, [camera]);

  const stationTargets = useMemo(
    () =>
      stationPlacements.map((station) => ({
        ...station,
        vector: new THREE.Vector3(station.position[0], HUMAN_HEIGHT, station.position[2]),
      })),
    [stationPlacements]
  );

  useEffect(() => {
    spawnRef.current = getSavedSpawn();
    resetCameraToSpawn();
  }, [resetCameraToSpawn]);

  useEffect(() => {
    if (activeSequence?.id !== sequenceId) {
      sequenceStartRef.current = activeSequence ? performance.now() : null;
      setSequenceId(activeSequence?.id ?? null);
      onSequenceTextChange(activeSequence?.steps[0]?.text ?? null);
    }
  }, [activeSequence, onSequenceTextChange, sequenceId]);

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
      yawRef.current -= dx * LOOK_SENSITIVITY;
      pitchRef.current = THREE.MathUtils.clamp(
        pitchRef.current - dy * LOOK_SENSITIVITY,
        -PITCH_LIMIT,
        PITCH_LIMIT
      );
    };

    const stopDrag = () => {
      dragRef.current = false;
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      keysRef.current[event.key.toLowerCase()] = true;

      if (event.key.toLowerCase() === "p") {
        const direction = new THREE.Vector3();
        camera.getWorldDirection(direction);
        const lookAt = camera.position.clone().add(direction.multiplyScalar(2));
        console.info("[Mine camera debug]", {
          position: roundVector(camera.position),
          rotation: [camera.rotation.x, camera.rotation.y, camera.rotation.z].map((value) =>
            Number(value.toFixed(3))
          ),
          lookAt: roundVector(lookAt),
          activeSpawn: spawnRef.current,
          copyPasteSpawn: {
            position: roundVector(camera.position),
            lookAt: roundVector(lookAt),
            height: MINE_SPAWN.height,
          },
        });
      }

      if (event.key.toLowerCase() === "b") {
        const direction = new THREE.Vector3();
        camera.getWorldDirection(direction);
        const lookAt = camera.position.clone().add(direction.multiplyScalar(2));
        const nextSpawn: MineSpawnConfig = {
          position: roundVector(camera.position),
          lookAt: roundVector(lookAt),
          height: MINE_SPAWN.height,
        };

        spawnRef.current = nextSpawn;
        window.localStorage.setItem(MINE_SPAWN_STORAGE_KEY, JSON.stringify(nextSpawn));
        window.dispatchEvent(new CustomEvent("mine-spawn-saved", { detail: nextSpawn }));
        console.info("[Mine camera debug] spawn saved", nextSpawn);
      }

      if (event.key.toLowerCase() === "r") {
        resetCameraToSpawn();
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
  }, [camera, gl.domElement, resetCameraToSpawn]);

  useFrame((_, delta) => {
    if (activeSequence && sequenceStartRef.current !== null) {
      const elapsed = performance.now() - sequenceStartRef.current;
      const duration = getSequenceDuration(activeSequence);
      const frame = getSequenceFrame(activeSequence, elapsed);

      camera.position.lerp(frame.position, 1 - Math.pow(0.0008, delta));
      camera.lookAt(frame.lookAt);
      onSequenceTextChange(frame.step.text ?? null);

      if (elapsed >= duration) {
        positionRef.current.copy(camera.position);
        onSequenceComplete();
      }
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

    const speed = keys.shift ? FAST_SPEED : MOVE_SPEED;
    const desiredVelocity =
      input.lengthSq() > 0.01 && !activePanelOpen
        ? input.applyAxisAngle(new THREE.Vector3(0, 1, 0), yawRef.current).multiplyScalar(speed)
        : new THREE.Vector3();

    velocityRef.current.lerp(desiredVelocity, 1 - Math.pow(0.025, delta));
    const desiredPosition = positionRef.current
      .clone()
      .addScaledVector(velocityRef.current, delta);
    const resolvedPosition = resolveCameraBounds(positionRef.current, desiredPosition);

    if (!resolvedPosition.equals(desiredPosition)) {
      velocityRef.current.multiplyScalar(0.25);
    }

    positionRef.current.copy(resolvedPosition);

    const time = performance.now() * 0.001;
    const breathing = reducedMotion ? 0 : Math.sin(time * 0.9) * 0.012;
    const microBob = reducedMotion ? 0 : Math.sin(time * 4.2) * velocityRef.current.length() * 0.004;
    const targetPosition = positionRef.current.clone();
    targetPosition.y += breathing + microBob;

    camera.position.lerp(targetPosition, 1 - Math.pow(0.0015, delta));
    camera.rotation.set(pitchRef.current, yawRef.current, 0, "YXZ");

    const nearest = stationTargets.reduce<{ id: string | null; distance: number }>(
      (current, station) => {
        const distance = camera.position.distanceTo(station.vector) - station.radius;
        return distance < current.distance ? { id: station.id, distance } : current;
      },
      { id: null, distance: Infinity }
    );

    const nextNearStation = nearest.distance < 0 ? nearest.id : null;
    if (nextNearStation !== nearStationRef.current) {
      nearStationRef.current = nextNearStation;
      onNearStationChange(nextNearStation);
    }
  });

  return null;
};
