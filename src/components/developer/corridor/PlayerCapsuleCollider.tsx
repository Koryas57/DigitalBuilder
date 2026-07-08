import React from "react";
import * as THREE from "three";
import { DEBUG_COLLISIONS, PLAYER_HEIGHT } from "./CorridorSpawn";

interface PlayerCapsuleColliderProps {
  playerPositionRef: React.MutableRefObject<THREE.Vector3>;
  visible: boolean;
}

export const PlayerCapsuleCollider: React.FC<PlayerCapsuleColliderProps> = ({
  playerPositionRef,
  visible,
}) => {
  const groupRef = React.useRef<THREE.Group | null>(null);

  React.useEffect(() => {
    const interval = window.setInterval(() => {
      if (!groupRef.current) return;
      groupRef.current.position.copy(playerPositionRef.current);
    }, 50);

    return () => window.clearInterval(interval);
  }, [playerPositionRef]);

  if (!DEBUG_COLLISIONS || !visible) return null;

  return (
    <group ref={groupRef} position={playerPositionRef.current.toArray()}>
      <mesh position={[0, -PLAYER_HEIGHT * 0.5, 0]}>
        <capsuleGeometry args={[0.28, 1.1, 6, 12]} />
        <meshBasicMaterial color="#fff0c2" transparent opacity={0.24} wireframe />
      </mesh>
    </group>
  );
};
