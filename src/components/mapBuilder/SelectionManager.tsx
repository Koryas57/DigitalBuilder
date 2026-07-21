import React from "react";
import type { ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { MonsterSpawnPoint } from "../corridor/entities/MonsterSpawnPoint";
import { PrefabInstance } from "./PrefabManager";
import { useMapBuilderStore } from "./mapBuilderStore";
import type { MapModule } from "./types";

interface SelectableModuleProps {
  module: MapModule;
}

export const SelectableModule: React.FC<SelectableModuleProps> = ({ module }) => {
  const selectedId = useMapBuilderStore((state) => state.selectedId);
  const selectModule = useMapBuilderStore((state) => state.selectModule);
  const selected = selectedId === module.id;

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    selectModule(module.id);
  };

  return (
    <group
      position={module.position}
      rotation={[0, (module.rotation * Math.PI) / 180, 0]}
      onPointerDown={handlePointerDown}
    >
      {module.type === "corridor" ? (
        <PrefabInstance asset={module.asset} selected={selected} />
      ) : module.type === "monsterSpawn" ? (
        <MonsterSpawnPoint selected={selected} />
      ) : (
        <group>
          <mesh position={[0, 0.55, 0]}>
            {module.type === "playerSpawn" && <coneGeometry args={[0.38, 0.92, 24]} />}
            {module.type === "warp" && <torusGeometry args={[0.62, 0.055, 12, 64]} />}
            {module.type === "trigger" && <boxGeometry args={[0.82, 0.82, 0.82]} />}
            {module.type === "audioPoint" && <sphereGeometry args={[0.42, 24, 16]} />}
            {module.type === "lightPoint" && <octahedronGeometry args={[0.48]} />}
            <meshBasicMaterial
              color={
                module.type === "playerSpawn"
                  ? "#fff0c2"
                  : module.type === "warp"
                    ? "#161016"
                    : module.type === "trigger"
                      ? "#b992ff"
                      : module.type === "audioPoint"
                        ? "#9eefff"
                        : "#b8ffbd"
              }
              wireframe={module.type !== "lightPoint"}
              transparent
              opacity={selected ? 0.95 : 0.7}
            />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.035, 0]}>
            <ringGeometry args={[0.55, 0.72, 48]} />
            <meshBasicMaterial color={selected ? "#b7f8ca" : "#fffaf0"} transparent opacity={0.42} />
          </mesh>
          <Html position={[0, 1.38, 0]} center>
            <div className="map-builder-object-label">{module.type}</div>
          </Html>
        </group>
      )}
    </group>
  );
};

export const SelectionManager: React.FC = () => {
  const modules = useMapBuilderStore((state) => state.modules);
  const selectModule = useMapBuilderStore((state) => state.selectModule);

  return (
    <group onPointerMissed={() => selectModule(null)}>
      {modules.map((module) => (
        <SelectableModule module={module} key={module.id} />
      ))}
    </group>
  );
};
