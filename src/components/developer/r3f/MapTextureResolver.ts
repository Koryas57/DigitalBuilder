import * as THREE from "three";
import { DEBUG_MAP, MINE_ASSET_ROOT } from "./MineConfig";

export interface MineTextureReport {
  assetId: string;
  materialName: string;
  found: string[];
  missing: string[];
}

type TextureSlot = "map" | "normalMap" | "roughnessMap" | "aoMap" | "metalnessMap";

interface TextureCandidate {
  slot: TextureSlot;
  labels: string[];
  colorSpace?: THREE.ColorSpace;
  strength?: number;
}

const TEXTURE_CANDIDATES: TextureCandidate[] = [
  { slot: "map", labels: ["BaseColor", "Albedo"], colorSpace: THREE.SRGBColorSpace },
  { slot: "normalMap", labels: ["Normal"] },
  { slot: "roughnessMap", labels: ["Roughness", "Gloss"] },
  { slot: "aoMap", labels: ["AO", "Cavity"], strength: 0.72 },
  { slot: "metalnessMap", labels: ["Specular"], strength: 0.02 },
];

export const getMineAssetRoot = (assetId: string) => `${MINE_ASSET_ROOT}/${assetId}`;

export const resolveMineTextureUrl = (assetId: string, label: string) =>
  `${getMineAssetRoot(assetId)}/${assetId}_4K_${label}.jpg`;

const configureTexture = (
  texture: THREE.Texture,
  slot: TextureSlot,
  colorSpace?: THREE.ColorSpace
) => {
  texture.colorSpace = colorSpace ?? THREE.NoColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 4;

  if (slot === "map") {
    texture.repeat.set(1, 1);
  }

  return texture;
};

export const createMineLoadingManager = () => {
  const manager = new THREE.LoadingManager();

  manager.onError = (url) => {
    if (DEBUG_MAP) console.warn("[Mine textures] missing resource", url);
  };

  return manager;
};

export const applyMineTexturesToMaterial = (
  material: THREE.MeshStandardMaterial,
  assetId: string,
  textureLoader: THREE.TextureLoader
): MineTextureReport => {
  const report: MineTextureReport = {
    assetId,
    materialName: material.name || "unnamed-material",
    found: [],
    missing: [],
  };

  TEXTURE_CANDIDATES.forEach((candidate) => {
    const primaryLabel = candidate.labels[0];
    const url = resolveMineTextureUrl(assetId, primaryLabel);

    const texture = textureLoader.load(
      url,
      (loadedTexture) => {
        configureTexture(loadedTexture, candidate.slot, candidate.colorSpace);
        material.needsUpdate = true;
      },
      undefined,
      () => {
        report.missing.push(candidate.labels.join(" | "));
      }
    );

    configureTexture(texture, candidate.slot, candidate.colorSpace);
    material[candidate.slot] = texture;
    report.found.push(primaryLabel);
  });

  material.roughness = 0.92;
  material.metalness = 0.02;
  material.envMapIntensity = 0.18;
  material.side = THREE.FrontSide;

  if (material.aoMap) material.aoMapIntensity = 0.82;
  if (material.normalMap) material.normalScale = new THREE.Vector2(0.82, 0.82);

  return report;
};
