import React from "react";
import { Sparkles } from "@react-three/drei";

interface DustParticlesProps {
  reducedMotion: boolean;
}

export const DustParticles: React.FC<DustParticlesProps> = ({ reducedMotion }) => {
  if (reducedMotion) return null;

  return (
    <>
      <Sparkles
        count={74}
        scale={[7.8, 2.6, 24]}
        position={[0, 1.55, -4.6]}
        size={0.14}
        speed={0.045}
        opacity={0.18}
        color="#fff0c2"
      />
      <Sparkles
        count={36}
        scale={[5.4, 1.9, 18]}
        position={[0, 1.1, -6.8]}
        size={0.22}
        speed={0.025}
        opacity={0.08}
        color="#b7f8ca"
      />
    </>
  );
};
