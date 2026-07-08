import React, { Suspense, useEffect, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { stationPositions, type DeveloperStationData } from "../../../data/developerPath";
import { CameraBounds } from "./CameraBounds";
import { mineSequences, type CameraSequence } from "./CameraSequence";
import { CinematicCameraController } from "./CinematicCameraController";
import { ExplorationDebugPanel } from "./ExplorationDebugPanel";
import { ManualMineBounds } from "./ManualMineBounds";
import { MineAnomaly } from "./MineAnomaly";
import { MineAtmosphere } from "./MineAtmosphere";
import { MineLighting, type LightingPreset } from "./MineLighting";
import { MineMapLoader } from "./MineMapLoader";
import { SequenceTrigger } from "./SequenceTrigger";

interface DeveloperWorldProps {
  stations: DeveloperStationData[];
  nearStationId: string | null;
  activeStationId: string | null;
  movementInput: { x: number; z: number };
  lookInput: { x: number; y: number };
  activePanelOpen: boolean;
  reducedMotion: boolean;
  onNearStationChange: (stationId: string | null) => void;
  onOpenStation: (stationId: string) => void;
  onSequenceTextChange: (text: string | null) => void;
}

const WorldLoader: React.FC = () => (
  <Html center>
    <div
      style={{
        minWidth: 220,
        padding: "1rem 1.2rem",
        border: "1px solid rgba(183, 248, 202, 0.38)",
        borderRadius: 18,
        background: "rgba(2, 4, 3, 0.78)",
        color: "#fffaf0",
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: "0.82rem",
        letterSpacing: "0.08em",
        textAlign: "center",
        textTransform: "uppercase",
        boxShadow: "0 0 32px rgba(183, 248, 202, 0.2)",
      }}
    >
      Chargement de la mine
    </div>
  </Html>
);

const RendererSettings: React.FC<{ lightingPreset: LightingPreset }> = ({ lightingPreset }) => {
  const { gl } = useThree();

  useEffect(() => {
    gl.outputColorSpace = THREE.SRGBColorSpace;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = lightingPreset === "debug" ? 0.9 : 0.72;
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
  }, [gl, lightingPreset]);

  return null;
};

const DeveloperWorld: React.FC<DeveloperWorldProps> = ({
  movementInput,
  lookInput,
  activePanelOpen,
  reducedMotion,
  onNearStationChange,
  onOpenStation,
  onSequenceTextChange,
}) => {
  const [activeSequence, setActiveSequence] = useState<CameraSequence | null>(null);
  const [lightingPreset, setLightingPreset] = useState<LightingPreset>("mine");
  const [debugPanelVisible, setDebugPanelVisible] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key === "l") setLightingPreset((current) => (current === "debug" ? "mine" : "debug"));
      if (key === "h") setDebugPanelVisible((current) => !current);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <Canvas
      className="developer-r3f-canvas"
      shadows
      dpr={[1, 1.55]}
      camera={{ position: [0, 1.65, 7.2], fov: 50, near: 0.05, far: 42 }}
      gl={{
        antialias: true,
        powerPreference: "high-performance",
        alpha: false,
      }}
      onCreated={({ gl }) => {
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 0.72;
        gl.shadowMap.enabled = true;
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
      }}
    >
      <Suspense fallback={<WorldLoader />}>
        <RendererSettings lightingPreset={lightingPreset} />
        <MineAtmosphere reducedMotion={reducedMotion} />
        <MineLighting preset={lightingPreset} reducedMotion={reducedMotion} />
        <MineMapLoader />
        <CameraBounds />
        <ManualMineBounds />
        <ExplorationDebugPanel visible={debugPanelVisible} lightingPreset={lightingPreset} />

        {stationPositions.map((placement) => (
          <MineAnomaly placement={placement} onOpen={onOpenStation} key={placement.id} />
        ))}

        <CinematicCameraController
          stationPlacements={stationPositions}
          movementInput={movementInput}
          lookInput={lookInput}
          activeSequence={activeSequence}
          activePanelOpen={activePanelOpen}
          reducedMotion={reducedMotion}
          onNearStationChange={onNearStationChange}
          onSequenceTextChange={onSequenceTextChange}
          onSequenceComplete={() => setActiveSequence(null)}
        />

        {mineSequences.map((sequence) => {
          const placement = stationPositions.find((station) => station.id === sequence.id);
          if (!placement) return null;

          return (
            <SequenceTrigger
              sequence={sequence}
              position={placement.position}
              radius={placement.radius + 0.35}
              disabled={Boolean(activeSequence) || activePanelOpen}
              onTrigger={setActiveSequence}
              key={sequence.id}
            />
          );
        })}
      </Suspense>
    </Canvas>
  );
};

export default DeveloperWorld;
