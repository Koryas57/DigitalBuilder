import React, { useMemo, useState } from "react";
import { Html, useProgress } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import {
  COLLISION_MODE,
  MINE_FREE_BOUNDS,
  MINE_SPAWN,
  MINE_SPAWN_STORAGE_KEY,
  type MineSpawnConfig,
} from "./CameraBounds";
import type { LightingPreset } from "./MineLighting";
import { ACTIVE_MAP_PATH, MAP_QUALITY } from "./MineConfig";

interface ExplorationDebugPanelProps {
  visible: boolean;
  lightingPreset: LightingPreset;
}

const formatVector = (values: number[]) => values.map((value) => value.toFixed(2)).join(", ");

export const ExplorationDebugPanel: React.FC<ExplorationDebugPanelProps> = ({
  visible,
  lightingPreset,
}) => {
  const { camera } = useThree();
  const { progress } = useProgress();
  const [savedSpawn, setSavedSpawn] = useState<MineSpawnConfig | null>(() => {
    try {
      const rawSpawn = window.localStorage.getItem(MINE_SPAWN_STORAGE_KEY);
      return rawSpawn ? (JSON.parse(rawSpawn) as MineSpawnConfig) : null;
    } catch {
      return null;
    }
  });
  const [snapshot, setSnapshot] = useState({
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    fps: 0,
  });

  const frameStats = useMemo(
    () => ({
      elapsed: 0,
      frames: 0,
      fps: 0,
    }),
    []
  );

  React.useEffect(() => {
    const handleSpawnSaved = (event: Event) => {
      setSavedSpawn((event as CustomEvent<MineSpawnConfig>).detail);
    };

    window.addEventListener("mine-spawn-saved", handleSpawnSaved);
    return () => window.removeEventListener("mine-spawn-saved", handleSpawnSaved);
  }, []);

  useFrame((_, delta) => {
    frameStats.elapsed += delta;
    frameStats.frames += 1;

    if (frameStats.elapsed < 0.35) return;

    frameStats.fps = Math.round(frameStats.frames / frameStats.elapsed);
    frameStats.elapsed = 0;
    frameStats.frames = 0;

    setSnapshot({
      position: camera.position.toArray(),
      rotation: [camera.rotation.x, camera.rotation.y, camera.rotation.z],
      fps: frameStats.fps,
    });
  });

  if (!visible) return null;

  return (
    <Html fullscreen zIndexRange={[20, 0]}>
      <div className="developer-r3f-debug">
        <strong>Debug exploration</strong>
        <span>Map: {ACTIVE_MAP_PATH}</span>
        <span>Quality: {MAP_QUALITY}</span>
        <span>Loading: {Math.round(progress)}%</span>
        <span>Camera: {formatVector(snapshot.position)}</span>
        <span>Rotation: {formatVector(snapshot.rotation)}</span>
        <span>Lighting: {lightingPreset}</span>
        <span>Collision: {COLLISION_MODE}</span>
        <span>
          Bounds: x {MINE_FREE_BOUNDS.minX}/{MINE_FREE_BOUNDS.maxX} - z{" "}
          {MINE_FREE_BOUNDS.minZ}/{MINE_FREE_BOUNDS.maxZ}
        </span>
        <span>Default spawn: {formatVector(MINE_SPAWN.position)}</span>
        <span>Saved spawn: {savedSpawn ? formatVector(savedSpawn.position) : "none"}</span>
        <span>FPS: {snapshot.fps}</span>
      </div>
    </Html>
  );
};
