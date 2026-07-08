import React, { Suspense, useEffect, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { GridManager } from "./GridManager";
import { SelectionManager } from "./SelectionManager";
import { TransformManager } from "./TransformManager";
import { MODULE_STEP, useMapBuilderStore } from "./mapBuilderStore";

const SceneLoader: React.FC = () => (
  <Html center>
    <div className="map-builder-loader">Chargement de corridor.glb</div>
  </Html>
);

const CameraAddBridge: React.FC = () => {
  const { camera } = useThree();
  const addRequest = useMapBuilderStore((state) => state.addRequest);
  const addModule = useMapBuilderStore((state) => state.addModule);
  const pendingAddType = useMapBuilderStore((state) => state.pendingAddType);
  const gridSize = useMapBuilderStore((state) => state.gridSize);
  const lastRequestRef = useRef(addRequest);

  useEffect(() => {
    if (addRequest === lastRequestRef.current) return;
    lastRequestRef.current = addRequest;

    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    direction.y = 0;

    if (direction.lengthSq() < 0.001) direction.set(0, 0, -1);
    direction.normalize();

    const target = camera.position.clone().add(direction.multiplyScalar(MODULE_STEP * 1.5));
    addModule("corridor", [target.x, 0, target.z], 0, pendingAddType);
  }, [addModule, addRequest, camera, gridSize, pendingAddType]);

  return null;
};

const CameraRig: React.FC = () => {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const isMoveMode = useMapBuilderStore((state) => state.isMoveMode);

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.enabled = !isMoveMode;
    }
  }, [isMoveMode]);

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      target={[0, 0, 0]}
      minDistance={6}
      maxDistance={120}
      maxPolarAngle={Math.PI * 0.48}
    />
  );
};

export const Scene: React.FC = () => {
  const gridSize = useMapBuilderStore((state) => state.gridSize);

  return (
    <Canvas
      className="map-builder-canvas"
      shadows
      dpr={[1, 1.6]}
      camera={{ position: [12, 12, 14], fov: 48, near: 0.1, far: 500 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 0.9;
      }}
    >
      <color attach="background" args={["#090c0d"]} />
      <ambientLight intensity={0.56} color="#dce8ff" />
      <directionalLight
        position={[10, 16, 8]}
        intensity={1.8}
        color="#fff8e8"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-8, 7, -8]} intensity={0.85} color="#b7f8ca" distance={45} />

      <Suspense fallback={<SceneLoader />}>
        <GridManager gridSize={gridSize} />
        <SelectionManager />
        <TransformManager />
        <CameraAddBridge />
      </Suspense>

      <CameraRig />
    </Canvas>
  );
};
