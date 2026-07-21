import { create } from "zustand";
import type { MapBuilderDocument, MapModule, MapObjectProps, MapObjectType, PrefabAsset } from "./types";

const DEFAULT_GRID_SIZE = 0.1;
export const SNAP_LEVELS = [1, 0.5, 0.25, 0.1, 0.05] as const;
export type SnapSize = (typeof SNAP_LEVELS)[number];
export const MODULE_STEP = 6;

const createModuleId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `module-${Date.now()}-${Math.round(Math.random() * 100000)}`;
};

const defaultPropsByType = (type: MapObjectType): MapObjectProps => {
  if (type === "warp") {
    return {
      destination: "loop_start",
      condition: null,
      effect: "blackMist",
      audio: "warp_default",
    };
  }

  if (type === "audioPoint") {
    return {
      audio: "ambience_01",
      radius: 6,
      volume: 0.5,
      loop: true,
    };
  }

  if (type === "trigger") {
    return {
      event: "example_event",
      once: true,
    };
  }

  if (type === "lightPoint") {
    return {
      color: "#b8ffbd",
      intensity: 1,
      distance: 5,
    };
  }

  if (type === "monsterSpawn") {
    return {
      enabled: true,
      scenario: "debug-idle",
      initialAnimation: "idle",
    };
  }

  return {};
};

const createMapModule = (
  type: MapObjectType,
  position: [number, number, number],
  rotation = 0,
  gridSize = DEFAULT_GRID_SIZE,
  id = createModuleId()
): MapModule => ({
  id,
  type,
  asset: type === "monsterSpawn" ? "monster-mutant-7" : "corridor",
  position: snapPosition(position, gridSize),
  rotation,
  scale: [1, 1, 1],
  props: defaultPropsByType(type),
});

const snapValue = (value: number, gridSize: number) => Math.round(value / gridSize) * gridSize;

export const snapPosition = (
  position: [number, number, number],
  gridSize: number
): [number, number, number] => [
  snapValue(position[0], gridSize),
  snapValue(position[1], gridSize),
  snapValue(position[2], gridSize),
];

interface MapBuilderState {
  modules: MapModule[];
  selectedId: string | null;
  previousSelectedId: string | null;
  copiedPosition: [number, number, number] | null;
  gridSize: number;
  isMoveMode: boolean;
  addRequest: number;
  pendingAddType: MapObjectType;
  lastMessage: string;
  jsonDraft: string;
  addModule: (asset: PrefabAsset, position: [number, number, number], rotation?: number, type?: MapObjectType) => string;
  requestAddCorridor: () => void;
  requestAddObject: (type: MapObjectType) => void;
  selectModule: (id: string | null) => void;
  moveSelected: (position: [number, number, number]) => void;
  nudgeSelected: (axis: "x" | "y" | "z", amount: number) => void;
  setSelectedPositionAxis: (axis: "x" | "y" | "z", value: number) => void;
  setSelectedRotation: (value: number) => void;
  rotateSelected: () => void;
  rotateSelectedBy: (degrees: number) => void;
  deleteSelected: () => void;
  duplicateSelected: () => void;
  duplicateSelectedOffset: (offset: [number, number, number]) => void;
  alignSelectedToPrevious: (axis: "x" | "z") => void;
  copyPreviousPosition: () => void;
  pastePosition: () => void;
  setSnapSize: (value: number) => void;
  cycleSnapSize: (direction: "finer" | "larger") => void;
  setMoveMode: (enabled: boolean) => void;
  exportJson: () => string;
  setJsonDraft: (value: string) => void;
  loadJson: (value: string) => { ok: boolean; error?: string };
  clearMap: () => void;
}

const toDocument = (modules: MapModule[], gridSize: number): MapBuilderDocument => ({
  version: 1,
  gridSize,
  modules: modules.map(({ id, type, asset, position, rotation, scale, props }) => ({
    id,
    type,
    asset,
    position,
    rotation,
    scale,
    props,
  })),
});

const parseDocument = (value: string): MapBuilderDocument => {
  const parsed = JSON.parse(value) as Partial<MapBuilderDocument>;

  if (!Array.isArray(parsed.modules)) {
    throw new Error("Le JSON doit contenir un tableau modules.");
  }

  return {
    version: 1,
    gridSize: typeof parsed.gridSize === "number" ? parsed.gridSize : DEFAULT_GRID_SIZE,
    modules: parsed.modules.map((module, index) => {
      const type = module.type ?? "corridor";
      const asset = module.asset ?? (type === "monsterSpawn" ? "monster-mutant-7" : "corridor");

      if (asset !== "corridor" && asset !== "monster-mutant-7") {
        throw new Error(`Module ${index}: asset inconnu.`);
      }

      if (!Array.isArray(module.position) || module.position.length !== 3) {
        throw new Error(`Module ${index}: position invalide.`);
      }

      return {
        id: module.id ?? createModuleId(),
        type,
        asset,
        position: [
          Number(module.position[0]) || 0,
          Number(module.position[1]) || 0,
          Number(module.position[2]) || 0,
        ],
        rotation: Number(module.rotation) || 0,
        scale: Array.isArray(module.scale)
          ? [
              Number(module.scale[0]) || 1,
              Number(module.scale[1]) || 1,
              Number(module.scale[2]) || 1,
            ]
          : [1, 1, 1],
        props: module.props ?? defaultPropsByType(type),
      };
    }),
  };
};

