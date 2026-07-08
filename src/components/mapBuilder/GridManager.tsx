import React from "react";
import { Grid } from "@react-three/drei";

interface GridManagerProps {
  gridSize: number;
}

export const GridManager: React.FC<GridManagerProps> = ({ gridSize }) => (
  <>
    <Grid
      args={[160, 160]}
      cellSize={1}
      cellThickness={0.85}
      cellColor="#2d3a32"
      sectionSize={5}
      sectionThickness={1.15}
      sectionColor="#b7f8ca"
      fadeDistance={180}
      fadeStrength={1.35}
      infiniteGrid
      position={[0, -0.02, 0]}
    />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]}>
      <ringGeometry args={[Math.max(gridSize, 0.05), Math.max(gridSize, 0.05) + 0.01, 32]} />
      <meshBasicMaterial color="#e8cf91" transparent opacity={0.35} depthWrite={false} />
    </mesh>
    <axesHelper args={[4]} />
  </>
);
