import React, { Suspense, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import {
  CorridorCollisionSystem,
  buildCorridorBounds,
  type CorridorBounds,
} from "./CorridorCollisionSystem";
import {
  CorridorMapLoader,
  type CorridorModule,
  type CorridorRenderStats,
} from "./CorridorMapLoader";
import {
  CorridorPlayerController,
  type CorridorPlayerDebugState,
} from "./CorridorPlayerController";
import {
  DEBUG_COLLISIONS,
  DEBUG_DISABLE_COLLISIONS,
  DEBUG_PLAYER,
  DEBUG_VISUAL,
  PLAYER_HEIGHT,
  PLAYER_SPAWN,
  SPAWN_PRESETS,
} from "./CorridorSpawn";
import { PlayerCapsuleCollider } from "./PlayerCapsuleCollider";
import { corridorAudioManager } from "./audio/AudioManager";
import { DEFAULT_BACKGROUND_VOLUME } from "./audio/useAmbienceAudio";
import { DEFAULT_FOOTSTEP_VOLUME } from "./audio/useFootstepAudio";
import {
  INITIAL_INTRO_RUNTIME_STATE,
  IntroManager,
  type IntroRuntimeState,
} from "./intro/IntroManager";
import {
  BASE_FOV,
  DEFAULT_INTRO_CAMERA_STATE,
  INTRO_AUDIO,
  LOCKED_CONTROL_STATE,
  type IntroCameraState,
} from "./intro/introConfig";

interface CorridorGameExperienceProps {
  movementInput: { x: number; z: number };
  lookInput: { x: number; y: number };
  reducedMotion: boolean;
  onQuickMode: () => void;
  onBackToSelector: () => void;
}

const initialDebug: CorridorPlayerDebugState = {
  position: PLAYER_SPAWN.position,
  rotation: PLAYER_SPAWN.rotation,
  nearestModuleId: null,
  collided: false,
  fps: 0,
  speed: 0,
  sprinting: false,
  grounded: true,
  collisionEnabled: !DEBUG_DISABLE_COLLISIONS,
  footstepVolume: DEFAULT_FOOTSTEP_VOLUME,
  backgroundVolume: DEFAULT_BACKGROUND_VOLUME,
  footstepStep: 0,
};

const toPlayerYaw = (rotation: number) =>
  Math.abs(rotation) > Math.PI * 2 ? THREE.MathUtils.degToRad(rotation) : rotation;

type LightingPresetName = "debugBright" | "sketchfabLike" | "horrorDark";

const LIGHTING_PRESET_ORDER: LightingPresetName[] = ["debugBright", "sketchfabLike", "horrorDark"];

const LIGHTING_PRESETS: Record<
  LightingPresetName,
  {
    ambient: number;
    hemisphere: number;
    directional: number;
    fill: number;
    exposure: number;
    fogNear: number;
    fogFar: number;
    background: string;
  }
> = {
  debugBright: {
    ambient: 0.9,
    hemisphere: 0.85,
    directional: 1.35,
    fill: 1.05,
    exposure: 1.28,
    fogNear: 36,
    fogFar: 80,
    background: "#0b100d",
  },
  sketchfabLike: {
    ambient: 0.25,
    hemisphere: 0.35,
    directional: 0.38,
    fill: 0.32,
    exposure: 1.6,
    fogNear: 22,
    fogFar: 56,
    background: "#050705",
  },
  horrorDark: {
    ambient: 0.08,
    hemisphere: 0.16,
    directional: 0.14,
    fill: 0.08,
    exposure: 0.86,
    fogNear: 9,
    fogFar: 30,
    background: "#020302",
  },
};

const LightingRig: React.FC<{
  presetName: LightingPresetName;
  exposureTrim: number;
  debugVisual: boolean;
  mapCenter: THREE.Vector3;
}> = ({ presetName, exposureTrim, debugVisual, mapCenter }) => {
  const { gl } = useThree();
  const preset = LIGHTING_PRESETS[presetName];

  React.useEffect(() => {
    gl.toneMappingExposure = debugVisual
      ? 1.18
      : THREE.MathUtils.clamp(preset.exposure + exposureTrim, 0.55, 1.65);
  }, [debugVisual, exposureTrim, gl, preset.exposure]);

  return (
    <>
      <ambientLight
        intensity={debugVisual ? 1.25 : preset.ambient}
        color="#fff8e8"
      />
      <hemisphereLight
        args={[
          "#ffffff",
          "#263128",
          debugVisual ? 1.1 : preset.hemisphere,
        ]}
      />
      <directionalLight
        position={[mapCenter.x + 4, 7, mapCenter.z + 5]}
        intensity={debugVisual ? 2.4 : preset.directional}
        color="#fff4d8"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight
        position={[mapCenter.x, 2.4, mapCenter.z]}
        intensity={debugVisual ? 0 : preset.fill}
        distance={20}
        decay={1.6}
        color="#bfffd1"
      />
    </>
  );
};

const OverviewCamera: React.FC<{ enabled: boolean; target: THREE.Vector3 }> = ({ enabled, target }) => {
  const { camera } = useThree();

  React.useEffect(() => {
    if (!enabled) return;
    camera.position.set(target.x + 8, target.y + 14, target.z + 12);
    camera.lookAt(target);
    camera.updateProjectionMatrix();
  }, [camera, enabled, target]);

  return null;
};

export const CorridorGameExperience: React.FC<CorridorGameExperienceProps> = ({
  movementInput,
  lookInput,
  reducedMotion,
  onQuickMode,
  onBackToSelector,
}) => {
  const [objects, setObjects] = useState<CorridorModule[]>([]);
  const [wallCollisionBounds, setWallCollisionBounds] = useState<CorridorBounds[]>([]);
  const [portalContact, setPortalContact] = useState(false);
  const [debug, setDebug] = useState<CorridorPlayerDebugState>(initialDebug);
  const [overviewMode, setOverviewMode] = useState(false);
  const [materialOverrideEnabled, setMaterialOverrideEnabled] = useState(false);
  const [collisionDebugVisible, setCollisionDebugVisible] = useState(false);
  const [lightingPreset, setLightingPreset] = useState<LightingPresetName>("sketchfabLike");
  const [exposureTrim, setExposureTrim] = useState(0);
  const [renderStats, setRenderStats] = useState<CorridorRenderStats>({
    importedLights: 0,
    lampBoosts: 0,
    textures: 0,
    maxAnisotropy: 0,
  });
  const [rendererStats, setRendererStats] = useState({
    toneMapping: "ACESFilmicToneMapping",
    pixelRatio: 1,
  });
  const [footstepVolume, setFootstepVolume] = useState(DEFAULT_FOOTSTEP_VOLUME);
  const [backgroundVolume, setBackgroundVolume] = useState(DEFAULT_BACKGROUND_VOLUME);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [introState, setIntroState] = useState<IntroRuntimeState>(INITIAL_INTRO_RUNTIME_STATE);
  const [introCameraState, setIntroCameraState] = useState<IntroCameraState>(
    DEFAULT_INTRO_CAMERA_STATE
  );
  const [playerMoved, setPlayerMoved] = useState(false);
  const [pauseOpen, setPauseOpen] = useState(false);
  const [pauseMessageVisible, setPauseMessageVisible] = useState(false);
  const [debugConsoleVisible, setDebugConsoleVisible] = useState(false);
  const [restartToken, setRestartToken] = useState(0);
  const playerPositionRef = useRef(new THREE.Vector3(...PLAYER_SPAWN.position));
  const corridorModules = React.useMemo(
    () => objects.filter((object) => (object.type ?? "corridor") === "corridor"),
    [objects]
  );
  const fallbackBounds = React.useMemo(() => buildCorridorBounds(corridorModules), [corridorModules]);
  const bounds = wallCollisionBounds.length ? wallCollisionBounds : fallbackBounds;
  const spawnConfig = React.useMemo(() => {
    const spawnObject = objects.find((object) => object.type === "playerSpawn");
    if (!spawnObject) {
      return {
        name: "PLAYER_SPAWN fallback",
        position: PLAYER_SPAWN.position,
        rotation: PLAYER_SPAWN.rotation,
        source: "fallback",
      };
    }

    return {
      name: spawnObject.id ?? "PlayerSpawn",
      position: [
        spawnObject.position[0],
        PLAYER_HEIGHT,
        spawnObject.position[2],
      ] as [number, number, number],
      rotation: toPlayerYaw(spawnObject.rotation),
      source: "json",
    };
  }, [objects]);
  const mapCenter = React.useMemo(() => {
    if (!bounds.length) return new THREE.Vector3();
    return bounds.reduce((acc, bound) => acc.add(bound.center), new THREE.Vector3()).divideScalar(bounds.length);
  }, [bounds]);
  const handleMapLoaded = React.useCallback(
    (
      loadedObjects: CorridorModule[],
      collisionBounds: CorridorBounds[],
      loadedRenderStats: CorridorRenderStats
    ) => {
      setObjects(loadedObjects);
      setWallCollisionBounds(collisionBounds);
      setRenderStats(loadedRenderStats);
    },
    []
  );
  const unlockAudio = React.useCallback(() => {
    corridorAudioManager.unlock();
    setAudioUnlocked(true);
  }, []);
  const lightingPresetIndex = LIGHTING_PRESET_ORDER.indexOf(lightingPreset);
  const effectiveControlState = pauseOpen ? LOCKED_CONTROL_STATE : introState.controlState;
  const handleRestart = React.useCallback(() => {
    setRestartToken((current) => current + 1);
    setPlayerMoved(false);
    setPauseOpen(false);
  }, []);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "m") {
        setMaterialOverrideEnabled((current) => !current);
      }
      if (event.key.toLowerCase() === "c") {
        setCollisionDebugVisible((current) => !current);
      }
      if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        setExposureTrim((current) => Math.min(0.4, Number((current + 0.05).toFixed(2))));
      }
      if (event.key === "-") {
        event.preventDefault();
        setExposureTrim((current) => Math.max(-0.35, Number((current - 0.05).toFixed(2))));
      }
      if (event.key.toLowerCase() === "l") {
        setLightingPreset((current) => {
          const currentIndex = LIGHTING_PRESET_ORDER.indexOf(current);
          return LIGHTING_PRESET_ORDER[(currentIndex + 1) % LIGHTING_PRESET_ORDER.length];
        });
        setExposureTrim(0);
      }
      if (event.key === "F3") {
        event.preventDefault();
        setDebugConsoleVisible((current) => !current);
      }
      if (event.key === "Escape" && introState.phase === "playing") {
        event.preventDefault();
        setPauseOpen((current) => !current);
      }
      if (!audioUnlocked) {
        unlockAudio();
      }
    };

    const handlePointerDown = () => {
      if (!audioUnlocked) {
        unlockAudio();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("pointerdown", handlePointerDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [audioUnlocked, introState.phase, unlockAudio]);

  React.useEffect(() => {
    if (!pauseOpen) {
      setPauseMessageVisible(false);
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setPauseMessageVisible(true);
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [pauseOpen]);

  return (
    <>
      <Canvas
        className="developer-r3f-canvas"
        shadows
        dpr={[1, 2]}
        camera={{ position: PLAYER_SPAWN.position, fov: BASE_FOV, near: 0.04, far: 70 }}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          alpha: false,
        }}
        onCreated={({ gl }) => {
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = DEBUG_VISUAL ? 1.18 : 1.18;
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
          setRendererStats({
            toneMapping: "ACESFilmicToneMapping",
            pixelRatio: Number(gl.getPixelRatio().toFixed(2)),
          });
        }}
      >
        <color attach="background" args={[DEBUG_VISUAL ? "#151a18" : LIGHTING_PRESETS[lightingPreset].background]} />
        {!DEBUG_VISUAL && (
          <fog
            attach="fog"
            args={[
              LIGHTING_PRESETS[lightingPreset].background,
              LIGHTING_PRESETS[lightingPreset].fogNear,
              LIGHTING_PRESETS[lightingPreset].fogFar,
            ]}
          />
        )}
        <LightingRig
          presetName={lightingPreset}
          exposureTrim={exposureTrim}
          debugVisual={DEBUG_VISUAL}
          mapCenter={mapCenter}
        />
        {DEBUG_VISUAL && (
          <>
            <directionalLight
              position={[8, 12, 8]}
              intensity={2.4}
              color="#ffffff"
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
            />
            <gridHelper args={[80, 80, "#b7f8ca", "#46514b"]} />
            <axesHelper args={[6]} />
            <mesh position={SPAWN_PRESETS[0].position}>
              <sphereGeometry args={[0.18, 16, 16]} />
              <meshBasicMaterial color="#ffdd77" />
            </mesh>
            <mesh position={SPAWN_PRESETS[1].position}>
              <sphereGeometry args={[0.18, 16, 16]} />
              <meshBasicMaterial color="#9eefff" />
            </mesh>
            <mesh position={SPAWN_PRESETS[2].position}>
              <sphereGeometry args={[0.18, 16, 16]} />
              <meshBasicMaterial color="#b992ff" />
            </mesh>
          </>
        )}

        <Suspense fallback={null}>
          <CorridorMapLoader
            onLoaded={handleMapLoaded}
            onPortalContactChange={setPortalContact}
            playerPositionRef={playerPositionRef}
            materialOverrideEnabled={materialOverrideEnabled}
            debugVisual={DEBUG_VISUAL}
          />
          <CorridorCollisionSystem bounds={bounds} visible={collisionDebugVisible} />
          <PlayerCapsuleCollider playerPositionRef={playerPositionRef} visible={collisionDebugVisible} />
          <CorridorPlayerController
            modules={corridorModules}
            movementInput={movementInput}
            lookInput={lookInput}
            reducedMotion={reducedMotion}
            playerPositionRef={playerPositionRef}
            onDebugChange={setDebug}
            overviewMode={overviewMode}
            onOverviewModeChange={setOverviewMode}
            spawnConfig={spawnConfig}
            collisionBounds={bounds}
            audioUnlocked={audioUnlocked}
            controlState={effectiveControlState}
            introCameraState={introCameraState}
            backgroundFadeInMs={INTRO_AUDIO.backgroundFadeInMs}
            backgroundStartDelayMs={INTRO_AUDIO.backgroundStartDelayMs}
            onPlayerMoved={() => setPlayerMoved(true)}
            restartToken={restartToken}
            footstepVolume={footstepVolume}
            backgroundVolume={backgroundVolume}
            onFootstepVolumeChange={setFootstepVolume}
            onBackgroundVolumeChange={setBackgroundVolume}
          />
        </Suspense>

        {overviewMode && (
          <>
            <OverviewCamera enabled={overviewMode} target={mapCenter} />
            <OrbitControls
              makeDefault
              target={mapCenter.toArray()}
              enableDamping
              dampingFactor={0.08}
              minDistance={3}
              maxDistance={80}
            />
          </>
        )}
      </Canvas>

      {portalContact && (
        <div className="developer-r3f-portal-message">
          Passage verrouille
        </div>
      )}

      <IntroManager
        mapReady={objects.length > 0}
        audioUnlocked={audioUnlocked}
        reducedMotion={reducedMotion}
        finalYaw={spawnConfig.rotation}
        playerMoved={playerMoved}
        onRequestAudioUnlock={unlockAudio}
        onIntroStateChange={setIntroState}
        onCameraStateChange={setIntroCameraState}
      />

      {introState.phase === "playing" && !pauseOpen && (
        <button
          className="developer-r3f-pause-trigger"
          type="button"
          onClick={() => setPauseOpen(true)}
        >
          Pause
        </button>
      )}

      {pauseOpen && (
        <div className="developer-r3f-pause" role="dialog" aria-modal="true" aria-label="Menu pause">
          <div className="developer-r3f-pause__panel">
            <h2>Pause</h2>
            <div className="developer-r3f-pause__actions">
              <button type="button" onClick={() => setPauseOpen(false)}>
                Reprendre
              </button>
              <button type="button" onClick={handleRestart}>
                Recommencer
              </button>
              <button type="button" onClick={onQuickMode}>
                Mode rapide
              </button>
              <button type="button" onClick={onBackToSelector}>
                Choix de parcours
              </button>
              <a href="/#contact">Contact</a>
            </div>
            <div className="developer-r3f-pause__controls" aria-label="Reglages">
              <label>
                <span>
                  Bruits de pas
                  <strong>{Math.round(footstepVolume * 100)}%</strong>
                </span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={footstepVolume}
                  onChange={(event) => setFootstepVolume(Number(event.target.value))}
                />
              </label>
              <label>
                <span>
                  Ambiance
                  <strong>{Math.round(backgroundVolume * 100)}%</strong>
                </span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={backgroundVolume}
                  onChange={(event) => setBackgroundVolume(Number(event.target.value))}
                />
              </label>
              <label>
                <span>
                  Exposition
                  <strong>{(LIGHTING_PRESETS[lightingPreset].exposure + exposureTrim).toFixed(2)}</strong>
                </span>
                <input
                  type="range"
                  min="-0.35"
                  max="0.4"
                  step="0.01"
                  value={exposureTrim}
                  onChange={(event) => setExposureTrim(Number(event.target.value))}
                />
              </label>
              <label>
                <span>
                  Lumiere
                  <strong>{lightingPreset}</strong>
                </span>
                <input
                  type="range"
                  min="0"
                  max={LIGHTING_PRESET_ORDER.length - 1}
                  step="1"
                  value={lightingPresetIndex}
                  onChange={(event) => {
                    setLightingPreset(LIGHTING_PRESET_ORDER[Number(event.target.value)]);
                    setExposureTrim(0);
                  }}
                />
              </label>
            </div>
            <span>Esc pour reprendre - F3 pour la debug console</span>
          </div>
          {pauseMessageVisible && (
            <p className="developer-r3f-pause__message">
              Comment se passe votre expérience ? Ce n'est qu'un aperçu de ce qui est possible.
            </p>
          )}
        </div>
      )}

      {debugConsoleVisible && (DEBUG_PLAYER || DEBUG_COLLISIONS) && (
        <div className="developer-r3f-debug">
          <strong>Debug Console</strong>
          <span>Position: {debug.position.join(", ")}</span>
          <span>Rotation: {debug.rotation}</span>
          <span>Module proche: {debug.nearestModuleId ?? "none"}</span>
          <span>Collision: {debug.collided ? "yes" : "no"}</span>
          <span>Collision disabled: {DEBUG_DISABLE_COLLISIONS ? "yes" : "no"}</span>
          <span>Collision debug: {collisionDebugVisible ? "on" : "off"} / C</span>
          <span>Bounds: {bounds.length}</span>
          <span>Speed: {debug.speed}</span>
          <span>Sprint: {debug.sprinting ? "yes" : "no"}</span>
          <span>Footsteps volume: {debug.footstepVolume.toFixed(2)} / [ ]</span>
          <span>Background volume: {debug.backgroundVolume.toFixed(2)} / V B</span>
          <span>Footstep step: {debug.footstepStep}</span>
          <span>Grounded: {debug.grounded ? "yes" : "no"}</span>
          <span>Audio unlocked: {audioUnlocked ? "yes" : "no"}</span>
          <span>Spawn source: {spawnConfig.source}</span>
          <span>Visual debug: {DEBUG_VISUAL ? "on" : "off"}</span>
          <span>Overview: {overviewMode ? "on" : "off"} / O</span>
          <span>Material override: {materialOverrideEnabled ? "on" : "off"} / M</span>
          <span>Lighting preset: {lightingPreset} / L</span>
          <span>Tone mapping: {rendererStats.toneMapping}</span>
          <span>Exposure: {(LIGHTING_PRESETS[lightingPreset].exposure + exposureTrim).toFixed(2)} / + -</span>
          <span>Pixel ratio: {rendererStats.pixelRatio}</span>
          <span>Lights: {renderStats.importedLights + renderStats.lampBoosts}</span>
          <span>Textures: {renderStats.textures}</span>
          <span>Max anisotropy: {renderStats.maxAnisotropy}</span>
          <span>Spawn presets: 1 / 2 / 3</span>
          <span>FPS: {debug.fps}</span>
          <span>Experience phase: {introState.phase}</span>
          <span>Intro enabled: {introState.introEnabled ? "yes" : "no"}</span>
          <span>Intro sentence: {introState.sentenceIndex}</span>
          <span>Intro camera: {introState.cameraProgress.toFixed(2)}</span>
          <span>Current FOV: {introState.currentFov.toFixed(2)}</span>
          <span>Controls enabled: {introState.controlState.controlsEnabled ? "yes" : "no"}</span>
          <span>Movement enabled: {introState.controlState.movementEnabled ? "yes" : "no"}</span>
          <span>Look enabled: {introState.controlState.lookEnabled ? "yes" : "no"}</span>
          <span>Head bob enabled: {introState.controlState.headBobEnabled ? "yes" : "no"}</span>
          <span>Background audio: {introState.backgroundAudioState}</span>
          <span>Neon played: {introState.neonPlayed ? "yes" : "no"}</span>
        </div>
      )}
    </>
  );
};
