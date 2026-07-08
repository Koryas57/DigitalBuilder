import React from "react";
import { ContactShadows, Environment, Grid, Sparkles } from "@react-three/drei";
import { CuboidCollider, RigidBody } from "@react-three/rapier";

export const WorldEnvironment: React.FC = () => {
  return (
    <>
      <color attach="background" args={["#020403"]} />
      <fog attach="fog" args={["#020403", 8, 28]} />
      <ambientLight intensity={0.28} />
      <directionalLight
        position={[4, 8, 5]}
        intensity={1.35}
        color="#fff7d9"
        castShadow
      />
      <pointLight position={[0, 2.4, 0]} intensity={4.2} color="#b7f8ca" />
      <pointLight position={[-6, 2.2, -5]} intensity={1.2} color="#b992ff" />
      <pointLight position={[6, 2.2, 5]} intensity={1.4} color="#e8cf91" />

      <Environment preset="night" />
      <Sparkles
        count={120}
        scale={[18, 5, 18]}
        size={1.35}
        speed={0.25}
        color="#b7f8ca"
      />

      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[14, 0.35, 14]} position={[0, -0.36, 0]} />
        <CuboidCollider args={[14, 2, 0.25]} position={[0, 1.2, -12]} />
        <CuboidCollider args={[14, 2, 0.25]} position={[0, 1.2, 12]} />
        <CuboidCollider args={[0.25, 2, 14]} position={[-12, 1.2, 0]} />
        <CuboidCollider args={[0.25, 2, 14]} position={[12, 1.2, 0]} />
      </RigidBody>

      <Grid
        position={[0, -0.02, 0]}
        args={[26, 26]}
        cellSize={0.75}
        cellThickness={0.45}
        cellColor="#b7f8ca"
        sectionSize={3}
        sectionThickness={1}
        sectionColor="#e8cf91"
        fadeDistance={24}
        fadeStrength={1.2}
        infiniteGrid={false}
      />
      <ContactShadows
        position={[0, 0.01, 0]}
        scale={18}
        opacity={0.24}
        blur={2.8}
        far={8}
      />

      <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[13.5, 96]} />
        <meshStandardMaterial
          color="#050806"
          metalness={0.25}
          roughness={0.35}
          emissive="#0b2b18"
          emissiveIntensity={0.2}
        />
      </mesh>

      <group position={[0, 1.1, 0]}>
        <mesh castShadow>
          <icosahedronGeometry args={[1.05, 2]} />
          <meshStandardMaterial
            color="#b7f8ca"
            emissive="#6df9a0"
            emissiveIntensity={1.2}
            metalness={0.4}
            roughness={0.18}
            wireframe
          />
        </mesh>
        <mesh rotation={[0.4, 0.7, 0]}>
          <torusGeometry args={[1.65, 0.018, 12, 96]} />
          <meshBasicMaterial color="#e8cf91" transparent opacity={0.82} />
        </mesh>
      </group>
    </>
  );
};
