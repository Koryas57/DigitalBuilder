import React from "react";
import { Sparkles } from "@react-three/drei";
import type { LightingPreset } from "./HorrorLighting";

interface HorrorAtmosphereProps {
  preset: LightingPreset;
  reducedMotion: boolean;
}

export const HorrorAtmosphere: React.FC<HorrorAtmosphereProps> = ({ preset, reducedMotion }) => (
  <>
    <color attach="background" args={[preset === "debug" ? "#111210" : "#030606"]} />
    <fog
      attach="fog"
      args={preset === "debug" ? ["#111210", 12, 42] : ["#030606", 4.5, 18]}
    />
    {!reducedMotion && preset === "horror" && (
      <Sparkles
        count={34}
        scale={[9, 2.8, 9]}
        position={[0, 1.8, -0.7]}
        size={0.18}
        speed={0.08}
        opacity={0.18}
        color="#b7f8ca"
      />
    )}
  </>
);
