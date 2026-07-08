import React, { useEffect, useMemo, useState } from "react";
import { Html } from "@react-three/drei";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import * as THREE from "three";
import { debugMineMapMaterials } from "./MapMaterialDebugger";
import { applyMineTexturesToMaterial, createMineLoadingManager, getMineAssetRoot } from "./MapTextureResolver";
import {
  ACTIVE_MAP_PATH,
  DEBUG_MAP,
  getActiveMineAssets,
  MAP_QUALITY,
  type MineAssetPlacement,
} from "./MineConfig";

const LoadingPanel: React.FC<{ label: string }> = ({ label }) => (
  <Html center>
    <div
      style={{
        minWidth: 230,
        padding: "1rem 1.15rem",
        border: "1px solid rgba(183, 248, 202, 0.35)",
        borderRadius: 16,
        background: "rgba(2, 4, 3, 0.82)",
        color: "#fffaf0",
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: "0.78rem",
        letterSpacing: "0.08em",
        textAlign: "center",
        textTransform: "uppercase",
      }}
    >
      {label}
    </div>
  </Html>
);

const toStandardMaterial = (material: THREE.Material) => {
  if (material instanceof THREE.MeshStandardMaterial) return material.clone();

  const source = material as THREE.MeshPhongMaterial;
  const standardMaterial = new THREE.MeshStandardMaterial({
    name: material.name,
    color: source.color instanceof THREE.Color ? source.color : new THREE.Color("#5f5b51"),
    map: source.map ?? null,
    normalMap: source.normalMap ?? null,
    transparent: material.transparent,
    opacity: material.opacity,
    roughness: 0.92,
    metalness: 0.02,
  });

  return standardMaterial;
};

const inspectMineMap = (map: THREE.Group, placements: MineAssetPlacement[]) => {
  const box = new THREE.Box3().setFromObject(map);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);

  const meshes: string[] = [];
  const materials = new Set<string>();

  map.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    meshes.push(child.name || "unnamed-mesh");
    const childMaterials = Array.isArray(child.material) ? child.material : [child.material];
    childMaterials.forEach((material) => materials.add(material?.name || "unnamed-material"));
  });

  console.groupCollapsed("[Mine FBX] loaded");
  console.info("Active map path", ACTIVE_MAP_PATH);
  console.info("Map quality", MAP_QUALITY);
  console.info("Loaded assets", placements.map((placement) => placement.path));
  console.info("Bounds", {
    min: box.min.toArray().map((value) => Number(value.toFixed(3))),
    max: box.max.toArray().map((value) => Number(value.toFixed(3))),
    size: size.toArray().map((value) => Number(value.toFixed(3))),
    center: center.toArray().map((value) => Number(value.toFixed(3))),
  });
  console.info("Meshes", meshes);
  console.info("Materials", Array.from(materials));
  console.groupEnd();
};

const prepareMineAsset = (
  loadedAsset: THREE.Group,
  placement: MineAssetPlacement,
  textureLoader: THREE.TextureLoader
) => {
  const textureReports: ReturnType<typeof applyMineTexturesToMaterial>[] = [];
  const processedMaterials = new Set<string>();

  loadedAsset.position.set(...placement.position);
  loadedAsset.rotation.set(...placement.rotation);
  loadedAsset.scale.set(...placement.scale);

  loadedAsset.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;

    child.castShadow = true;
    child.receiveShadow = true;
    child.frustumCulled = true;

    if (child.geometry) {
      child.geometry.computeVertexNormals();
      child.geometry.computeBoundingBox();
    }

    const applyMaterial = (material: THREE.Material) => {
      const standardMaterial = toStandardMaterial(material);
      const materialKey = `${placement.id}:${material.uuid}:${material.name}`;

      if (!processedMaterials.has(materialKey)) {
        textureReports.push(applyMineTexturesToMaterial(standardMaterial, placement.id, textureLoader));
        processedMaterials.add(materialKey);
      }

      standardMaterial.needsUpdate = true;
      return standardMaterial;
    };

    if (Array.isArray(child.material)) {
      child.material = child.material.map(applyMaterial);
      return;
    }

    if (child.material) child.material = applyMaterial(child.material);
  });

  return textureReports;
};

const MineBaseGeometry: React.FC = () => (
  <group>
    <mesh position={[0, -0.08, -4.2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[9.2, 27, 32, 96]} />
      <meshStandardMaterial
        color="#15120d"
        roughness={0.96}
        metalness={0.02}
        envMapIntensity={0.1}
      />
    </mesh>

    {[-4.2, 4.2].map((x) => (
      <mesh position={[x, 1.58, -4.2]} rotation={[0, 0, 0]} receiveShadow key={x}>
        <boxGeometry args={[0.42, 3.4, 27]} />
        <meshStandardMaterial color="#0b0b08" roughness={0.98} metalness={0.01} />
      </mesh>
    ))}

    {[-12, -7.8, -3.6, 0.6, 4.8].map((z) => (
      <group position={[0, 0, z]} key={z}>
        <mesh position={[-3.25, 1.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.18, 2.8, 0.18]} />
          <meshStandardMaterial color="#2b2016" roughness={0.86} />
        </mesh>
        <mesh position={[3.25, 1.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.18, 2.8, 0.18]} />
          <meshStandardMaterial color="#2b2016" roughness={0.86} />
        </mesh>
        <mesh position={[0, 2.72, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
          <boxGeometry args={[0.18, 6.7, 0.2]} />
          <meshStandardMaterial color="#2b2016" roughness={0.86} />
        </mesh>
      </group>
    ))}
  </group>
);

export const MineMapLoader: React.FC = () => {
  const [map, setMap] = useState<THREE.Group | null>(null);
  const [error, setError] = useState<string | null>(null);
  const placements = useMemo(() => getActiveMineAssets(), []);

  useEffect(() => {
    let mounted = true;
    const manager = createMineLoadingManager();
    const textureLoader = new THREE.TextureLoader(manager);

    const loadAsset = (placement: MineAssetPlacement) =>
      new Promise<{ asset: THREE.Group; reports: ReturnType<typeof applyMineTexturesToMaterial>[] }>((resolve, reject) => {
        const loader = new FBXLoader(manager);
        loader.setResourcePath(`${getMineAssetRoot(placement.id)}/`);
        loader.load(
          placement.path,
          (loadedAsset) => {
            const reports = prepareMineAsset(loadedAsset, placement, textureLoader);
            resolve({ asset: loadedAsset, reports });
          },
          undefined,
          reject
        );
      });

    Promise.all(placements.map(loadAsset))
      .then((loadedAssets) => {
        if (!mounted) return;

        const root = new THREE.Group();
        root.name = "DeveloperMineRoot";
        const textureReports = loadedAssets.flatMap(({ asset, reports }) => {
          root.add(asset);
          return reports;
        });

        if (DEBUG_MAP) {
          inspectMineMap(root, placements);
          debugMineMapMaterials(root, textureReports);
        }

        setMap(root);
      })
      .catch((loadError) => {
        console.error("[Mine FBX] load failed", loadError);
        if (mounted) setError("Impossible de charger la mine");
      });

    return () => {
      mounted = false;
    };
  }, [placements]);

  if (error) return <LoadingPanel label={error} />;
  if (!map) return <LoadingPanel label="Chargement de la mine" />;

  return (
    <>
      <MineBaseGeometry />
      <primitive object={map} />
    </>
  );
};
