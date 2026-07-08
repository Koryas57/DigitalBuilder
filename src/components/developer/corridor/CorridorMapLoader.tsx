import React, { useEffect, useMemo, useState } from "react";
import { useThree } from "@react-three/fiber";
import { Clone, Html, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import {
  buildEndCapColliders,
  getCorridorPrefabFootprint,
} from "./CorridorModuleColliders";
import {
  buildCorridorWallColliders,
  extractPrefabWallSegments,
  type CorridorBounds,
} from "./CorridorCollisionSystem";
import { WarpPortal } from "./WarpPortal";
import { WarpTriggerSystem } from "./WarpTriggerSystem";

export interface CorridorModule {
  id?: string;
  type?: "corridor" | "playerSpawn" | "warp" | "trigger" | "audioPoint" | "lightPoint";
  asset: "corridor";
  position: [number, number, number];
  rotation: number;
  scale?: [number, number, number];
  props?: Record<string, unknown>;
}

interface CorridorMapDocument {
  version: 1;
  gridSize: number;
  modules: CorridorModule[];
}

interface CorridorMapLoaderProps {
  onLoaded: (
    objects: CorridorModule[],
    collisionBounds: CorridorBounds[],
    renderStats: CorridorRenderStats
  ) => void;
  onPortalContactChange: (active: boolean) => void;
  playerPositionRef: React.MutableRefObject<THREE.Vector3>;
  materialOverrideEnabled: boolean;
  debugVisual: boolean;
}

export interface CorridorRenderStats {
  importedLights: number;
  lampBoosts: number;
  textures: number;
  maxAnisotropy: number;
}

export const CORRIDOR_PREFAB_PATH = "/assets/maps/corridor.glb";
export const CORRIDOR_MAP_PATH = "/assets/maps/corridor-loop/loop_v1.json";

const LoadingPanel: React.FC<{ label: string }> = ({ label }) => (
  <Html center>
    <div className="developer-r3f__loading-card">{label}</div>
  </Html>
);

const DEBUG_OVERRIDE_MATERIAL_PROPS = {
  color: "#d8f5df",
  roughness: 0.78,
  metalness: 0.02,
  emissive: "#172719",
  emissiveIntensity: 0.08,
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

  texture.anisotropy = maxAnisotropy;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
};

const isLampCandidate = (object: THREE.Object3D) => {
  const name = object.name.toLowerCase();
  return ["lamp", "light", "sconce", "bulb"].some((keyword) => name.includes(keyword));
};

const isLampMesh = (mesh: THREE.Mesh) => {
  if (isLampCandidate(mesh)) return true;
  return getMaterials(mesh.material).some((material) => {
    const name = material.name.toLowerCase();
    return ["lamp", "lampe", "light", "sconce", "bulb"].some((keyword) => name.includes(keyword));
  });
};

const isFloorMaterial = (material: THREE.Material) => {
  const name = material.name.toLowerCase();
  return name === "material" || name.includes("floor") || name.includes("sol");
};

const extractLampAnchors = (scene: THREE.Group) => {
  const anchors: THREE.Vector3[] = [];

  scene.updateMatrixWorld(true);
  scene.traverse((child) => {
    if (!(child instanceof THREE.Mesh) || !isLampMesh(child)) return;

    const box = new THREE.Box3().setFromObject(child);
    const center = new THREE.Vector3();
    box.getCenter(center);
    if (!Number.isFinite(center.x) || !Number.isFinite(center.y) || !Number.isFinite(center.z)) return;

    const duplicate = anchors.some((anchor) => anchor.distanceTo(center) < 0.25);
    if (!duplicate) anchors.push(center);
  });

  return anchors.slice(0, 4);
};

const prepareCorridorScene = (scene: THREE.Group, gl: THREE.WebGLRenderer): CorridorRenderStats => {
  const textures = new Set<THREE.Texture>();
  const maxAnisotropy = gl.capabilities.getMaxAnisotropy();
  let importedLights = 0;

  scene.traverse((child) => {
    if (child instanceof THREE.Light) {
      importedLights += 1;
      child.castShadow = true;
    }

    if (!(child instanceof THREE.Mesh)) return;
    child.castShadow = true;
    child.receiveShadow = true;
    child.frustumCulled = true;

    if (child.userData.originalMaterial) {
      child.material = child.userData.originalMaterial;
    }

    getMaterials(child.material).forEach((material) => {
      textureProps.forEach((property) => {
        const texture = material[property as keyof THREE.Material] as THREE.Texture | null | undefined;
        if (!(texture instanceof THREE.Texture)) return;
        optimizeTexture(texture, property, maxAnisotropy);
        textures.add(texture);
      });

      const standardMaterial = material as THREE.MeshStandardMaterial;

      if (standardMaterial.emissiveMap) {
        standardMaterial.emissiveIntensity = Math.max(
          standardMaterial.emissiveIntensity ?? 1,
          1.25
        );
      }

      if (typeof standardMaterial.envMapIntensity === "number") {
        standardMaterial.envMapIntensity = Math.max(standardMaterial.envMapIntensity, 0.85);
      }

      if (isFloorMaterial(material)) {
        standardMaterial.roughness = Math.min(standardMaterial.roughness ?? 0.5, 0.34);
        standardMaterial.metalness = Math.max(standardMaterial.metalness ?? 0, 0.06);
        standardMaterial.envMapIntensity = Math.max(standardMaterial.envMapIntensity ?? 1, 1.18);
        standardMaterial.needsUpdate = true;
      }
    });
  });

  return {
    importedLights,
    lampBoosts: 0,
    textures: textures.size,
    maxAnisotropy,
  };
};

const logMapBounds = (modules: CorridorModule[]) => {
  const box = new THREE.Box3();

  modules.forEach((module) => {
    const center = new THREE.Vector3(module.position[0], module.position[1], module.position[2]);
    box.expandByPoint(center.clone().add(new THREE.Vector3(-3.6, -1, -3.6)));
    box.expandByPoint(center.clone().add(new THREE.Vector3(3.6, 2.8, 3.6)));
  });

  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);

  console.info("[Corridor map] global bounds", {
    min: box.min.toArray().map((value) => Number(value.toFixed(3))),
    max: box.max.toArray().map((value) => Number(value.toFixed(3))),
    size: size.toArray().map((value) => Number(value.toFixed(3))),
    center: center.toArray().map((value) => Number(value.toFixed(3))),
  });
};

