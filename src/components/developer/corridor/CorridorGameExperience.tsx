import React, { Suspense, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import {
  EMPTY_MONSTER_DEBUG_STATE,
  MONSTER_MUTANT_CONFIG,
  type MonsterDebugState,
} from "../../../data/monsterMutantConfig";
import { MonsterPresenceController } from "../../corridor/entities/MonsterPresenceController";
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
import { useWarpAudio } from "./audio/useWarpAudio";
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
  PLAYING_CONTROL_STATE,
  type IntroCameraState,
} from "./intro/introConfig";
import {
  FIRST_CALL_CONFIG,
  SECOND_CALL_CONFIG,
} from "../../../data/narrativeCallConfig";
import { NarrativeCallController } from "../../corridor/call/NarrativeCallController";
import type { NarrativeCallRuntime } from "../../../hooks/useNarrativeCallSequence";
import {
  CORRIDOR_NARRATIVE_CONFIG,
  resolveWarpOutcome,
  type CorridorNarrativePhase,
  type MonsterLoopState,
  type WarpOutcome,
} from "../../../data/corridorNarrativeConfig";
import {
  INITIAL_WARP_DEBUG_STATE,
  WARP_CONFIG,
  type WarpDebugState,
  type WarpState,
} from "../../../data/warpConfig";
import { MysticWarpPortal } from "./warp/MysticWarpPortal";
import { WarpTransitionOverlay } from "./warp/WarpTransitionOverlay";
import { useWarpTransition } from "./warp/useWarpTransition";

interface CorridorGameExperienceProps {
  movementInput: { x: number; z: number };
  lookInput: { x: number; y: number };
  reducedMotion: boolean;
  onQuickMode: () => void;
  onBackToSelector: () => void;
}

