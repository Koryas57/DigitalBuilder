import React from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { TGALoader } from "three/examples/jsm/loaders/TGALoader.js";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";
import { MONSTER_MUTANT_CONFIG } from "../data/monsterMutantConfig";

export interface FBXCharacterMetadata {
  bounds: {
    min: [number, number, number];
    max: [number, number, number];
    size: [number, number, number];
  } | null;
  estimatedHeight: number;
  meshCount: number;
  skinnedMeshCount: number;
  materialCount: number;
  objectNames: string[];
  missingTextures: string[];
  loadTimeMs: number;
}

interface UseFBXCharacterState {
  model: THREE.Group | null;
  clips: THREE.AnimationClip[];
  loading: boolean;
  error: string | null;
  metadata: FBXCharacterMetadata;
}

const EMPTY_METADATA: FBXCharacterMetadata = {
  bounds: null,
  estimatedHeight: 0,
  meshCount: 0,
  skinnedMeshCount: 0,
  materialCount: 0,
  objectNames: [],
  missingTextures: [],
  loadTimeMs: 0,
};

const textureProps = [
  "map",
  "normalMap",
  "roughnessMap",
  "metalnessMap",
  "aoMap",
  "emissiveMap",
  "alphaMap",
] as const;

const roundVector = (vector: THREE.Vector3): [number, number, number] => [
  Number(vector.x.toFixed(3)),
  Number(vector.y.toFixed(3)),
  Number(vector.z.toFixed(3)),
];

const getMaterials = (material: THREE.Material | THREE.Material[]) =>
  Array.isArray(material) ? material : [material];

const optimizeTexture = (
  texture: THREE.Texture,
  property: (typeof textureProps)[number],
  maxAnisotropy: number
) => {
  if (property === "map" || property === "emissiveMap") {
    texture.colorSpace = THREE.SRGBColorSpace;
  }

  texture.anisotropy = Math.min(maxAnisotropy, 8);
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
};

const disposeMaterial = (material: THREE.Material | THREE.Material[]) => {
  getMaterials(material).forEach((entry) => {
    textureProps.forEach((property) => {
      const texture = entry[property as keyof THREE.Material] as THREE.Texture | null | undefined;
      texture?.dispose();
    });
    entry.dispose();
  });
};

const loadSkinOneTextures = (
  maxAnisotropy: number,
  missingTextures: Set<string>,
  debug: boolean
) => {
  const tgaLoader = new TGALoader();
  const textureCache = new Map<string, THREE.Texture>();
  const load = (url: string, property: (typeof textureProps)[number]) => {
    const cached = textureCache.get(url);
    if (cached) return cached;

    const texture = tgaLoader.load(
      url,
      (loadedTexture) => {
        optimizeTexture(loadedTexture, property, maxAnisotropy);
        if (debug) console.info("[MonsterMutant] skin 1 texture loaded", url);
      },
      undefined,
      () => {
        missingTextures.add(url);
        if (debug) console.warn("[MonsterMutant] skin 1 texture unavailable", url);
      }
    );
    optimizeTexture(texture, property, maxAnisotropy);
    textureCache.set(url, texture);
    return texture;
  };

  return {
    albedo: load(MONSTER_MUTANT_CONFIG.textureMaps.albedo, "map"),
    normal: load(MONSTER_MUTANT_CONFIG.textureMaps.normal, "normalMap"),
    emission: load(MONSTER_MUTANT_CONFIG.textureMaps.emission, "emissiveMap"),
    metalGloss: load(MONSTER_MUTANT_CONFIG.textureMaps.metalGloss, "metalnessMap"),
    occlusion: load(MONSTER_MUTANT_CONFIG.textureMaps.occlusion, "aoMap"),
  };
};

const createSkinOneMaterial = (
  originalMaterial: THREE.Material,
  textures: ReturnType<typeof loadSkinOneTextures>
) => {
  const original = originalMaterial as THREE.MeshStandardMaterial;
  const material = new THREE.MeshStandardMaterial({
    name: `${originalMaterial.name || "monster"}_skin1_forced`,
    color: "#ffffff",
    map: textures.albedo,
    normalMap: textures.normal,
    aoMap: textures.occlusion,
    roughnessMap: textures.metalGloss,
    metalnessMap: textures.metalGloss,
    emissiveMap: textures.albedo,
    emissive: "#ffffff",
    emissiveIntensity: 0.16,
    roughness: 0.58,
    metalness: 0.04,
    transparent: original.transparent && original.opacity < 1,
    opacity: original.opacity ?? 1,
    side: THREE.FrontSide,
  });

  material.envMapIntensity = 0.45;
  material.normalScale.set(0.72, 0.72);
  material.needsUpdate = true;
  return material;
};

