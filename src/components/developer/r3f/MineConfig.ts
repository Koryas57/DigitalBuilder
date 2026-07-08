export type MapQuality = "debug" | "balanced" | "high";
export type CollisionMode = "debug-free" | "manual" | "trimesh";

export const DEBUG_MAP = true;
export const MAP_QUALITY = "balanced" as MapQuality;
export const COLLISION_MODE: CollisionMode = "debug-free";

export const MINE_ASSET_ROOT = "/assets/maps/mine_high";

export const ACTIVE_MAP_PATH = `${MINE_ASSET_ROOT}/wdpnchtdw/wdpnchtdw.fbx`;

export const MINE_SPAWN_STORAGE_KEY = "developer-mine-spawn-v1";

export const MINE_SPAWN = {
  position: [0, 1.65, 7.2] as [number, number, number],
  lookAt: [0, 1.48, 2.8] as [number, number, number],
  height: 1.65,
};

export interface MineSpawnConfig {
  position: [number, number, number];
  lookAt: [number, number, number];
  height: number;
}

export const MINE_FREE_BOUNDS = {
  minX: -5.4,
  maxX: 5.4,
  minZ: -16.5,
  maxZ: 8.5,
  minY: 1.45,
  maxY: 1.85,
};

export interface MineAssetPlacement {
  id: string;
  path: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  role: "rock" | "wall" | "ground" | "support" | "debris";
}

const assetPath = (id: string) => `${MINE_ASSET_ROOT}/${id}/${id}.fbx`;

export const MINE_ASSET_PLACEMENTS: MineAssetPlacement[] = [
  {
    id: "wdpnchtdw",
    path: assetPath("wdpnchtdw"),
    position: [-2.4, 0, 1.6],
    rotation: [0, -0.12, 0],
    scale: [0.015, 0.015, 0.015],
    role: "wall",
  },
  {
    id: "wcckeezdw",
    path: assetPath("wcckeezdw"),
    position: [2.3, 0.05, -1.9],
    rotation: [0, Math.PI + 0.18, 0],
    scale: [0.014, 0.014, 0.014],
    role: "wall",
  },
  {
    id: "ufekaffdw",
    path: assetPath("ufekaffdw"),
    position: [-1.8, -0.08, -5.9],
    rotation: [0, 0.48, 0],
    scale: [0.014, 0.014, 0.014],
    role: "rock",
  },
  {
    id: "wcskfaidw",
    path: assetPath("wcskfaidw"),
    position: [2.1, -0.05, -8.7],
    rotation: [0, -0.62, 0],
    scale: [0.0135, 0.0135, 0.0135],
    role: "wall",
  },
  {
    id: "ujzlbgzfa",
    path: assetPath("ujzlbgzfa"),
    position: [-2.7, -0.1, -11.8],
    rotation: [0, 1.12, 0],
    scale: [0.013, 0.013, 0.013],
    role: "debris",
  },
  {
    id: "ufmodhpfa",
    path: assetPath("ufmodhpfa"),
    position: [2.6, -0.08, -13.9],
    rotation: [0, Math.PI - 0.25, 0],
    scale: [0.013, 0.013, 0.013],
    role: "rock",
  },
];

export const getActiveMineAssets = () => {
  if (MAP_QUALITY === "debug") return MINE_ASSET_PLACEMENTS.slice(0, 2);
  if (MAP_QUALITY === "balanced") return MINE_ASSET_PLACEMENTS.slice(0, 5);
  return MINE_ASSET_PLACEMENTS;
};
