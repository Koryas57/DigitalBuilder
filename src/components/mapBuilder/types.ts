export type PrefabAsset = "corridor" | "monster-mutant-7";
export type MapObjectType =
  | "corridor"
  | "playerSpawn"
  | "warp"
  | "trigger"
  | "audioPoint"
  | "lightPoint"
  | "monsterSpawn";

export type MapObjectProps = Record<string, unknown>;

export interface MapModule {
  id: string;
  type: MapObjectType;
  asset: PrefabAsset;
  position: [number, number, number];
  rotation: number;
  scale: [number, number, number];
  props: MapObjectProps;
}

export interface MapBuilderDocument {
  version: 1;
  gridSize: number;
  modules: Array<{
    id: string;
    type: MapObjectType;
    asset: PrefabAsset;
    position: [number, number, number];
    rotation: number;
    scale: [number, number, number];
    props: MapObjectProps;
  }>;
}

export interface PrefabDefinition {
  id: PrefabAsset;
  name: string;
  path: string;
}