const getPortalPosition = (modules: CorridorModule[]) => {
  const warp = modules.find((module) => module.type === "warp");
  if (warp) return new THREE.Vector3(...warp.position).setY(1.2);

  const corridorModules = modules.filter((module) => (module.type ?? "corridor") === "corridor");
  const last = corridorModules[corridorModules.length - 1];
  if (!last) return new THREE.Vector3(0, 1.2, -5);

  const angle = (last.rotation * Math.PI) / 180;
  const forward = new THREE.Vector3(-Math.sin(angle), 0, -Math.cos(angle));
  return new THREE.Vector3(...last.position).add(forward.multiplyScalar(3.15)).setY(1.2);
};

const migrateModule = (module: CorridorModule, index: number): CorridorModule => ({
  id: module.id ?? `corridor-object-${index}`,
  type: module.type ?? "corridor",
  asset: module.asset ?? "corridor",
  position: module.position,
  rotation: module.rotation ?? 0,
  scale: module.scale ?? [1, 1, 1],
  props: module.props ?? {},
});

export const CorridorMapLoader: React.FC<CorridorMapLoaderProps> = ({
  onLoaded,
  onPortalContactChange,
  playerPositionRef,
  materialOverrideEnabled,
  debugVisual,
}) => {
  const { gl } = useThree();
  const gltf = useGLTF(CORRIDOR_PREFAB_PATH);
  const [modules, setModules] = useState<CorridorModule[]>([]);
  const [error, setError] = useState<string | null>(null);

  const scene = useMemo(() => gltf.scene, [gltf.scene]);
  const renderStats = useMemo(() => prepareCorridorScene(scene, gl), [gl, scene]);
  const prefabWallSegments = useMemo(() => extractPrefabWallSegments(scene), [scene]);
  const prefabFootprint = useMemo(() => getCorridorPrefabFootprint(scene), [scene]);
  const lampAnchors = useMemo(() => extractLampAnchors(scene), [scene]);
  const portalPosition = useMemo(() => getPortalPosition(modules), [modules]);

  useEffect(() => {
    let mounted = true;

    fetch(CORRIDOR_MAP_PATH)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json() as Promise<CorridorMapDocument>;
      })
      .then((document) => {
        if (!mounted) return;
        const corridorModules = Array.isArray(document.modules)
          ? document.modules.map(migrateModule).filter((module) => module.asset === "corridor")
          : [];
        const collisionBounds = buildCorridorWallColliders(
          corridorModules.filter((module) => (module.type ?? "corridor") === "corridor"),
          prefabWallSegments
        ).concat(
          buildEndCapColliders(
            corridorModules.filter((module) => (module.type ?? "corridor") === "corridor"),
            prefabFootprint
          )
        );
        setModules(corridorModules);
        onLoaded(corridorModules, collisionBounds, {
          ...renderStats,
          lampBoosts: lampAnchors.length * corridorModules.length,
        });
        console.info("[Corridor map] loaded", {
          path: CORRIDOR_MAP_PATH,
          modules: corridorModules.length,
          gridSize: document.gridSize,
          collisionBounds: collisionBounds.length,
          textureCount: renderStats.textures,
          importedLights: renderStats.importedLights,
          lampBoosts: lampAnchors.length * corridorModules.length,
        });
        corridorModules.forEach((module, index) => {
          console.info("[Corridor map] module", {
            index,
            id: module.id,
            type: module.type,
            asset: module.asset,
            appliedPosition: module.position,
            appliedRotation: module.rotation,
            scale: module.scale,
            props: module.props,
          });
        });
        logMapBounds(corridorModules);
      })
      .catch((loadError) => {
        console.error("[Corridor map] load failed", loadError);
        if (mounted) setError("Impossible de charger loop_v1.json");
      });

    return () => {
      mounted = false;
    };
  }, [lampAnchors.length, onLoaded, prefabFootprint, prefabWallSegments, renderStats]);

  if (error) return <LoadingPanel label={error} />;
  if (!modules.length) return <LoadingPanel label="Chargement loop_v1.json" />;

  return (
    <group>
      {modules.map((module, index) => {
        const type = module.type ?? "corridor";

        if (type !== "corridor") return null;

        return (
          <group
            position={module.position}
            rotation={[0, (module.rotation * Math.PI) / 180, 0]}
            scale={module.scale ?? [1, 1, 1]}
            key={`${module.asset}-${module.id ?? index}`}
          >
            <Clone
              object={scene}
              inject={
                materialOverrideEnabled ? (
                  <meshStandardMaterial {...DEBUG_OVERRIDE_MATERIAL_PROPS} />
                ) : undefined
              }
            />
            {!materialOverrideEnabled && lampAnchors.map((anchor, lampIndex) => (
              <pointLight
                position={anchor.toArray()}
                intensity={0.78}
                distance={4.6}
                decay={2}
                color="#ffe6b0"
                key={`lamp-boost-${lampIndex}`}
                castShadow={false}
              />
            ))}
          </group>
        );
      })}
      <WarpPortal position={portalPosition} />
      <WarpTriggerSystem
        position={portalPosition}
        playerPositionRef={playerPositionRef}
        onPortalContactChange={onPortalContactChange}
      />
      {debugVisual && modules.map((module, index) => (
        <Html
          position={[module.position[0], module.position[1] + 2.4, module.position[2]]}
          center
          key={`label-${index}`}
        >
          <div className="developer-r3f-debug-label">module {index}</div>
        </Html>
      ))}
    </group>
  );
};

useGLTF.preload(CORRIDOR_PREFAB_PATH);
