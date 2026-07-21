import React from "react";
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  EMPTY_MONSTER_DEBUG_STATE,
  MONSTER_MUTANT_CONFIG,
  type MonsterDebugState,
  type MonsterPresenceState,
  type MonsterSemanticAnimation,
} from "../../../data/monsterMutantConfig";
import { useFBXCharacter } from "../../../hooks/useFBXCharacter";
import { useMonsterAnimations } from "../../../hooks/useMonsterAnimations";
import { corridorAudioManager } from "../../developer/corridor/audio/AudioManager";
import {
  resolveCorridorCollision,
  type CorridorBounds,
} from "../../developer/corridor/CorridorCollisionSystem";
import { PLAYER_HEIGHT } from "../../developer/corridor/CorridorSpawn";

interface MonsterMutantProps {
  visible: boolean;
  position: [number, number, number];
  rotationY: number;
  scale?: number;
  initialAnimation?: MonsterSemanticAnimation | string;
  keyboardEnabled: boolean;
  active: boolean;
  playerPositionRef: React.MutableRefObject<THREE.Vector3>;
  collisionBounds: CorridorBounds[];
  state: MonsterPresenceState;
  onDebugChange: (debug: MonsterDebugState) => void;
  onPlayerDamage?: () => void;
}

const isEditableTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;
  const tagName = target.tagName.toLowerCase();
  return tagName === "input" || tagName === "textarea" || tagName === "select" || target.isContentEditable;
};

const horizontalDistance = (left: THREE.Vector3, right: THREE.Vector3) => {
  const dx = left.x - right.x;
  const dz = left.z - right.z;
  return Math.sqrt(dx * dx + dz * dz);
};

const forwardFromYaw = (yaw: number) => new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));

const yawFromDirection = (direction: THREE.Vector3) =>
  Math.atan2(-direction.x, -direction.z);

const normalizeYawDelta = (delta: number) => Math.atan2(Math.sin(delta), Math.cos(delta));

const sampleClearance = (
  from: THREE.Vector3,
  yaw: number,
  bounds: CorridorBounds[],
  maxDistance: number
) => {
  if (!bounds.length) return maxDistance;
  const forward = forwardFromYaw(yaw);
  const origin = new THREE.Vector3(from.x, PLAYER_HEIGHT, from.z);
  let previous = origin;

  for (let distance = 0.22; distance <= maxDistance; distance += 0.22) {
    const desired = origin.clone().addScaledVector(forward, distance);
    const collision = resolveCorridorCollision(
      previous,
      desired,
      bounds,
      MONSTER_MUTANT_CONFIG.ai.collisionRadius
    );
    if (collision.collided) return Math.max(0, distance - 0.22);
    previous = collision.position;
  }

  return maxDistance;
};

const hasLineOfSight = (
  from: THREE.Vector3,
  to: THREE.Vector3,
  bounds: CorridorBounds[]
) => {
  if (!bounds.length) return true;
  const origin = new THREE.Vector3(from.x, PLAYER_HEIGHT, from.z);
  const target = new THREE.Vector3(to.x, PLAYER_HEIGHT, to.z);
  const distance = origin.distanceTo(target);
  if (distance <= 0.01) return true;
  const direction = target.clone().sub(origin).normalize();
  let previous = origin;

  for (let sample = 0.35; sample < distance; sample += 0.35) {
    const desired = origin.clone().addScaledVector(direction, sample);
    const collision = resolveCorridorCollision(
      previous,
      desired,
      bounds,
      MONSTER_MUTANT_CONFIG.ai.collisionRadius
    );
    if (collision.collided) return false;
    previous = collision.position;
  }

  return true;
};

const chooseOpenYaw = (
  position: THREE.Vector3,
  currentYaw: number,
  bounds: CorridorBounds[]
) => {
  const candidates = [
    0,
    Math.PI * 0.18,
    -Math.PI * 0.18,
    Math.PI * 0.5,
    -Math.PI * 0.5,
    Math.PI * 0.72,
    -Math.PI * 0.72,
    Math.PI,
  ];

  return candidates
    .map((offset) => {
      const yaw = currentYaw + offset;
      return {
        yaw,
        clearance: sampleClearance(position, yaw, bounds, 2.35) - Math.abs(offset) * 0.12,
      };
    })
    .sort((left, right) => right.clearance - left.clearance)[0]?.yaw ?? currentYaw + Math.PI;
};

