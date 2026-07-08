import React from "react";
import { Environment } from "@react-three/drei";
import { FlickerLight } from "./FlickerLight";

export type LightingPreset = "debug" | "mine";

interface MineLightingProps {
  preset: LightingPreset;
  reducedMotion: boolean;
}

const DebugLighting: React.FC = () => (
  <>
    <ambientLight intensity={0.42} color="#dce8d9" />
    <hemisphereLight args={["#dce8ff", "#171008", 0.48]} />
    <directionalLight
      position={[-3.5, 6.2, 5.5]}
      intensity={1.55}
      color="#fff8e5"
      castShadow
      shadow-mapSize-width={2048}
      shadow-mapSize-height={2048}
      shadow-camera-near={0.4}
      shadow-camera-far={34}
      shadow-camera-left={-10}
      shadow-camera-right={10}
      shadow-camera-top={10}
      shadow-camera-bottom={-10}
    />
    <pointLight position={[0, 2.25, 5.9]} color="#fff0c2" intensity={0.72} distance={9} />
    <Environment preset="night" />
  </>
);

const CinematicMineLighting: React.FC<{ reducedMotion: boolean }> = ({ reducedMotion }) => (
  <>
    <ambientLight intensity={0.16} color="#718170" />
    <hemisphereLight args={["#647c86", "#070503", 0.22]} />
    <directionalLight
      position={[-2.8, 4.2, 8.5]}
      intensity={0.88}
      color="#cce2ff"
      castShadow
      shadow-mapSize-width={2048}
      shadow-mapSize-height={2048}
      shadow-camera-near={0.4}
      shadow-camera-far={36}
      shadow-camera-left={-9}
      shadow-camera-right={9}
      shadow-camera-top={8}
      shadow-camera-bottom={-12}
    />
    <FlickerLight position={[-2.7, 2.1, 1.2]} color="#fff0c2" intensity={0.68} distance={7} reducedMotion={reducedMotion} />
    <FlickerLight position={[2.2, 1.9, -5.4]} color="#e8cf91" intensity={0.45} distance={5.5} reducedMotion={reducedMotion} />
    <pointLight position={[0, 1.35, -9.2]} color="#b7f8ca" intensity={0.22} distance={6.2} />
    <Environment preset="night" />
  </>
);

export const MineLighting: React.FC<MineLightingProps> = ({ preset, reducedMotion }) =>
  preset === "debug" ? <DebugLighting /> : <CinematicMineLighting reducedMotion={reducedMotion} />;
