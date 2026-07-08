import React from "react";
import { DustParticles } from "./DustParticles";

interface MineAtmosphereProps {
  reducedMotion: boolean;
}

export const MineAtmosphere: React.FC<MineAtmosphereProps> = ({ reducedMotion }) => (
  <>
    <color attach="background" args={["#050604"]} />
    <fog attach="fog" args={["#050604", 4.8, 24]} />
    <DustParticles reducedMotion={reducedMotion} />
  </>
);