const chooseAvoidanceYaw = (
  position: THREE.Vector3,
  desiredYaw: number,
  currentYaw: number,
  bounds: CorridorBounds[]
) => {
  const candidates = [
    desiredYaw,
    currentYaw,
    desiredYaw + Math.PI * 0.22,
    desiredYaw - Math.PI * 0.22,
    desiredYaw + Math.PI * 0.38,
    desiredYaw - Math.PI * 0.38,
    currentYaw + Math.PI * 0.5,
    currentYaw - Math.PI * 0.5,
  ];

  return candidates
    .map((yaw) => {
      const alignmentPenalty = Math.abs(normalizeYawDelta(yaw - desiredYaw)) * 0.22;
      return {
        yaw,
        score: sampleClearance(position, yaw, bounds, 2.2) - alignmentPenalty,
      };
    })
    .sort((left, right) => right.score - left.score)[0]?.yaw ?? chooseOpenYaw(position, currentYaw, bounds);
};

export const MonsterMutant: React.FC<MonsterMutantProps> = ({
  visible,
  position,
  rotationY,
  scale = MONSTER_MUTANT_CONFIG.scale,
  initialAnimation = "idle",
  keyboardEnabled,
  active,
  playerPositionRef,
  collisionBounds,
  state,
  onDebugChange,
  onPlayerDamage,
}) => {
  const { model, clips, loading, error, metadata } = useFBXCharacter(
    MONSTER_MUTANT_CONFIG.assetPath,
    MONSTER_MUTANT_CONFIG.enabled,
    MONSTER_MUTANT_CONFIG.debug
  );
  const animation = useMonsterAnimations(
    model,
    clips,
    visible,
    initialAnimation,
    MONSTER_MUTANT_CONFIG.debug
  );
  const positionRef = React.useRef(new THREE.Vector3(...position));
  const yawRef = React.useRef(rotationY);
  const targetYawRef = React.useRef(rotationY);
  const aiModeRef = React.useRef<MonsterPresenceState>("waiting");
  const currentSemanticRef = React.useRef<string | null>(null);
  const idleUntilRef = React.useRef(0);
  const nextIdleAtRef = React.useRef(0);
  const rageUntilRef = React.useRef(0);
  const lastSeenPlayerAtRef = React.useRef(0);
  const chaseStartedAtRef = React.useRef(0);
  const recoveryUntilRef = React.useRef(0);
  const lastAttackAtRef = React.useRef(0);
  const attackCountRef = React.useRef(0);
  const stopAfterAttacksAtRef = React.useRef(0);
  const encounterCompleteRef = React.useRef(false);
  const turnDecisionLockedUntilRef = React.useRef(0);
  const lastSoundCueRef = React.useRef<string | null>(null);
  const monsterCueCooldownUntilRef = React.useRef({
    idle: 0,
    walk: 0,
  });
  const lastMoveCheckAtRef = React.useRef(0);
  const lastMoveCheckPositionRef = React.useRef(new THREE.Vector3(...position));
  const aiSnapshotAtRef = React.useRef(0);
  const spawnedRef = React.useRef(false);
  const hitTimersRef = React.useRef<number[]>([]);
  const [aiSnapshot, setAiSnapshot] = React.useState({
    mode: "waiting",
    playerDistance: null as number | null,
    blocked: false,
    position: position as [number, number, number],
  });

  const adjustedPosition = React.useMemo<[number, number, number]>(
    () => [
      position[0],
      position[1] + MONSTER_MUTANT_CONFIG.verticalOffset + MONSTER_MUTANT_CONFIG.debugAdjustments.positionY,
      position[2],
    ],
    [position]
  );
  const adjustedRotationY =
    rotationY +
    MONSTER_MUTANT_CONFIG.rotationOffsetY +
    MONSTER_MUTANT_CONFIG.debugAdjustments.rotationY +
    MONSTER_MUTANT_CONFIG.debugAdjustments.frontOrientationY;
  const adjustedScale = scale * (MONSTER_MUTANT_CONFIG.debugAdjustments.scale / MONSTER_MUTANT_CONFIG.scale);

  const playSemantic = React.useCallback(
    (
      semantic: MonsterSemanticAnimation,
      options: Parameters<typeof animation.playBySemantic>[1] = {}
    ) => {
      const key = `${semantic}:${options.loop === false ? "once" : "loop"}:${options.timeScale ?? 1}`;
      if (currentSemanticRef.current === key && semantic !== "attack") return;
      const played = animation.playBySemantic(semantic, options);
      if (played) currentSemanticRef.current = key;
    },
    [animation]
  );

  const getDistanceVolume = React.useCallback((baseVolume: number, playerDistance: number) => {
    const audio = MONSTER_MUTANT_CONFIG.audio;
    if (playerDistance > audio.audibleDistance) return 0;

    const fade = THREE.MathUtils.clamp(
      1 - ((playerDistance - audio.nearDistance) / (audio.audibleDistance - audio.nearDistance)),
      0,
      1
    );

    return baseVolume * THREE.MathUtils.lerp(0.18, 1, fade);
  }, []);

  const playMonsterCue = React.useCallback((cue: "idle" | "walk" | "rage", playerDistance: number) => {
    const audio = MONSTER_MUTANT_CONFIG.audio;
    if (cue === "idle" || cue === "walk") {
      const cooldownUntil = monsterCueCooldownUntilRef.current[cue];
      if (performance.now() < cooldownUntil) return;

      const distanceVolume = getDistanceVolume(
        cue === "idle" ? audio.idleVolume : audio.walkVolume,
        playerDistance
      );
      if (distanceVolume <= 0) return;

      monsterCueCooldownUntilRef.current[cue] =
        performance.now() + (cue === "idle" ? audio.idleCooldownMs : audio.walkCooldownMs);
      lastSoundCueRef.current = cue;
      corridorAudioManager.playOneShot(
        cue === "idle" ? audio.idle : audio.walk,
        distanceVolume,
        cue === "idle" ? audio.idleCooldownMs : audio.walkCooldownMs
      );
      return;
    }

    if (lastSoundCueRef.current === cue) return;
    lastSoundCueRef.current = cue;
    if (cue === "rage") corridorAudioManager.playOneShot(audio.rage, audio.rageVolume, 2200);
  }, [getDistanceVolume]);

  const playAttackImpact = React.useCallback((attackIndex: number) => {
    const audio = MONSTER_MUTANT_CONFIG.audio;
    const hitSrc = audio.hits[attackIndex % audio.hits.length];
    const timer = window.setTimeout(() => {
      corridorAudioManager.playOneShot(hitSrc, audio.hitVolume, 520);
      onPlayerDamage?.();
    }, 360);
    hitTimersRef.current.push(timer);
  }, [onPlayerDamage]);

  React.useEffect(() => {
    spawnedRef.current = false;
    positionRef.current.set(adjustedPosition[0], adjustedPosition[1], adjustedPosition[2]);
    yawRef.current = rotationY;
    targetYawRef.current = rotationY;
    aiModeRef.current = "waiting";
    idleUntilRef.current = performance.now() + 1400;
    nextIdleAtRef.current = 0;
    lastSeenPlayerAtRef.current = 0;
    chaseStartedAtRef.current = 0;
    recoveryUntilRef.current = 0;
    attackCountRef.current = 0;
    stopAfterAttacksAtRef.current = 0;
    encounterCompleteRef.current = false;
    lastSoundCueRef.current = null;
    monsterCueCooldownUntilRef.current = {
      idle: 0,
      walk: 0,
    };
    lastMoveCheckPositionRef.current.copy(positionRef.current);
  }, [adjustedPosition, rotationY]);

  React.useEffect(
    () => () => {
      hitTimersRef.current.forEach((timer) => window.clearTimeout(timer));
      hitTimersRef.current = [];
    },
    []
  );

  React.useEffect(() => {
    if (!model || spawnedRef.current) return;
    spawnedRef.current = true;
    model.position.copy(positionRef.current);
    model.rotation.y =
      yawRef.current +
      MONSTER_MUTANT_CONFIG.rotationOffsetY +
      MONSTER_MUTANT_CONFIG.debugAdjustments.rotationY +
      MONSTER_MUTANT_CONFIG.debugAdjustments.frontOrientationY;
  }, [model]);

  useFrame((_, delta) => {
    if (!model || !visible) return;

    const now = performance.now();
    const ai = MONSTER_MUTANT_CONFIG.ai;

    if (!active || !ai.enabled) {
      playSemantic("idle", { fadeDuration: 0.16 });
      model.position.copy(positionRef.current);
      model.rotation.y = yawRef.current + MONSTER_MUTANT_CONFIG.debugAdjustments.frontOrientationY;
      return;
    }

    const position = positionRef.current;
    const playerPosition = playerPositionRef.current;
    const playerDistance = horizontalDistance(position, playerPosition);
    const toPlayer = new THREE.Vector3(
      playerPosition.x - position.x,
      0,
      playerPosition.z - position.z
    );
    const hasPlayerDirection = toPlayer.lengthSq() > 0.001;
    if (hasPlayerDirection) toPlayer.normalize();

    const forward = forwardFromYaw(yawRef.current);
    const seesPlayer =
      playerDistance <= ai.detectionRadius &&
      hasPlayerDirection &&
      (forward.dot(toPlayer) >= ai.detectionConeDot || playerDistance <= 2.2) &&
      hasLineOfSight(position, playerPosition, collisionBounds);
    if (seesPlayer) lastSeenPlayerAtRef.current = now;

    let blocked = false;
    let speed: number = ai.walkSpeed;
    const shouldKeepChasing =
      aiModeRef.current === "chasing" &&
      playerDistance <= ai.loseSightDistance &&
      now - lastSeenPlayerAtRef.current <= ai.loseSightGraceMs &&
      now - chaseStartedAtRef.current <= ai.chaseBurstMs;

    if (
      seesPlayer &&
      !encounterCompleteRef.current &&
      aiModeRef.current !== "reacting" &&
      aiModeRef.current !== "chasing" &&
      aiModeRef.current !== "attacking"
    ) {
      aiModeRef.current = "reacting";
      const rageDurationMs = Math.max(
        ai.rageDurationMs,
        (animation.semanticDurations.rage ?? 0) * 1000
      );
      rageUntilRef.current = now + rageDurationMs;
      chaseStartedAtRef.current = now + rageDurationMs;
      attackCountRef.current = 0;
      stopAfterAttacksAtRef.current = 0;
      currentSemanticRef.current = null;
      lastSoundCueRef.current = null;
      playMonsterCue("rage", playerDistance);
      playSemantic("rage", {
        loop: false,
        clampWhenFinished: true,
        fadeDuration: 0.12,
        timeScale: 1.05,
      });
    }

    if (aiModeRef.current === "reacting") {
      speed = 0;
      if (hasPlayerDirection) targetYawRef.current = yawFromDirection(toPlayer);
      if (now >= rageUntilRef.current) {
        aiModeRef.current = "chasing";
        chaseStartedAtRef.current = now;
        currentSemanticRef.current = null;
        lastSoundCueRef.current = null;
      }
    }

    if (aiModeRef.current === "chasing" && !shouldKeepChasing && !seesPlayer) {
      aiModeRef.current = "waiting";
      recoveryUntilRef.current = now + ai.recoveryMs;
      idleUntilRef.current = recoveryUntilRef.current;
      nextIdleAtRef.current = 0;
      currentSemanticRef.current = null;
    }

    if (aiModeRef.current === "chasing" || (seesPlayer && aiModeRef.current !== "reacting" && aiModeRef.current !== "attacking")) {
      if (playerDistance <= ai.attackDistance) {
        lastAttackAtRef.current = now - ai.attackCooldownMs;
        aiModeRef.current = "attacking";
      } else {
        aiModeRef.current = "chasing";
        speed = ai.runSpeed;
        if (hasPlayerDirection) {
          const desiredYaw = yawFromDirection(toPlayer);
          const directClearance = sampleClearance(position, desiredYaw, collisionBounds, ai.scanDistance);
          targetYawRef.current =
            directClearance < ai.scanDistance * 0.72
              ? chooseAvoidanceYaw(position, desiredYaw, yawRef.current, collisionBounds)
              : desiredYaw;
          blocked = directClearance < ai.scanDistance * 0.72;
        }
        playSemantic("run", {
          fadeDuration: 0.08,
          timeScale: 0.92,
        });
      }
    }

    if (aiModeRef.current === "attacking") {
      speed = 0;
      if (hasPlayerDirection) targetYawRef.current = yawFromDirection(toPlayer);
      if (attackCountRef.current >= ai.maxAttackCount) {
        if (!stopAfterAttacksAtRef.current) {
          stopAfterAttacksAtRef.current = now + 850;
        }
        if (now >= stopAfterAttacksAtRef.current) {
          encounterCompleteRef.current = true;
          aiModeRef.current = "waiting";
          recoveryUntilRef.current = now + 999999;
          idleUntilRef.current = recoveryUntilRef.current;
          currentSemanticRef.current = null;
          playSemantic("idle", { fadeDuration: 0.18 });
        }
      } else if (now - lastAttackAtRef.current >= ai.attackCooldownMs) {
        lastAttackAtRef.current = now;
        const attackIndex = attackCountRef.current;
        attackCountRef.current += 1;
        currentSemanticRef.current = null;
        animation.playVariantBySemantic("attack", {
          loop: false,
          clampWhenFinished: true,
          fadeDuration: 0.08,
          timeScale: 1,
        });
        playAttackImpact(attackIndex);
      }
      if (attackCountRef.current < ai.maxAttackCount && playerDistance > ai.attackDistance * 1.25) {
        aiModeRef.current = "chasing";
        chaseStartedAtRef.current = now;
        currentSemanticRef.current = null;
      }
    }

    if (
      aiModeRef.current !== "reacting" &&
      aiModeRef.current !== "chasing" &&
      aiModeRef.current !== "attacking"
    ) {
      if (now < idleUntilRef.current || now < recoveryUntilRef.current) {
        aiModeRef.current = "waiting";
        speed = 0;
        playMonsterCue("idle", playerDistance);
        playSemantic("idle", { fadeDuration: 0.2 });
      } else {
        aiModeRef.current = "hunting";
        speed = ai.walkSpeed;
        if (hasPlayerDirection) targetYawRef.current = yawFromDirection(toPlayer);
        playMonsterCue("walk", playerDistance);
        playSemantic("walk", { fadeDuration: 0.2, timeScale: 0.92 });

        if (!nextIdleAtRef.current) {
          nextIdleAtRef.current = now + 3200 + Math.random() * 2600;
        }
        if (now > nextIdleAtRef.current) {
          idleUntilRef.current = now + ai.idleMinMs + Math.random() * (ai.idleMaxMs - ai.idleMinMs);
          nextIdleAtRef.current = 0;
        }

        if (
          now > turnDecisionLockedUntilRef.current &&
          sampleClearance(position, targetYawRef.current, collisionBounds, ai.scanDistance) < ai.scanDistance * 0.78
        ) {
          targetYawRef.current = chooseOpenYaw(position, yawRef.current, collisionBounds);
          turnDecisionLockedUntilRef.current = now + ai.turnDecisionCooldownMs;
          blocked = true;
        }
      }
    }

    const yawDelta = normalizeYawDelta(targetYawRef.current - yawRef.current);
    yawRef.current += THREE.MathUtils.clamp(yawDelta, -ai.turnSpeed * delta, ai.turnSpeed * delta);

    if (speed > 0) {
      const desired = position
        .clone()
        .addScaledVector(forwardFromYaw(yawRef.current), speed * delta);
      const collision = resolveCorridorCollision(
        new THREE.Vector3(position.x, PLAYER_HEIGHT, position.z),
        new THREE.Vector3(desired.x, PLAYER_HEIGHT, desired.z),
        collisionBounds,
        ai.collisionRadius
      );

      if (collision.collided) {
        blocked = true;
        const escapeYaws = [
          targetYawRef.current,
          yawRef.current + Math.PI * 0.28,
          yawRef.current - Math.PI * 0.28,
          yawRef.current + Math.PI * 0.5,
          yawRef.current - Math.PI * 0.5,
          chooseAvoidanceYaw(position, targetYawRef.current, yawRef.current, collisionBounds),
        ];
        const escape = escapeYaws
          .map((yaw) => {
            const escapeDesired = position
              .clone()
              .addScaledVector(forwardFromYaw(yaw), speed * delta * 0.9);
            const escapeCollision = resolveCorridorCollision(
              new THREE.Vector3(position.x, PLAYER_HEIGHT, position.z),
              new THREE.Vector3(escapeDesired.x, PLAYER_HEIGHT, escapeDesired.z),
              collisionBounds,
              ai.collisionRadius
            );
            return {
              yaw,
              collision: escapeCollision,
              moved: horizontalDistance(position, escapeCollision.position),
            };
          })
          .filter((entry) => !entry.collision.collided && entry.moved > 0.015)
          .sort((left, right) => right.moved - left.moved)[0];

        if (escape) {
          position.x = escape.collision.position.x;
          position.z = escape.collision.position.z;
          targetYawRef.current = escape.yaw;
        }
        if (!escape && now > turnDecisionLockedUntilRef.current) {
          targetYawRef.current = chooseAvoidanceYaw(position, targetYawRef.current, yawRef.current, collisionBounds);
          turnDecisionLockedUntilRef.current = now + ai.turnDecisionCooldownMs;
        }
      } else {
        position.x = collision.position.x;
        position.z = collision.position.z;
      }

      if (now - lastMoveCheckAtRef.current > ai.blockedAfterMs) {
        const movedDistance = horizontalDistance(position, lastMoveCheckPositionRef.current);
        if (movedDistance < ai.movementEpsilon) {
          blocked = true;
          if (now > turnDecisionLockedUntilRef.current) {
            targetYawRef.current = chooseOpenYaw(position, yawRef.current, collisionBounds);
            turnDecisionLockedUntilRef.current = now + ai.turnDecisionCooldownMs;
          }
          if (aiModeRef.current === "hunting") {
            aiModeRef.current = "blocked";
          }
        }
        lastMoveCheckAtRef.current = now;
        lastMoveCheckPositionRef.current.copy(position);
      }
    }

    model.position.copy(position);
    model.rotation.y =
      yawRef.current +
      MONSTER_MUTANT_CONFIG.rotationOffsetY +
      MONSTER_MUTANT_CONFIG.debugAdjustments.rotationY +
      MONSTER_MUTANT_CONFIG.debugAdjustments.frontOrientationY;

    if (now - aiSnapshotAtRef.current > 240) {
      aiSnapshotAtRef.current = now;
      setAiSnapshot({
        mode: aiModeRef.current,
        playerDistance: Number(playerDistance.toFixed(2)),
        blocked,
        position: [Number(position.x.toFixed(3)), Number(position.y.toFixed(3)), Number(position.z.toFixed(3))],
      });
    }
  });

  React.useEffect(() => {
    onDebugChange({
      ...EMPTY_MONSTER_DEBUG_STATE,
      loaded: Boolean(model) && !loading && !error,
      visible,
      assetPath: MONSTER_MUTANT_CONFIG.assetPath,
      currentAnimation: animation.currentAnimation,
      animationIndex: animation.currentIndex,
      clipCount: animation.clipCount,
      clipNames: animation.clipNames,
      scale: adjustedScale,
      rotationY: adjustedRotationY,
      position: aiSnapshot.position,
      bounds: metadata.bounds,
      estimatedHeight: metadata.estimatedHeight,
      meshCount: metadata.meshCount,
      skinnedMeshCount: metadata.skinnedMeshCount,
      materialCount: metadata.materialCount,
      missingTextures: metadata.missingTextures,
      loadTimeMs: metadata.loadTimeMs,
      state: loading ? "loading" : state,
      aiMode: aiSnapshot.mode,
      playerDistance: aiSnapshot.playerDistance,
      blocked: aiSnapshot.blocked,
      error,
    });
  }, [
    adjustedPosition,
    adjustedRotationY,
    adjustedScale,
    animation.clipCount,
    animation.clipNames,
    animation.currentAnimation,
    animation.currentIndex,
    error,
    loading,
    metadata.bounds,
    metadata.estimatedHeight,
    metadata.loadTimeMs,
    metadata.materialCount,
    metadata.meshCount,
    metadata.missingTextures,
    metadata.skinnedMeshCount,
    model,
    onDebugChange,
    state,
    aiSnapshot.blocked,
    aiSnapshot.mode,
    aiSnapshot.playerDistance,
    aiSnapshot.position,
    visible,
  ]);

  React.useEffect(() => {
    if (!keyboardEnabled || !visible) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return;
      const key = event.key.toLowerCase();

      if (key === "j") {
        event.preventDefault();
        animation.previousAnimation();
      }
      if (key === "k") {
        event.preventDefault();
        animation.nextAnimation();
      }
      if (key === "h") {
        event.preventDefault();
        animation.replayAnimation();
      }
      if (key === "u") {
        event.preventDefault();
        animation.logAnimations();
      }
      if (key === "i") {
        event.preventDefault();
        animation.playBySemantic("idle", { fadeDuration: 0.12 });
      }
      if (key === "g") {
        event.preventDefault();
        animation.playBySemantic("rage", { fadeDuration: 0.18, loop: false, clampWhenFinished: true });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [animation, keyboardEnabled, visible]);

  if (error || !MONSTER_MUTANT_CONFIG.enabled) return null;

  if (loading && visible && MONSTER_MUTANT_CONFIG.debug) {
    return (
      <Html position={adjustedPosition} center>
        <div className="developer-r3f-debug-label">Chargement mutant</div>
      </Html>
    );
  }

  if (!model || !visible) return null;

  return (
    <primitive
      object={model}
      scale={[adjustedScale, adjustedScale, adjustedScale]}
    />
  );
};
