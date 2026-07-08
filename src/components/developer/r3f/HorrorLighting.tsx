import React from "react";
import { Environment } from "@react-three/drei";
import { LightFlickerSystem } from "./LightFlickerSystem";

export type LightingPreset = "debug" | "horror";

interface HorrorLightingProps {
  preset: LightingPreset;
  reducedMotion: boolean;
}

const DebugLighting: React.FC = () => (
  <>
    <ambientLight intensity={0.48} color="#f4f1e8" />
    <hemisphereLight args={["#f4f7ff", "#c8bca8", 0.58]} />
    <directionalLight
      position={[-4.5, 7.5, 4.5]}
      intensity={2.15}
      color="#fff7e8"
      castShadow
      shadow-mapSize-width={2048}
      shadow-mapSize-height={2048}
      shadow-camera-near={0.4}
      shadow-camera-far={38}
      shadow-camera-left={-12}
      shadow-camera-right={12}
      shadow-camera-top={12}
      shadow-camera-bottom={-12}
    />
    <pointLight position={[0, 2.35, 0]} color="#fff0c2" intensity={0.72} distance={9} />
    <pointLight position={[3.4, 2.1, -3.2]} color="#cfe6ff" intensity={0.58} distance={8} />
    <Environment preset="apartment" />
  </>
);

const FinalHorrorLighting: React.FC<{ reducedMotion: boolean }> = ({ reducedMotion }) => (
  <>
    <ambientLight intensity={0.23} color="#8ea6b8" />
    <hemisphereLight args={["#b8cfff", "#080806", 0.38]} />
    <directionalLight
      position={[-4.5, 6.8, 3.4]}
      intensity={1.55}
      color="#dbe8ff"
      castShadow
      shadow-mapSize-width={2048}
      shadow-mapSize-height={2048}
      shadow-camera-near={0.4}
      shadow-camera-far={32}
      shadow-camera-left={-10}
      shadow-camera-right={10}
      shadow-camera-top={10}
      shadow-camera-bottom={-10}
    />
    <pointLight position={[0.4, 2.1, -3.5]} color="#fff0c2" intensity={0.72} distance={7} />
    <pointLight position={[-3.2, 1.8, 1.8]} color="#b7f8ca" intensity={0.28} distance={5} />
    <LightFlickerSystem reducedMotion={reducedMotion} />
    <Environment preset="night" />
  </>
);

export const HorrorLighting: React.FC<HorrorLightingProps> = ({ preset, reducedMotion }) =>
  preset === "debug" ? <DebugLighting /> : <FinalHorrorLighting reducedMotion={reducedMotion} />;
