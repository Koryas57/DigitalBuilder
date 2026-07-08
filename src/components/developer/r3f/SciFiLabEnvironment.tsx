import React from "react";
import { ContactShadows, Environment, Grid, Sparkles } from "@react-three/drei";
import { CuboidCollider, RigidBody } from "@react-three/rapier";

const wallMaterial = {
  color: "#07100c",
  emissive: "#082013",
  emissiveIntensity: 0.22,
  metalness: 0.55,
  roughness: 0.32,
};

export const SciFiLabEnvironment: React.FC = () => {
  const columns = [
    [-9.5, -7.5],
    [9.5, -7.5],
    [-9.5, 7.5],
    [9.5, 7.5],
    [-3.8, -9.5],
    [3.8, -9.5],
    [-3.8, 9.5],
    [3.8, 9.5],
  ];

  return (
    <>
      <color attach="background" args={["#020403"]} />
      <fog attach="fog" args={["#020403", 9, 34]} />
      <ambientLight intensity={0.22} />
      <hemisphereLight args={["#d9ffe3", "#050806", 0.62]} />
      <directionalLight
        position={[4, 10, 5]}
        intensity={1.4}
        color="#fff7d9"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[0, 3.5, 0]} intensity={5.2} color="#b7f8ca" />
      <pointLight position={[-7, 3, -8]} intensity={1.7} color="#b992ff" />
      <pointLight position={[7, 3, 8]} intensity={2.1} color="#e8cf91" />

      <Environment preset="night" />
      <Sparkles
        count={170}
        scale={[24, 7, 24]}
        size={1.08}
        speed={0.18}
        color="#b7f8ca"
      />

      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[16, 0.35, 16]} position={[0, -0.36, 0]} />
        <CuboidCollider args={[16, 2.6, 0.32]} position={[0, 1.7, -14]} />
        <CuboidCollider args={[16, 2.6, 0.32]} position={[0, 1.7, 14]} />
        <CuboidCollider args={[0.32, 2.6, 16]} position={[-14, 1.7, 0]} />
        <CuboidCollider args={[0.32, 2.6, 16]} position={[14, 1.7, 0]} />
      </RigidBody>

      <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30, 1, 1]} />
        <meshStandardMaterial
          color="#030604"
          metalness={0.48}
          roughness={0.2}
          emissive="#07170e"
          emissiveIntensity={0.28}
        />
      </mesh>

      <Grid
        position={[0, 0.012, 0]}
        args={[30, 30]}
        cellSize={0.75}
        cellThickness={0.35}
        cellColor="#2f6f4a"
        sectionSize={3}
        sectionThickness={1.1}
        sectionColor="#e8cf91"
        fadeDistance={25}
        fadeStrength={1.2}
        infiniteGrid={false}
      />

      <group>
        {[-14, 14].map((z) => (
          <mesh position={[0, 1.45, z]} key={`wall-z-${z}`} receiveShadow>
            <boxGeometry args={[28, 2.9, 0.24]} />
            <meshStandardMaterial {...wallMaterial} />
          </mesh>
        ))}
        {[-14, 14].map((x) => (
          <mesh position={[x, 1.45, 0]} key={`wall-x-${x}`} receiveShadow>
            <boxGeometry args={[0.24, 2.9, 28]} />
            <meshStandardMaterial {...wallMaterial} />
          </mesh>
        ))}
      </group>

      <group>
        {columns.map(([x, z], index) => (
          <group position={[x, 1.25, z]} key={`${x}-${z}-${index}`}>
            <mesh castShadow receiveShadow>
              <cylinderGeometry args={[0.28, 0.38, 2.5, 8]} />
              <meshStandardMaterial
                color="#07100c"
                emissive="#12391f"
                emissiveIntensity={0.34}
                metalness={0.6}
                roughness={0.25}
              />
            </mesh>
            <mesh position={[0, 0.25, 0]}>
              <cylinderGeometry args={[0.43, 0.43, 0.02, 32]} />
              <meshBasicMaterial color="#b7f8ca" transparent opacity={0.52} />
            </mesh>
          </group>
        ))}
      </group>

      <group>
        {[-8, -4, 4, 8].map((x) => (
          <mesh position={[x, 0.035, 0]} rotation={[-Math.PI / 2, 0, 0]} key={x}>
            <planeGeometry args={[0.035, 22]} />
            <meshBasicMaterial color="#b7f8ca" transparent opacity={0.52} />
          </mesh>
        ))}
        {[-8, -4, 4, 8].map((z) => (
          <mesh position={[0, 0.036, z]} rotation={[-Math.PI / 2, 0, Math.PI / 2]} key={z}>
            <planeGeometry args={[0.035, 22]} />
            <meshBasicMaterial color="#e8cf91" transparent opacity={0.34} />
          </mesh>
        ))}
      </group>

      <group position={[0, 1.25, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[1.1, 1.35, 0.32, 64]} />
          <meshStandardMaterial
            color="#050806"
            emissive="#0c2d19"
            emissiveIntensity={0.42}
            metalness={0.62}
            roughness={0.18}
          />
        </mesh>
        <mesh position={[0, 0.72, 0]}>
          <icosahedronGeometry args={[0.8, 2]} />
          <meshStandardMaterial
            color="#b7f8ca"
            emissive="#6df9a0"
            emissiveIntensity={1.45}
            metalness={0.4}
            roughness={0.16}
            wireframe
          />
        </mesh>
        <mesh rotation={[0.4, 0.7, 0]} position={[0, 0.72, 0]}>
          <torusGeometry args={[1.38, 0.018, 12, 96]} />
          <meshBasicMaterial color="#e8cf91" transparent opacity={0.78} />
        </mesh>
      </group>

      <ContactShadows
        position={[0, 0.02, 0]}
        scale={22}
        opacity={0.3}
        blur={3.2}
        far={9}
      />
    </>
  );
};
