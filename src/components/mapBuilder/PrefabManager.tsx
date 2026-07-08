import React, { useMemo } from "react";
import { Clone, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { PrefabAsset, PrefabDefinition } from "./types";

export const PREFABS: Record<PrefabAsset, PrefabDefinition> = {
  corridor: {
    id: "corridor",
    name: "Corridor",
    path: "/assets/maps/corridor.glb",
  },
};

interface PrefabInstanceProps {
  asset: PrefabAsset;
  selected: boolean;
}

const SelectedOutline: React.FC = () => (
  <group>
    <mesh position={[0, 1.5, 0]}>
      <boxGeometry args={[5.9, 3.2, 5.9]} />
      <meshBasicMaterial color="#b7f8ca" wireframe transparent opacity={0.82} depthTest={false} />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
      <ringGeometry args={[3.05, 3.18, 96]} />
      <meshBasicMaterial color="#b7f8ca" transparent opacity={0.35} depthWrite={false} />
    </mesh>
  </group>
);

export const PrefabInstance: React.FC<PrefabInstanceProps> = ({ asset, selected }) => {
  const prefab = PREFABS[asset];
  const gltf = useGLTF(prefab.path);

  const preparedScene = useMemo(() => {
    gltf.scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      child.castShadow = true;
      child.receiveShadow = true;
      child.frustumCulled = true;
    });

    return gltf.scene;
  }, [gltf.scene]);

  return (
    <>
      <Clone object={preparedScene} />
      {selected && <SelectedOutline />}
    </>
  );
};

useGLTF.preload(PREFABS.corridor.path);