export const useMapBuilderStore = create<MapBuilderState>((set, get) => ({
  modules: [
    createMapModule("corridor", [0, 0, 0]),
  ],
  selectedId: null,
  previousSelectedId: null,
  copiedPosition: null,
  gridSize: DEFAULT_GRID_SIZE,
  isMoveMode: false,
  addRequest: 0,
  pendingAddType: "corridor",
  lastMessage: "Map Builder pret.",
  jsonDraft: "",

  addModule: (_asset, position, rotation = 0, type = "corridor") => {
    const module = createMapModule(type, position, rotation, get().gridSize);

    set((state) => ({
      modules: [
        ...state.modules,
        module,
      ],
      selectedId: module.id,
      isMoveMode: false,
      lastMessage: `Objet ${type} ajoute en ${module.position.join(", ")}.`,
    }));

    return module.id;
  },

  requestAddCorridor: () =>
    set((state) => ({
      addRequest: state.addRequest + 1,
      pendingAddType: "corridor",
      lastMessage: "Ajout demande devant la camera.",
    })),

  requestAddObject: (type) =>
    set((state) => ({
      addRequest: state.addRequest + 1,
      pendingAddType: type,
      lastMessage: `Ajout ${type} demande devant la camera.`,
    })),

  selectModule: (id) =>
    set((state) => ({
      selectedId: id,
      previousSelectedId:
        id && state.selectedId && state.selectedId !== id ? state.selectedId : state.previousSelectedId,
      isMoveMode: id === state.selectedId && state.isMoveMode ? false : state.isMoveMode && id !== state.selectedId ? false : state.isMoveMode,
      lastMessage:
        id === state.selectedId && state.isMoveMode
          ? "Module pose."
          : id
            ? "Module selectionne. Appuyez sur G pour deplacer."
            : "Selection vide.",
    })),

  moveSelected: (position) =>
    set((state) => {
      if (!state.selectedId) return state;
      const snappedPosition = snapPosition(position, state.gridSize);

      return {
        modules: state.modules.map((module) =>
          module.id === state.selectedId ? { ...module, position: snappedPosition } : module
        ),
        lastMessage: `Move snap ${state.gridSize}: ${snappedPosition.join(", ")}`,
      };
    }),

  nudgeSelected: (axis, amount) =>
    set((state) => {
      if (!state.selectedId) return state;
      const axisIndex = axis === "x" ? 0 : axis === "y" ? 1 : 2;

      return {
        modules: state.modules.map((module) => {
          if (module.id !== state.selectedId) return module;
          const position = [...module.position] as [number, number, number];
          position[axisIndex] = Number((position[axisIndex] + amount).toFixed(4));
          return { ...module, position: snapPosition(position, axis === "y" ? 0.01 : state.gridSize) };
        }),
        lastMessage: `Nudge ${axis.toUpperCase()} ${amount.toFixed(3)}m.`,
      };
    }),

  setSelectedPositionAxis: (axis, value) =>
    set((state) => {
      if (!state.selectedId || Number.isNaN(value)) return state;
      const axisIndex = axis === "x" ? 0 : axis === "y" ? 1 : 2;

      return {
        modules: state.modules.map((module) => {
          if (module.id !== state.selectedId) return module;
          const position = [...module.position] as [number, number, number];
          position[axisIndex] = Number(value.toFixed(4));
          return { ...module, position };
        }),
        lastMessage: `Position ${axis.toUpperCase()} definie.`,
      };
    }),

  setSelectedRotation: (value) =>
    set((state) => {
      if (!state.selectedId || Number.isNaN(value)) return state;
      const rotation = ((value % 360) + 360) % 360;

      return {
        modules: state.modules.map((module) =>
          module.id === state.selectedId ? { ...module, rotation } : module
        ),
        lastMessage: `Rotation definie: ${rotation}deg.`,
      };
    }),

  rotateSelected: () =>
    get().rotateSelectedBy(90),

  rotateSelectedBy: (degrees) =>
    set((state) => {
      if (!state.selectedId) return state;

      return {
        modules: state.modules.map((module) =>
          module.id === state.selectedId
            ? { ...module, rotation: ((module.rotation + degrees) % 360 + 360) % 360 }
            : module
        ),
        lastMessage: `Rotation ${degrees > 0 ? "+" : ""}${degrees} degres.`,
      };
    }),

  deleteSelected: () =>
    set((state) => {
      if (!state.selectedId) return state;

      return {
        modules: state.modules.filter((module) => module.id !== state.selectedId),
        selectedId: null,
        isMoveMode: false,
        lastMessage: "Module supprime.",
      };
    }),

  duplicateSelected: () =>
    set((state) => {
      const selected = state.modules.find((module) => module.id === state.selectedId);
      if (!selected) return state;

      const duplicated: MapModule = {
        ...selected,
        id: createModuleId(),
        position: snapPosition(
          [selected.position[0] + MODULE_STEP, selected.position[1], selected.position[2]],
          state.gridSize
        ),
      };

      return {
        modules: [...state.modules, duplicated],
        selectedId: duplicated.id,
        previousSelectedId: selected.id,
        isMoveMode: false,
        lastMessage: "Module duplique.",
      };
    }),

  duplicateSelectedOffset: (offset) =>
    set((state) => {
      const selected = state.modules.find((module) => module.id === state.selectedId);
      if (!selected) return state;

      const duplicated: MapModule = {
        ...selected,
        id: createModuleId(),
        position: snapPosition(
          [
            selected.position[0] + offset[0],
            selected.position[1] + offset[1],
            selected.position[2] + offset[2],
          ],
          state.gridSize
        ),
      };

      return {
        modules: [...state.modules, duplicated],
        selectedId: duplicated.id,
        previousSelectedId: selected.id,
        isMoveMode: false,
        lastMessage: `Duplique en ${duplicated.position.join(", ")}.`,
      };
    }),

  alignSelectedToPrevious: (axis) =>
    set((state) => {
      const selected = state.modules.find((module) => module.id === state.selectedId);
      const previous = state.modules.find((module) => module.id === state.previousSelectedId);
      if (!selected || !previous) return { lastMessage: "Aucune selection precedente pour aligner." };

      const axisIndex = axis === "x" ? 0 : 2;
      return {
        modules: state.modules.map((module) => {
          if (module.id !== selected.id) return module;
          const position = [...module.position] as [number, number, number];
          position[axisIndex] = previous.position[axisIndex];
          return { ...module, position };
        }),
        lastMessage: `Alignement ${axis.toUpperCase()} sur selection precedente.`,
      };
    }),

  copyPreviousPosition: () =>
    set((state) => {
      const previous = state.modules.find((module) => module.id === state.previousSelectedId);
      if (!previous) return { lastMessage: "Aucune position precedente a copier." };

      return {
        copiedPosition: previous.position,
        lastMessage: `Position precedente copiee: ${previous.position.join(", ")}.`,
      };
    }),

  pastePosition: () =>
    set((state) => {
      if (!state.selectedId || !state.copiedPosition) return { lastMessage: "Aucune position a coller." };

      return {
        modules: state.modules.map((module) =>
          module.id === state.selectedId ? { ...module, position: state.copiedPosition! } : module
        ),
        lastMessage: `Position collee: ${state.copiedPosition.join(", ")}.`,
      };
    }),

  setSnapSize: (value) =>
    set({
      gridSize: value,
      lastMessage: `Snap ${value}m.`,
    }),

  cycleSnapSize: (direction) =>
    set((state) => {
      const currentIndex = SNAP_LEVELS.findIndex((level) => level === state.gridSize);
      const fallbackIndex = SNAP_LEVELS.findIndex((level) => level === DEFAULT_GRID_SIZE);
      const index = currentIndex >= 0 ? currentIndex : fallbackIndex;
      const nextIndex =
        direction === "finer"
          ? Math.min(SNAP_LEVELS.length - 1, index + 1)
          : Math.max(0, index - 1);
      const nextSnap = SNAP_LEVELS[nextIndex];

      return {
        gridSize: nextSnap,
        lastMessage: `Snap ${nextSnap}m.`,
      };
    }),

  setMoveMode: (enabled) =>
    set((state) => ({
      isMoveMode: Boolean(state.selectedId) && enabled,
      lastMessage: enabled ? "Mode deplacement: bougez la souris sur la grille." : "Mode deplacement termine.",
    })),

  exportJson: () => {
    const json = JSON.stringify(toDocument(get().modules, get().gridSize), null, 2);
    set({ jsonDraft: json, lastMessage: "JSON exporte." });
    return json;
  },

  setJsonDraft: (value) => set({ jsonDraft: value }),

  loadJson: (value) => {
    try {
      const document = parseDocument(value);
      const nextModules: MapModule[] = document.modules.map((module) => ({
        ...module,
        id: createModuleId(),
        position: snapPosition(module.position, document.gridSize),
      }));

      set({
      modules: nextModules,
      selectedId: nextModules[0]?.id ?? null,
      previousSelectedId: null,
      gridSize: document.gridSize,
      jsonDraft: JSON.stringify(document, null, 2),
      isMoveMode: false,
        lastMessage: `${nextModules.length} modules charges.`,
      });

      return { ok: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : "JSON invalide.";
      set({ lastMessage: message });
      return { ok: false, error: message };
    }
  },

  clearMap: () =>
    set({
      modules: [],
      selectedId: null,
      previousSelectedId: null,
      copiedPosition: null,
      isMoveMode: false,
      lastMessage: "Map vide.",
    }),
}));