const initialDebug: CorridorPlayerDebugState = {
  position: PLAYER_SPAWN.position,
  velocity: [0, 0, 0],
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

const createInitialCallRuntime = (
  callId: NarrativeCallRuntime["callId"]
): NarrativeCallRuntime => ({
  callId,
  state: "idle",
  timerActive: false,
  ringingAudioActive: false,
  voiceCurrentTime: 0,
  voiceDuration: 0,
  currentCueIndex: -1,
  audioUnlocked: false,
  controlsSuspended: false,
  completed: false,
  ambienceDuckFactor: 1,
  objectiveVisible: false,
  resumeHintVisible: false,
  error: null,
});

const CALL_INTERACTION_CONTROL_STATE = {
  ...PLAYING_CONTROL_STATE,
  lookEnabled: false,
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

const createOrbitalArrow = (color: THREE.ColorRepresentation) => {
  const arrow = new THREE.ArrowHelper(
    new THREE.Vector3(0, -1, 0),
    new THREE.Vector3(),
    2.7,
    color,
    0.72,
    0.46
  );
  const lineMaterial = arrow.line.material as THREE.LineBasicMaterial;
  const coneMaterial = arrow.cone.material as THREE.MeshBasicMaterial;
  lineMaterial.depthTest = false;
  coneMaterial.depthTest = false;
  arrow.line.renderOrder = 100;
  arrow.cone.renderOrder = 100;
  arrow.line.frustumCulled = false;
  arrow.cone.frustumCulled = false;
  return arrow;
};

const OrbitalPositionMarkers: React.FC<{
  playerPositionRef: React.MutableRefObject<THREE.Vector3>;
  monsterPosition: [number, number, number];
  monsterVisible: boolean;
}> = ({ playerPositionRef, monsterPosition, monsterVisible }) => {
  const playerArrow = React.useMemo(() => createOrbitalArrow("#28e86f"), []);
  const monsterArrow = React.useMemo(() => createOrbitalArrow("#ff2d2d"), []);

  useFrame(() => {
    const playerPosition = playerPositionRef.current;
    playerArrow.position.set(playerPosition.x, playerPosition.y + 3.35, playerPosition.z);
    monsterArrow.position.set(
      monsterPosition[0],
      monsterPosition[1] + 3.35,
      monsterPosition[2]
    );
    monsterArrow.visible = monsterVisible;
  });

  React.useEffect(
    () => () => {
      playerArrow.line.geometry.dispose();
      playerArrow.cone.geometry.dispose();
      monsterArrow.line.geometry.dispose();
      monsterArrow.cone.geometry.dispose();
      (playerArrow.line.material as THREE.Material).dispose();
      (playerArrow.cone.material as THREE.Material).dispose();
      (monsterArrow.line.material as THREE.Material).dispose();
      (monsterArrow.cone.material as THREE.Material).dispose();
    },
    [monsterArrow, playerArrow]
  );

  return (
    <>
      <primitive object={playerArrow} />
      <primitive object={monsterArrow} />
    </>
  );
};

export const CorridorGameExperience: React.FC<CorridorGameExperienceProps> = ({
  movementInput,
  lookInput,
  reducedMotion,
  onQuickMode,
  onBackToSelector,
}) => {
  const { playWarpTransition } = useWarpAudio();
  const [objects, setObjects] = useState<CorridorModule[]>([]);
  const [wallCollisionBounds, setWallCollisionBounds] = useState<CorridorBounds[]>([]);
  const [debug, setDebug] = useState<CorridorPlayerDebugState>(initialDebug);
  const [monsterDebug, setMonsterDebug] = useState<MonsterDebugState>(EMPTY_MONSTER_DEBUG_STATE);
  const [warpState, setWarpState] = useState<WarpState>("inactive");
  const [warpDebug, setWarpDebug] = useState<WarpDebugState>(INITIAL_WARP_DEBUG_STATE);
  const [warpTriggerDebugVisible, setWarpTriggerDebugVisible] = useState(false);
  const [narrativePhase, setNarrativePhase] =
    useState<CorridorNarrativePhase>("intro");
  const [loopCount, setLoopCount] = useState(0);
  const [resolvedWarpOutcome, setResolvedWarpOutcome] =
    useState<WarpOutcome>("loopToSpawn");
  const [monsterLoopState, setMonsterLoopState] =
    useState<MonsterLoopState>("firstLoopActive");
  const [warpCooldownUntil, setWarpCooldownUntil] = useState(0);
  const [playerPositionBeforeWarp, setPlayerPositionBeforeWarp] =
    useState<[number, number, number] | null>(null);
  const [playerPositionAfterWarp, setPlayerPositionAfterWarp] =
    useState<[number, number, number] | null>(null);
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
  const [teleportToken, setTeleportToken] = useState(0);
  const [secondCallResetToken, setSecondCallResetToken] = useState(0);
  const [secondCallTriggerToken, setSecondCallTriggerToken] = useState(0);
  const [damageToken, setDamageToken] = useState(0);
  const [damageOverlayState, setDamageOverlayState] = useState<"hidden" | "active" | "fading">("hidden");
  const [playerHitCount, setPlayerHitCount] = useState(0);
  const [playerDowned, setPlayerDowned] = useState(false);
  const [recoveryToken, setRecoveryToken] = useState(0);
  const [monsterSpawnCycleToken, setMonsterSpawnCycleToken] = useState(0);
  const [firstCallRuntime, setFirstCallRuntime] = useState<NarrativeCallRuntime>(
    () => createInitialCallRuntime("first-call")
  );
  const [secondCallRuntime, setSecondCallRuntime] = useState<NarrativeCallRuntime>(
    () => createInitialCallRuntime("second-call")
  );
  const playerPositionRef = useRef(new THREE.Vector3(...PLAYER_SPAWN.position));
  const damageAudioRef = useRef<HTMLAudioElement | null>(null);
  const damageFadeTimerRef = useRef<number | null>(null);
  const warpCooldownTimerRef = useRef<number | null>(null);
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
    corridorAudioManager.prime(INTRO_AUDIO.backgroundSrc);
    corridorAudioManager.prime(WARP_CONFIG.audio.transitionSrc);
    setAudioUnlocked(true);
  }, []);
  const lightingPresetIndex = LIGHTING_PRESET_ORDER.indexOf(lightingPreset);
  const isCallInteractionActive = React.useCallback(
    (runtime: NarrativeCallRuntime) =>
      ["ringing", "answering", "playingMessage", "ending"].includes(
        runtime.state
      ),
    []
  );
  const firstCallSequenceActive = isCallInteractionActive(firstCallRuntime);
  const secondCallSequenceActive = isCallInteractionActive(secondCallRuntime);
  const callSequenceActive =
    firstCallSequenceActive || secondCallSequenceActive;
  const callWaitingForAnswer =
    firstCallRuntime.state === "ringing" ||
    secondCallRuntime.state === "ringing";
  const callDuckFactor = Math.min(
    firstCallRuntime.ambienceDuckFactor,
    secondCallRuntime.ambienceDuckFactor
  );

  const preparePlayerForLoopRestart = React.useCallback(() => {
    if (damageFadeTimerRef.current !== null) {
      window.clearTimeout(damageFadeTimerRef.current);
      damageFadeTimerRef.current = null;
    }
    if (damageAudioRef.current) {
      damageAudioRef.current.pause();
      try {
        damageAudioRef.current.currentTime = 0;
      } catch {
        // The damage audio may still be loading.
      }
      damageAudioRef.current = null;
    }
    setPlayerDowned(false);
    setPlayerHitCount(0);
    setDamageOverlayState((current) =>
      current === "hidden" ? "hidden" : "fading"
    );
    setRecoveryToken((current) => current + 1);
    damageFadeTimerRef.current = window.setTimeout(() => {
      setDamageOverlayState("hidden");
      damageFadeTimerRef.current = null;
    }, reducedMotion ? 120 : 520);
  }, [reducedMotion]);

  const resetMonsterForNarrativeLoop = React.useCallback((loop: number) => {
    setMonsterLoopState(loop >= 1 ? "secondLoopHidden" : "firstLoopActive");
  }, []);

  const performWarpTeleport = React.useCallback(() => {
    preparePlayerForLoopRestart();
    resetMonsterForNarrativeLoop(1);
    setTeleportToken((current) => current + 1);
  }, [preparePlayerForLoopRestart, resetMonsterForNarrativeLoop]);

  const completeWarpTransition = React.useCallback(() => {
    setWarpState("completed");
    setLoopCount((current) => {
      const next = current + 1;
      setNarrativePhase(
        next === 1 ? "secondCallPending" : "secondCallCompleted"
      );
      return next;
    });

    const cooldownUntil =
      performance.now() + CORRIDOR_NARRATIVE_CONFIG.warpCooldownMs;
    setWarpCooldownUntil(cooldownUntil);
    if (warpCooldownTimerRef.current !== null) {
      window.clearTimeout(warpCooldownTimerRef.current);
    }
    warpCooldownTimerRef.current = window.setTimeout(() => {
      setWarpState("available");
      setWarpCooldownUntil(0);
      warpCooldownTimerRef.current = null;
    }, CORRIDOR_NARRATIVE_CONFIG.warpCooldownMs);
  }, []);

  const warpTransition = useWarpTransition({
    reducedMotion,
    onTeleport: performWarpTeleport,
    onCompleted: completeWarpTransition,
  });

  const warpAmbienceFactor =
    warpTransition.state === "entering"
      ? CORRIDOR_NARRATIVE_CONFIG.warpAmbienceFactor.entering
      : warpTransition.state === "fadingOut"
        ? CORRIDOR_NARRATIVE_CONFIG.warpAmbienceFactor.fadingOut
        : warpTransition.state === "teleporting"
          ? CORRIDOR_NARRATIVE_CONFIG.warpAmbienceFactor.teleporting
          : warpTransition.state === "fadingIn"
            ? CORRIDOR_NARRATIVE_CONFIG.warpAmbienceFactor.fadingIn
            : 1;
  const introBackgroundFactor = introState.ambienceReady
    ? 1
    : INTRO_AUDIO.backgroundUnderIntroFactor;
  const effectiveBackgroundVolume =
    damageOverlayState !== "hidden" || playerDowned
      ? backgroundVolume *
        0.56 *
        introBackgroundFactor *
        callDuckFactor *
        warpAmbienceFactor
      : backgroundVolume *
        introBackgroundFactor *
        callDuckFactor *
        warpAmbienceFactor;
  const effectiveControlState =
    pauseOpen || playerDowned || warpTransition.active
      ? LOCKED_CONTROL_STATE
      : callWaitingForAnswer
        ? CALL_INTERACTION_CONTROL_STATE
        : introState.controlState;
  const handleRestart = React.useCallback(() => {
    warpTransition.reset();
    if (warpCooldownTimerRef.current !== null) {
      window.clearTimeout(warpCooldownTimerRef.current);
      warpCooldownTimerRef.current = null;
    }
    setRestartToken((current) => current + 1);
    setSecondCallResetToken((current) => current + 1);
    setPlayerMoved(false);
    setDamageOverlayState("hidden");
    setPlayerHitCount(0);
    setPlayerDowned(false);
    setRecoveryToken((current) => current + 1);
    setMonsterSpawnCycleToken((current) => current + 1);
    setNarrativePhase(
      introState.phase === "playing" ? "firstCallPending" : "intro"
    );
    setLoopCount(0);
    setResolvedWarpOutcome("loopToSpawn");
    resetMonsterForNarrativeLoop(0);
    setWarpCooldownUntil(0);
    setPlayerPositionBeforeWarp(null);
    setPlayerPositionAfterWarp(null);
    setWarpState("inactive");
    setWarpDebug((current) => ({
      ...current,
      state: "inactive",
      triggerActive: false,
      playerInsideTrigger: false,
    }));
    setPauseOpen(false);
  }, [introState.phase, resetMonsterForNarrativeLoop, warpTransition]);
  const handleWarpEnter = React.useCallback((force = false) => {
    if (
      (!force && warpState !== "available") ||
      warpTransition.active ||
      performance.now() < warpCooldownUntil
    ) {
      return;
    }
    const outcome = resolveWarpOutcome(narrativePhase);
    if (outcome !== "loopToSpawn" || !warpTransition.start()) return;

    console.info("[Mystic warp] player entered trigger");
    playWarpTransition();
    setResolvedWarpOutcome(outcome);
    setPlayerPositionBeforeWarp([
      Number(playerPositionRef.current.x.toFixed(3)),
      Number(playerPositionRef.current.y.toFixed(3)),
      Number(playerPositionRef.current.z.toFixed(3)),
    ]);
    setPlayerPositionAfterWarp(null);
    setNarrativePhase("firstWarpTransition");
    setWarpState("entered");
  }, [
    narrativePhase,
    playWarpTransition,
    warpCooldownUntil,
    warpState,
    warpTransition,
  ]);
  const handlePlayerDamage = React.useCallback(() => {
    if (playerDowned) return;
    setDamageToken((current) => current + 1);
    setDamageOverlayState("active");
    setPlayerHitCount((current) => {
      const next = current + 1;
      if (next >= 4) {
        setPlayerDowned(true);
      }
      return next;
    });

    if (!damageAudioRef.current || damageAudioRef.current.ended) {
      const audio = corridorAudioManager.playOneShot(
        MONSTER_MUTANT_CONFIG.audio.breathingDamage,
        1,
        3500
      );
      if (audio) {
        damageAudioRef.current = audio;
        audio.volume = 1;
        audio.addEventListener(
          "ended",
          () => {
            setDamageOverlayState("fading");
            if (damageFadeTimerRef.current !== null) {
              window.clearTimeout(damageFadeTimerRef.current);
            }
            damageFadeTimerRef.current = window.setTimeout(() => {
              setDamageOverlayState("hidden");
              damageFadeTimerRef.current = null;
            }, 2400);
          },
          { once: true }
        );
      } else if (damageFadeTimerRef.current === null) {
        damageFadeTimerRef.current = window.setTimeout(() => {
          setDamageOverlayState("fading");
          damageFadeTimerRef.current = window.setTimeout(() => {
            setDamageOverlayState("hidden");
            damageFadeTimerRef.current = null;
          }, 2400);
        }, 3200);
      }
    } else {
      damageAudioRef.current.volume = 1;
    }
  }, [playerDowned]);
  const handleRecover = React.useCallback(() => {
    setPlayerDowned(false);
    setPlayerHitCount(0);
    setRecoveryToken((current) => current + 1);
    setMonsterSpawnCycleToken((current) => current + 1);
    setDamageOverlayState("fading");
    if (damageFadeTimerRef.current !== null) {
      window.clearTimeout(damageFadeTimerRef.current);
    }
    damageFadeTimerRef.current = window.setTimeout(() => {
      setDamageOverlayState("hidden");
      damageFadeTimerRef.current = null;
    }, 1400);
  }, []);

  const handleFirstCallRuntimeChange = React.useCallback(
    (runtime: NarrativeCallRuntime) => {
      setFirstCallRuntime(runtime);
      if (
        runtime.state === "ringing" ||
        runtime.state === "answering" ||
        runtime.state === "playingMessage" ||
        runtime.state === "ending"
      ) {
        setNarrativePhase((current) =>
          current === "firstCallPending" ? "firstCallPlaying" : current
        );
      }
      if (runtime.completed && loopCount === 0) {
        setNarrativePhase((current) =>
          current === "firstWarpTransition" ? current : "firstWarpAvailable"
        );
        setWarpState((current) =>
          current === "entered" ? current : "available"
        );
      }
    },
    [loopCount]
  );

  const handleSecondCallRuntimeChange = React.useCallback(
    (runtime: NarrativeCallRuntime) => {
      setSecondCallRuntime(runtime);
      if (
        runtime.state === "ringing" ||
        runtime.state === "answering" ||
        runtime.state === "playingMessage" ||
        runtime.state === "ending"
      ) {
        setNarrativePhase("secondCallPlaying");
      }
      if (runtime.completed) {
        setNarrativePhase("secondCallCompleted");
      }
    },
    []
  );

  const secondCallReady =
    loopCount === 1 &&
    narrativePhase === "secondCallPending" &&
    introState.phase === "playing" &&
    audioUnlocked &&
    !pauseOpen &&
    !playerDowned &&
    !warpTransition.active;
  const activeCallId =
    secondCallRuntime.state !== "idle" &&
    secondCallRuntime.state !== "completed"
      ? secondCallRuntime.callId
      : firstCallRuntime.state !== "idle" &&
          firstCallRuntime.state !== "completed"
        ? firstCallRuntime.callId
        : "none";
  const warpTriggerLocked =
    warpState !== "available" ||
    warpTransition.active ||
    performance.now() < warpCooldownUntil;

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
      if (import.meta.env.DEV && event.key === "F6") {
        event.preventDefault();
        handleWarpEnter(true);
      }
      if (import.meta.env.DEV && event.key === "F7") {
        event.preventDefault();
        setPlayerPositionBeforeWarp([
          Number(playerPositionRef.current.x.toFixed(3)),
          Number(playerPositionRef.current.y.toFixed(3)),
          Number(playerPositionRef.current.z.toFixed(3)),
        ]);
        setPlayerPositionAfterWarp(null);
        performWarpTeleport();
      }
      if (import.meta.env.DEV && event.key === "F8") {
        event.preventDefault();
        setSecondCallTriggerToken((current) => current + 1);
        setNarrativePhase("secondCallPlaying");
      }
      if (import.meta.env.DEV && event.key === "F9") {
        event.preventDefault();
        setSecondCallResetToken((current) => current + 1);
        setNarrativePhase(
          loopCount >= 1 ? "secondCallPending" : "firstCallPending"
        );
      }
      if (
        import.meta.env.DEV &&
        event.key.toLowerCase() === WARP_CONFIG.debugToggleKey
      ) {
        setWarpTriggerDebugVisible((current) => !current);
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
  }, [
    audioUnlocked,
    handleWarpEnter,
    introState.phase,
    loopCount,
    performWarpTeleport,
    unlockAudio,
  ]);

  React.useEffect(() => {
    if (introState.phase !== "playing") return;
    setNarrativePhase((current) =>
      current === "intro" ? "firstCallPending" : current
    );
  }, [introState.phase]);

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

  React.useEffect(
    () => () => {
      if (damageFadeTimerRef.current !== null) window.clearTimeout(damageFadeTimerRef.current);
      if (warpCooldownTimerRef.current !== null) window.clearTimeout(warpCooldownTimerRef.current);
      damageAudioRef.current?.pause();
      damageAudioRef.current = null;
    },
    []
  );

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
            ambienceEnabled={
              audioUnlocked && introState.neonPlayed
            }
            controlState={effectiveControlState}
            introCameraState={introCameraState}
            backgroundFadeInMs={INTRO_AUDIO.backgroundFadeInMs}
            backgroundStartDelayMs={INTRO_AUDIO.backgroundStartDelayMs}
            backgroundVolumeTransitionMs={
              introState.ambienceReady && !introState.introAudioFinished
                ? INTRO_AUDIO.backgroundCrossfadeMs
                : FIRST_CALL_CONFIG.fadeDurationMs
            }
            onPlayerMoved={() => setPlayerMoved(true)}
            restartToken={restartToken}
            teleportToken={teleportToken}
            onTeleportComplete={setPlayerPositionAfterWarp}
            footstepVolume={footstepVolume}
            backgroundVolume={effectiveBackgroundVolume}
            onFootstepVolumeChange={setFootstepVolume}
            onBackgroundVolumeChange={setBackgroundVolume}
            damageImpulseToken={damageToken}
            playerDowned={playerDowned}
            recoveryToken={recoveryToken}
          />
          <MonsterPresenceController
            modules={objects}
            collisionBounds={bounds}
            playerPositionRef={playerPositionRef}
            introPhase={introState.phase}
            active={
              introState.phase === "playing" &&
              !pauseOpen &&
              !callSequenceActive
            }
            onDebugChange={setMonsterDebug}
            onPlayerDamage={handlePlayerDamage}
            playerDowned={playerDowned}
            spawnCycleToken={monsterSpawnCycleToken}
            narrativeEnabled={monsterLoopState === "firstLoopActive"}
          />
          <MysticWarpPortal
            playerPositionRef={playerPositionRef}
            state={warpState}
            audioEnabled={
              audioUnlocked && !pauseOpen && !warpTransition.active
            }
            triggerDebugVisible={import.meta.env.DEV && warpTriggerDebugVisible}
            onEnter={handleWarpEnter}
            onDebugChange={setWarpDebug}
          />
        </Suspense>

        {overviewMode && (
          <>
            <OverviewCamera enabled={overviewMode} target={mapCenter} />
            <OrbitalPositionMarkers
              playerPositionRef={playerPositionRef}
              monsterPosition={monsterDebug.position}
              monsterVisible={monsterDebug.visible && monsterDebug.loaded}
            />
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

      <WarpTransitionOverlay
        state={warpTransition.state}
        reducedMotion={reducedMotion}
      />

      {debugConsoleVisible && warpTransition.active && (
        <div className="developer-r3f-portal-message">
          Transition du portail
        </div>
      )}

      {damageOverlayState !== "hidden" && (
        <div
          className={`developer-r3f-damage-overlay is-${damageOverlayState}${playerDowned ? " is-downed" : ""}`}
          aria-hidden="true"
        >
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
      )}

      {playerDowned && (
        <div className="developer-r3f-recover" onClick={handleRecover}>
          <button type="button">
            <span>Appuyer pour se relever</span>
          </button>
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

      <NarrativeCallController
        key={`first-call-${restartToken}`}
        config={FIRST_CALL_CONFIG}
        ready={
          introState.phase === "playing" &&
          audioUnlocked &&
          loopCount === 0
        }
        audioUnlocked={audioUnlocked}
        reducedMotion={reducedMotion}
        resetToken={restartToken}
        onRuntimeChange={handleFirstCallRuntimeChange}
      />

      <NarrativeCallController
        key={`second-call-${secondCallResetToken}`}
        config={SECOND_CALL_CONFIG}
        ready={secondCallReady}
        audioUnlocked={audioUnlocked}
        reducedMotion={reducedMotion}
        resetToken={secondCallResetToken}
        triggerToken={secondCallTriggerToken}
        onRuntimeChange={handleSecondCallRuntimeChange}
      />

      {introState.phase === "playing" &&
        !pauseOpen &&
        !callSequenceActive &&
        !warpTransition.active && (
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

      {debugConsoleVisible && (DEBUG_PLAYER || DEBUG_COLLISIONS || import.meta.env.DEV) && (
        <div className="developer-r3f-debug">
          <strong>Debug Console</strong>
          <span>Position: {debug.position.join(", ")}</span>
          <span>Velocity: {debug.velocity.join(", ")}</span>
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
          <span>Warp state: {warpDebug.state}</span>
          <span>Warp transition: {warpTransition.state}</span>
          <span>Warp outcome: {resolvedWarpOutcome}</span>
          <span>Warp trigger locked: {warpTriggerLocked ? "yes" : "no"}</span>
          <span>
            Warp cooldown:{" "}
            {Math.max(0, warpCooldownUntil - performance.now()).toFixed(0)} ms
          </span>
          <span>Warp distance: {warpDebug.distance.toFixed(2)} m</span>
          <span>Warp trigger active: {warpDebug.triggerActive ? "yes" : "no"}</span>
          <span>Warp position: {warpDebug.position.join(", ")}</span>
          <span>Warp intensity: {warpDebug.intensity.toFixed(2)}</span>
          <span>Player inside warp: {warpDebug.playerInsideTrigger ? "yes" : "no"}</span>
          <span>Warp trigger helper: {warpTriggerDebugVisible ? "on" : "off"} / {WARP_CONFIG.debugToggleKey.toUpperCase()}</span>
          <span>Narrative phase: {narrativePhase}</span>
          <span>Loop count: {loopCount}</span>
          <span>
            Player before warp: {playerPositionBeforeWarp?.join(", ") ?? "none"}
          </span>
          <span>
            Player after warp: {playerPositionAfterWarp?.join(", ") ?? "none"}
          </span>
          <span>Active call ID: {activeCallId}</span>
          <span>
            Second call scheduled: {secondCallRuntime.state === "scheduled" ? "yes" : "no"}
          </span>
          <span>Second call state: {secondCallRuntime.state}</span>
          <span>Monster loop state: {monsterLoopState}</span>
          <span>Warp debug: F6 enter / F7 spawn / F8 second call / F9 reset second</span>
          <span>Player hits: {playerHitCount}</span>
          <span>Player downed: {playerDowned ? "yes" : "no"}</span>
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
          <span>Intro audio finished: {introState.introAudioFinished ? "yes" : "no"}</span>
          <span>Ambience handoff ready: {introState.ambienceReady ? "yes" : "no"}</span>
          <span>First call state: {firstCallRuntime.state}</span>
          <span>First call timer: {firstCallRuntime.timerActive ? "active" : "inactive"}</span>
          <span>First call ringing: {firstCallRuntime.ringingAudioActive ? "active" : "inactive"}</span>
          <span>
            First call voice: {firstCallRuntime.voiceCurrentTime.toFixed(2)} /{" "}
            {firstCallRuntime.voiceDuration.toFixed(2)}
          </span>
          <span>First call cue: {firstCallRuntime.currentCueIndex}</span>
          <span>First call audio unlocked: {firstCallRuntime.audioUnlocked ? "yes" : "no"}</span>
          <span>
            First call look suspended:{" "}
            {firstCallRuntime.controlsSuspended ? "yes" : "no"}
          </span>
          <span>First call completed: {firstCallRuntime.completed ? "yes" : "no"}</span>
          <span>First call error: {firstCallRuntime.error ?? "none"}</span>
          <span>Monster loaded: {monsterDebug.loaded ? "yes" : "no"}</span>
          <span>Monster visible: {monsterDebug.visible ? "yes" : "no"} / N</span>
          <span>Monster state: {monsterDebug.state}</span>
          <span>Monster AI: {monsterDebug.aiMode}</span>
          <span>Monster blocked: {monsterDebug.blocked ? "yes" : "no"}</span>
          <span>
            Monster speed: {monsterDebug.measuredSpeed.toFixed(3)} /{" "}
            {monsterDebug.expectedSpeed.toFixed(3)}
          </span>
          <span>Monster progress ratio: {monsterDebug.movementRatio.toFixed(2)}</span>
          <span>Monster unstuck left turns: {monsterDebug.unstuckTurns}</span>
          <span>Monster distance since idle: {monsterDebug.distanceSinceIdle.toFixed(2)}</span>
          <span>Monster player dist: {monsterDebug.playerDistance ?? "none"}</span>
          <span>Monster path: {monsterDebug.assetPath}</span>
          <span>Monster anim: {monsterDebug.currentAnimation ?? "none"}</span>
          <span>Monster anim index: {monsterDebug.animationIndex}</span>
          <span>Monster clips: {monsterDebug.clipCount} / J K H U I G</span>
          <span>Monster clip names: {monsterDebug.clipNames.slice(0, 8).join(", ") || "none"}{monsterDebug.clipNames.length > 8 ? "..." : ""}</span>
          <span>Monster scale: {monsterDebug.scale.toFixed(4)}</span>
          <span>Monster rotY: {monsterDebug.rotationY.toFixed(3)}</span>
          <span>Monster pos: {monsterDebug.position.join(", ")}</span>
          <span>Monster height: {monsterDebug.estimatedHeight.toFixed(3)}</span>
          <span>Monster meshes: {monsterDebug.meshCount}</span>
          <span>Monster skinned: {monsterDebug.skinnedMeshCount}</span>
          <span>Monster materials: {monsterDebug.materialCount}</span>
          <span>Monster missing textures: {monsterDebug.missingTextures.join(", ") || "none"}</span>
          <span>Monster load ms: {monsterDebug.loadTimeMs}</span>
          <span>Monster error: {monsterDebug.error ?? "none"}</span>
        </div>
      )}
    </>
  );
};
