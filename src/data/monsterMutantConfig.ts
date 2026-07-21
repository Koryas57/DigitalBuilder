export type MonsterPresenceState =
  | "hidden"
  | "loading"
  | "waiting"
  | "patrolling"
  | "hunting"
  | "observed"
  | "reacting"
  | "chasing"
  | "attacking"
  | "blocked"
  | "waitingForLookAway"
  | "disappeared";

export type MonsterSemanticAnimation =
  | "idle"
  | "walk"
  | "run"
  | "walkBack"
  | "rage"
  | "attack"
  | "hit"
  | "death";

export interface MonsterSpawnConfig {
  id: string;
  type: "monsterSpawn";
  asset: "monster-mutant-7";
  position: [number, number, number];
  rotation: number;
  scale: [number, number, number];
  props: {
    enabled: boolean;
    scenario: string;
    initialAnimation: MonsterSemanticAnimation | string;
  };
}

export interface MonsterDebugState {
  loaded: boolean;
  visible: boolean;
  assetPath: string;
  currentAnimation: string | null;
  animationIndex: number;
  clipCount: number;
  clipNames: string[];
  scale: number;
  rotationY: number;
  position: [number, number, number];
  bounds: {
    min: [number, number, number];
    max: [number, number, number];
    size: [number, number, number];
  } | null;
  estimatedHeight: number;
  meshCount: number;
  skinnedMeshCount: number;
  materialCount: number;
  missingTextures: string[];
  loadTimeMs: number;
  state: MonsterPresenceState;
  aiMode: string;
  playerDistance: number | null;
  blocked: boolean;
  error: string | null;
}

export const MONSTER_MUTANT_CONFIG = {
  assetPath: "/assets/characters/monster-mutant-7/monster_mutant_7.glb",
  textureBasePath: "/assets/characters/monster-mutant-7/textures/",
  textureMaps: {
    albedo: "/assets/characters/monster-mutant-7/textures/textures%20skin1%20body%20v2/1_Albedo.tga",
    normal: "/assets/characters/monster-mutant-7/textures/textures%20skin1%20body%20v2/1_Normal.tga",
    emission: "/assets/characters/monster-mutant-7/textures/textures%20skin1%20body%20v2/1_Emission.tga",
    metalGloss: "/assets/characters/monster-mutant-7/textures/textures%20skin1%20body%20v2/1_metalic%2Bgloss.tga",
    occlusion: "/assets/characters/monster-mutant-7/textures/textures%20skin1%20body%20v2/1_Occlusion.tga",
  },
  preferredSkin: "skin1",
  scale: 0.01,
  rotationOffsetY: 0,
  verticalOffset: 0,
  castShadow: true,
  receiveShadow: true,
  enabled: true,
  debug: true,
  debugAdjustments: {
    scale: 0.01,
    rotationY: 0,
    positionY: 0,
    frontOrientationY: Math.PI,
  },
  ai: {
    enabled: true,
    walkSpeed: 0.52,
    runSpeed: 1.72,
    collisionRadius: 0.24,
    turnSpeed: 6.2,
    detectionRadius: 8.5,
    detectionConeDot: -0.12,
    attackDistance: 1.15,
    attackCooldownMs: 860,
    rageDurationMs: 1250,
    idleMinMs: 1700,
    idleMaxMs: 3600,
    loseSightDistance: 12,
    loseSightGraceMs: 1700,
    chaseBurstMs: 2800,
    recoveryMs: 1500,
    scanDistance: 1.55,
    turnDecisionCooldownMs: 260,
    blockedAfterMs: 360,
    movementEpsilon: 0.028,
    spawnDelayMs: 60000,
    maxAttackCount: 12,
  },
  audio: {
    idle: "/assets/audio/monster_idle.wav",
    walk: "/assets/audio/monster_walk.wav",
    rage: "/assets/audio/monster_rage.wav",
    hits: ["/assets/audio/monster_hit.wav", "/assets/audio/monster_hit2.wav"],
    breathingDamage: "/assets/audio/breathing.wav",
    idleVolume: 0.72,
    walkVolume: 0.62,
    rageVolume: 0.92,
    hitVolume: 0.95,
    nearDistance: 1.2,
    audibleDistance: 6.5,
    idleCooldownMs: 11000,
    walkCooldownMs: 8500,
  },
} as const;

export const MONSTER_TEST_MODE = true;
export const MONSTER_TEST_POSITION: [number, number, number] = [0, 0, -8];
export const MONSTER_TEST_ROTATION_Y = Math.PI;

export const EMPTY_MONSTER_DEBUG_STATE: MonsterDebugState = {
  loaded: false,
  visible: false,
  assetPath: MONSTER_MUTANT_CONFIG.assetPath,
  currentAnimation: null,
  animationIndex: -1,
  clipCount: 0,
  clipNames: [],
  scale: MONSTER_MUTANT_CONFIG.scale,
  rotationY: MONSTER_TEST_ROTATION_Y,
  position: MONSTER_TEST_POSITION,
  bounds: null,
  estimatedHeight: 0,
  meshCount: 0,
  skinnedMeshCount: 0,
  materialCount: 0,
  missingTextures: [],
  loadTimeMs: 0,
  state: "hidden",
  aiMode: "hidden",
  playerDistance: null,
  blocked: false,
  error: null,
};
