export const PLAYER_HEIGHT = 1.65;

export const PLAYER_SPAWN = {
  position: [4.2, PLAYER_HEIGHT, 6.872] as [number, number, number],
  rotation: 1.56,
};

export const SPAWN_PRESETS = [
  { name: "module-0-front", position: [4.2, PLAYER_HEIGHT, 6.872] as [number, number, number], rotation: 1.56 },
  { name: "module-0-back", position: [4.59, PLAYER_HEIGHT, -5.2] as [number, number, number], rotation: 0 },
  { name: "high-overview", position: [0, 8, 8] as [number, number, number], rotation: 0 },
];

export const DEBUG_PLAYER = true;
export const DEBUG_COLLISIONS = true;
export const DEBUG_VISUAL = false;
export const DEBUG_DISABLE_COLLISIONS = false;