const prepareModel = (
  model: THREE.Group,
  gl: THREE.WebGLRenderer,
  debug: boolean
): FBXCharacterMetadata => {
  const maxAnisotropy = gl.capabilities.getMaxAnisotropy();
  const materialSet = new Set<THREE.Material>();
  const objectNames: string[] = [];
  const missingTextures = new Set<string>();
  const skinOneTextures = loadSkinOneTextures(maxAnisotropy, missingTextures, debug);
  let meshCount = 0;
  let skinnedMeshCount = 0;

  model.traverse((child) => {
    objectNames.push(child.name || child.type);

    if (!(child instanceof THREE.Mesh)) return;
    meshCount += 1;
    if (child instanceof THREE.SkinnedMesh) skinnedMeshCount += 1;

    child.castShadow = MONSTER_MUTANT_CONFIG.castShadow;
    child.receiveShadow = MONSTER_MUTANT_CONFIG.receiveShadow;
    child.frustumCulled = true;

    getMaterials(child.material).forEach((material) => {
      materialSet.add(material);

      textureProps.forEach((property) => {
        const texture = material[property as keyof THREE.Material] as THREE.Texture | null | undefined;
        if (texture instanceof THREE.Texture) {
          optimizeTexture(texture, property, maxAnisotropy);
        }
      });

      if ("transparent" in material && material.opacity >= 1) {
        material.transparent = false;
      }
      material.needsUpdate = true;
    });

    child.material = Array.isArray(child.material)
      ? child.material.map((material) => createSkinOneMaterial(material, skinOneTextures))
      : createSkinOneMaterial(child.material, skinOneTextures);
  });

  model.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(model);
  if (!box.isEmpty()) {
    const center = new THREE.Vector3();
    box.getCenter(center);
    model.position.sub(new THREE.Vector3(center.x, box.min.y, center.z));
    model.updateMatrixWorld(true);
  }
  const normalizedBox = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  const bounds = normalizedBox.isEmpty()
    ? null
    : {
        min: roundVector(normalizedBox.min),
        max: roundVector(normalizedBox.max),
        size: roundVector(normalizedBox.getSize(size)),
      };

  return {
    bounds,
    estimatedHeight: bounds ? bounds.size[1] : 0,
    meshCount,
    skinnedMeshCount,
    materialCount: materialSet.size,
    objectNames,
    missingTextures: Array.from(missingTextures),
    loadTimeMs: 0,
  };
};

export const useFBXCharacter = (
  assetPath: string,
  enabled = true,
  debug = false
): UseFBXCharacterState => {
  const { gl } = useThree();
  const modelRef = React.useRef<THREE.Group | null>(null);
  const [state, setState] = React.useState<UseFBXCharacterState>({
    model: null,
    clips: [],
    loading: enabled,
    error: null,
    metadata: EMPTY_METADATA,
  });

  React.useEffect(() => {
    if (!enabled) {
      setState({
        model: null,
        clips: [],
        loading: false,
        error: null,
        metadata: EMPTY_METADATA,
      });
      return undefined;
    }

    let mounted = true;
    const startedAt = performance.now();
    const isGlb = assetPath.toLowerCase().endsWith(".glb") || assetPath.toLowerCase().endsWith(".gltf");
    const loader = isGlb ? new GLTFLoader() : new FBXLoader();
    setState((current) => ({ ...current, loading: true, error: null }));

    loader.load(
      assetPath,
      (loadedAsset) => {
        if (!mounted) return;

        const loadedModel = isGlb
          ? (loadedAsset as { scene: THREE.Group }).scene
          : (loadedAsset as THREE.Group);
        const sourceClips = isGlb
          ? (loadedAsset as { animations?: THREE.AnimationClip[] }).animations
          : (loadedAsset as THREE.Group).animations;
        const clonedModel = SkeletonUtils.clone(loadedModel) as THREE.Group;
        const clips = sourceClips ?? [];
        const metadata = prepareModel(clonedModel, gl, debug);
        const characterRoot = new THREE.Group();
        characterRoot.name = "MonsterMutant7_Root";
        characterRoot.add(clonedModel);
        metadata.loadTimeMs = Math.round(performance.now() - startedAt);

        if (debug) {
          console.info("[MonsterMutant] Character loaded", {
            assetPath,
            loadTimeMs: metadata.loadTimeMs,
            meshes: metadata.meshCount,
            skinnedMeshes: metadata.skinnedMeshCount,
            materials: metadata.materialCount,
            estimatedHeight: metadata.estimatedHeight,
          });
          console.table(
            clips.map((clip, index) => ({
              index,
              name: clip.name,
              duration: Number(clip.duration.toFixed(3)),
              tracks: clip.tracks.length,
            }))
          );
          console.info("[MonsterMutant] object hierarchy", metadata.objectNames);
        }

        setState({
          model: characterRoot,
          clips,
          loading: false,
          error: null,
          metadata,
        });
        modelRef.current = characterRoot;
      },
      undefined,
      (loadError) => {
        const message = loadError instanceof Error ? loadError.message : "Character load failed";
        console.warn("[MonsterMutant] character load failed", { assetPath, message });
        if (!mounted) return;
        setState({
          model: null,
          clips: [],
          loading: false,
          error: message,
          metadata: {
            ...EMPTY_METADATA,
            loadTimeMs: Math.round(performance.now() - startedAt),
          },
        });
      }
    );

    return () => {
      mounted = false;
      modelRef.current?.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        child.geometry.dispose();
        disposeMaterial(child.material);
      });
      modelRef.current = null;
    };
  }, [assetPath, debug, enabled, gl]);

  return state;
};
