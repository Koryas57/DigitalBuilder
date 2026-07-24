import React from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  WARP_CONFIG,
  type WarpDebugState,
  type WarpState,
  type WarpTriggerSnapshot,
} from "../../../../data/warpConfig";
import { WarpDebugHelper } from "./WarpDebugHelper";
import { WarpParticles } from "./WarpParticles";
import { createWarpPortalMaterial } from "./WarpPortalMaterial";
import { WarpTrigger } from "./WarpTrigger";
import { useWarpPortalAmbience } from "../audio/useWarpAudio";

interface MysticWarpPortalProps {
  playerPositionRef: React.MutableRefObject<THREE.Vector3>;
  state: WarpState;
  audioEnabled: boolean;
  triggerDebugVisible: boolean;
  onEnter: () => void;
  onDebugChange: (debug: WarpDebugState) => void;
}

export const MysticWarpPortal: React.FC<MysticWarpPortalProps> = ({
  playerPositionRef,
  state,
  audioEnabled,
  triggerDebugVisible,
  onEnter,
  onDebugChange,
}) => {
  useWarpPortalAmbience({ playerPositionRef, enabled: audioEnabled });
  const { size } = useThree();
  const lightRef = React.useRef<THREE.PointLight>(null);
  const hoverRef = React.useRef(0);
  const intensityRef = React.useRef<number>(WARP_CONFIG.intensity);
  const portalPosition = React.useMemo(
    () => new THREE.Vector3(...WARP_CONFIG.position),
    []
  );
  const materials = React.useMemo(
    () => [
      createWarpPortalMaterial(
        "core",
        WARP_CONFIG.colorA,
        WARP_CONFIG.colorB,
        WARP_CONFIG.intensity,
        WARP_CONFIG.distortion
      ),
      createWarpPortalMaterial(
        "rim",
        WARP_CONFIG.colorA,
        WARP_CONFIG.colorB,
        WARP_CONFIG.intensity,
        WARP_CONFIG.distortion
      ),
      createWarpPortalMaterial(
        "distortion",
        WARP_CONFIG.colorA,
        WARP_CONFIG.colorB,
        WARP_CONFIG.intensity,
        WARP_CONFIG.distortion
      ),
    ],
    []
  );

  React.useEffect(() => {
    materials.forEach((material) => {
      material.uniforms.uResolution.value.set(size.width, size.height);
    });
  }, [materials, size.height, size.width]);

  React.useEffect(
    () => () => {
      materials.forEach((material) => material.dispose());
    },
    [materials]
  );

  const handleTriggerDebugChange = React.useCallback(
    (snapshot: WarpTriggerSnapshot) => {
      onDebugChange({
        ...snapshot,
        state,
        position: WARP_CONFIG.position,
        intensity: Number(intensityRef.current.toFixed(2)),
      });
    },
    [onDebugChange, state]
  );

  useFrame(({ clock }, delta) => {
    const elapsed = clock.elapsedTime;
    const playerDistance = playerPositionRef.current.distanceTo(portalPosition);
    const hoverTarget = THREE.MathUtils.clamp(1 - playerDistance / 5.5, 0, 1);
    hoverRef.current = THREE.MathUtils.damp(hoverRef.current, hoverTarget, 4.2, delta);
    const targetIntensity =
      WARP_CONFIG.intensity *
      (state === "entered" ? 1.12 : state === "inactive" ? 0.72 : 1);
    intensityRef.current = THREE.MathUtils.damp(
      intensityRef.current,
      targetIntensity,
      3.4,
      delta
    );
    const pulse = 0.5 + Math.sin(elapsed * 1.75) * 0.5;

    materials.forEach((material, index) => {
      material.uniforms.uTime.value = elapsed + index * 1.93;
      material.uniforms.uIntensity.value = intensityRef.current;
      material.uniforms.uHover.value = hoverRef.current;
      material.uniforms.uPulse.value = pulse;
    });

    if (lightRef.current) {
      lightRef.current.intensity =
        (0.62 + pulse * 0.18 + hoverRef.current * 0.32) *
        intensityRef.current;
    }
  });

  return (
    <>
      <group
        position={WARP_CONFIG.position}
        rotation={WARP_CONFIG.rotation}
        scale={WARP_CONFIG.scale}
      >
        <mesh material={materials[0]} renderOrder={20}>
          <planeGeometry args={[WARP_CONFIG.width, WARP_CONFIG.height, 24, 36]} />
        </mesh>
        <mesh
          material={materials[1]}
          position={[0, 0, 0.025]}
          scale={[1.075, 1.045, 1]}
          renderOrder={22}
        >
          <planeGeometry args={[WARP_CONFIG.width, WARP_CONFIG.height, 24, 36]} />
        </mesh>
        <mesh
          material={materials[2]}
          position={[0, 0, 0.055]}
          scale={[0.92, 0.94, 1]}
          renderOrder={23}
        >
          <planeGeometry args={[WARP_CONFIG.width, WARP_CONFIG.height, 20, 30]} />
        </mesh>

        <WarpParticles
          width={WARP_CONFIG.width}
          height={WARP_CONFIG.height}
          colorA={WARP_CONFIG.colorA}
          colorB={WARP_CONFIG.colorB}
          desktopCount={WARP_CONFIG.desktopParticleCount}
          mobileCount={WARP_CONFIG.mobileParticleCount}
          intensity={WARP_CONFIG.intensity}
        />

        <pointLight
          ref={lightRef}
          position={[0, 0.15, 0.72]}
          color={WARP_CONFIG.colorA}
          intensity={0.72}
          distance={5.2}
          decay={2}
          castShadow={false}
        />
      </group>

      <WarpTrigger
        position={WARP_CONFIG.position}
        rotation={WARP_CONFIG.rotation}
        size={WARP_CONFIG.triggerSize}
        playerPositionRef={playerPositionRef}
        active={state === "available"}
        onEnter={onEnter}
        onDebugChange={handleTriggerDebugChange}
      />
      <WarpDebugHelper
        position={WARP_CONFIG.position}
        rotation={WARP_CONFIG.rotation}
        size={WARP_CONFIG.triggerSize}
        visible={triggerDebugVisible}
      />
    </>
  );
};
