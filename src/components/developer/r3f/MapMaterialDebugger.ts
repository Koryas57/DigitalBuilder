import * as THREE from "three";
import type { MineTextureReport } from "./MapTextureResolver";

const INTERESTING_MESH_PATTERN = /(rock|stone|wall|ground|mine|beam|wood|debris|cliff|cave)/i;

const materialToDebug = (material: THREE.Material) => {
  const standardMaterial = material as THREE.MeshStandardMaterial;
  return {
    name: material.name || "unnamed-material",
    type: material.type,
    color: standardMaterial.color?.getStyle?.(),
    map: standardMaterial.map?.source?.data?.src || standardMaterial.map?.name || null,
    normalMap:
      standardMaterial.normalMap?.source?.data?.src || standardMaterial.normalMap?.name || null,
    roughnessMap:
      standardMaterial.roughnessMap?.source?.data?.src ||
      standardMaterial.roughnessMap?.name ||
      null,
    aoMap: standardMaterial.aoMap?.source?.data?.src || standardMaterial.aoMap?.name || null,
    roughness: standardMaterial.roughness,
    metalness: standardMaterial.metalness,
  };
};

export const debugMineMapMaterials = (
  map: THREE.Group,
  textureReports: MineTextureReport[]
) => {
  const meshNames: string[] = [];
  const interestingMeshes: string[] = [];
  const materialMap = new Map<string, THREE.Material>();

  map.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    const meshName = child.name || "unnamed-mesh";
    meshNames.push(meshName);
    if (INTERESTING_MESH_PATTERN.test(meshName)) interestingMeshes.push(meshName);

    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach((material) => {
      if (!material) return;
      materialMap.set(`${material.uuid}:${material.name}`, material);
    });
  });

  console.groupCollapsed("[Mine materials] debug");
  console.info("Mesh count", meshNames.length);
  console.info("Material count", materialMap.size);
  console.info("Materials", Array.from(materialMap.values()).map(materialToDebug));
  console.info("Texture reports", textureReports);
  console.info("Texture warnings", textureReports.filter((report) => report.missing.length));
  console.info("Interesting meshes", interestingMeshes.length ? interestingMeshes : "none");
  console.groupEnd();
};
