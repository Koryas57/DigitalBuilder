import React from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { MonsterSemanticAnimation } from "../data/monsterMutantConfig";

interface PlayAnimationOptions {
  loop?: boolean;
  fadeDuration?: number;
  clampWhenFinished?: boolean;
  timeScale?: number;
  reset?: boolean;
}

export interface MonsterAnimationApi {
  currentAnimation: string | null;
  currentIndex: number;
  clipNames: string[];
  clipCount: number;
  semanticClips: Partial<Record<MonsterSemanticAnimation, string>>;
  semanticDurations: Partial<Record<MonsterSemanticAnimation, number>>;
  playAnimation: (name: string, options?: PlayAnimationOptions) => boolean;
  playBySemantic: (semantic: MonsterSemanticAnimation, options?: PlayAnimationOptions) => boolean;
  playVariantBySemantic: (semantic: MonsterSemanticAnimation, options?: PlayAnimationOptions) => boolean;
  nextAnimation: () => void;
  previousAnimation: () => void;
  replayAnimation: () => void;
  logAnimations: () => void;
}

const DEFAULT_FADE_DURATION = 0.22;

const normalize = (value: string) => value.toLowerCase().replace(/[\s_\-.]/g, "");

const selectPreferredClip = (
  clips: THREE.AnimationClip[],
  semantic: MonsterSemanticAnimation
) => {
  const matches = clips.filter((clip) => {
    const name = normalize(clip.name);
    if (semantic === "idle") return name.includes("idle");
    if (semantic === "walk") return name.includes("walk") && !name.includes("back");
    if (semantic === "run") return name.includes("run");
    if (semantic === "walkBack") return name.includes("walkback");
    if (semantic === "rage") return name.includes("rage");
    if (semantic === "attack") return name.includes("attack1") || name.includes("attack");
    if (semantic === "hit") return name.includes("gethit") || name.includes("hit");
    if (semantic === "death") return name.includes("death");
    return false;
  });

  if (!matches.length) return null;

  const preferredNames: Partial<Record<MonsterSemanticAnimation, string[]>> = {
    idle: ["idle1", "idle"],
    walk: ["walk2", "walk"],
    run: ["run1", "run"],
    rage: ["rage"],
    attack: ["attack1", "attack"],
    hit: ["gethit1", "gethit", "hit"],
    death: ["death1", "death2", "death"],
  };

  const preferences = preferredNames[semantic] ?? [];
  return (
    preferences
      .map((preferred) => matches.find((clip) => normalize(clip.name).includes(preferred)))
      .find(Boolean) ?? matches[0]
  );
};

const findSemanticClips = (
  clips: THREE.AnimationClip[],
  semantic: MonsterSemanticAnimation
) =>
  clips.filter((clip) => {
    const name = normalize(clip.name);
    if (semantic === "idle") return name.includes("idle");
    if (semantic === "walk") return name.includes("walk") && !name.includes("back");
    if (semantic === "run") return name.includes("run");
    if (semantic === "walkBack") return name.includes("walkback");
    if (semantic === "rage") return name.includes("rage");
    if (semantic === "attack") return name.includes("attack1") || name.includes("attack");
    if (semantic === "hit") return name.includes("gethit") || name.includes("hit");
    if (semantic === "death") return name.includes("death");
    return false;
  });

export const useMonsterAnimations = (
  model: THREE.Group | null,
  clips: THREE.AnimationClip[],
  visible: boolean,
  initialAnimation: MonsterSemanticAnimation | string = "idle",
  debug = false
): MonsterAnimationApi => {
  const mixerRef = React.useRef<THREE.AnimationMixer | null>(null);
  const actionsRef = React.useRef(new Map<string, THREE.AnimationAction>());
  const currentActionRef = React.useRef<THREE.AnimationAction | null>(null);
  const currentNameRef = React.useRef<string | null>(null);
  const semanticVariantRef = React.useRef<Partial<Record<MonsterSemanticAnimation, number>>>({});
  const [currentAnimation, setCurrentAnimation] = React.useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = React.useState(-1);

  const clipNames = React.useMemo(() => clips.map((clip) => clip.name), [clips]);
  const semanticClips = React.useMemo(() => {
    const nextSemanticClips: Partial<Record<MonsterSemanticAnimation, string>> = {};
    ([
      "idle",
      "walk",
      "run",
      "walkBack",
      "rage",
      "attack",
      "hit",
      "death",
    ] as MonsterSemanticAnimation[]).forEach((semantic) => {
      const clip = selectPreferredClip(clips, semantic);
      if (clip) nextSemanticClips[semantic] = clip.name;
    });
    return nextSemanticClips;
  }, [clips]);
  const semanticDurations = React.useMemo(() => {
    const durations: Partial<Record<MonsterSemanticAnimation, number>> = {};
    ([
      "idle",
      "walk",
      "run",
      "walkBack",
      "rage",
      "attack",
      "hit",
      "death",
    ] as MonsterSemanticAnimation[]).forEach((semantic) => {
      const clipName = semanticClips[semantic];
      const clip = clips.find((entry) => entry.name === clipName);
      if (clip) durations[semantic] = clip.duration;
    });
    return durations;
  }, [clips, semanticClips]);

  React.useEffect(() => {
    if (!model) {
      mixerRef.current = null;
      actionsRef.current.clear();
      currentActionRef.current = null;
      currentNameRef.current = null;
      setCurrentAnimation(null);
      setCurrentIndex(-1);
      return undefined;
    }

    const mixer = new THREE.AnimationMixer(model);
    mixerRef.current = mixer;
    actionsRef.current.clear();

    return () => {
      mixer.stopAllAction();
      mixer.uncacheRoot(model);
      actionsRef.current.clear();
      currentActionRef.current = null;
      mixerRef.current = null;
    };
  }, [model]);

  const logAnimations = React.useCallback(() => {
    console.table(
      clips.map((clip, index) => ({
        index,
        name: clip.name,
        duration: Number(clip.duration.toFixed(3)),
        tracks: clip.tracks.length,
      }))
    );
  }, [clips]);

  const playAnimation = React.useCallback(
    (name: string, options: PlayAnimationOptions = {}) => {
      const mixer = mixerRef.current;
      const modelRoot = model;
      if (!mixer || !modelRoot || !clips.length) {
        if (debug) console.warn("[MonsterMutant] no animation mixer or clip available");
        return false;
      }

      const clip = clips.find((entry) => entry.name === name);
      if (!clip) {
        if (debug) console.warn("[MonsterMutant] clip not found", name);
        return false;
      }

      try {
        const previousAction = currentActionRef.current;
        const action = actionsRef.current.get(clip.name) ?? mixer.clipAction(clip);
        actionsRef.current.set(clip.name, action);

        action.enabled = true;
        action.clampWhenFinished = Boolean(options.clampWhenFinished);
        action.timeScale = options.timeScale ?? 1;
        action.setLoop(options.loop === false ? THREE.LoopOnce : THREE.LoopRepeat, Infinity);
        if (options.reset ?? true) action.reset();

        const fadeDuration = options.fadeDuration ?? DEFAULT_FADE_DURATION;
        if (previousAction && previousAction !== action) {
          previousAction.fadeOut(fadeDuration);
          action.fadeIn(fadeDuration);
        }

        action.play();
        currentActionRef.current = action;
        currentNameRef.current = clip.name;
        setCurrentAnimation(clip.name);
        setCurrentIndex(clips.indexOf(clip));
        if (debug) {
          console.info("[MonsterMutant] play animation", {
            name: clip.name,
            index: clips.indexOf(clip),
            duration: clip.duration,
            fadeDuration,
            timeScale: action.timeScale,
          });
        }
        return true;
      } catch (error) {
        console.warn("[MonsterMutant] animation failed, returning to idle", { name, error });
        const idleName = semanticClips.idle ?? clips[0]?.name;
        if (idleName && idleName !== name) {
          window.setTimeout(() => playAnimation(idleName, { fadeDuration: 0.12 }), 0);
        }
        return false;
      }
    },
    [clips, debug, model, semanticClips.idle]
  );

  const playBySemantic = React.useCallback(
    (semantic: MonsterSemanticAnimation, options?: PlayAnimationOptions) => {
      const clipName = semanticClips[semantic] ?? (semantic === "idle" ? clips[0]?.name : null);
      if (!clipName) return false;
      return playAnimation(clipName, options);
    },
    [clips, playAnimation, semanticClips]
  );

  const playVariantBySemantic = React.useCallback(
    (semantic: MonsterSemanticAnimation, options?: PlayAnimationOptions) => {
      const semanticMatches = findSemanticClips(clips, semantic);
      if (!semanticMatches.length) return playBySemantic(semantic, options);
      const currentVariant = semanticVariantRef.current[semantic] ?? -1;
      const nextVariant = (currentVariant + 1) % semanticMatches.length;
      semanticVariantRef.current[semantic] = nextVariant;
      return playAnimation(semanticMatches[nextVariant].name, options);
    },
    [clips, playAnimation, playBySemantic]
  );

  const nextAnimation = React.useCallback(() => {
    if (!clips.length) return;
    const nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % clips.length;
    playAnimation(clips[nextIndex].name, { fadeDuration: 0.16 });
  }, [clips, currentIndex, playAnimation]);

  const previousAnimation = React.useCallback(() => {
    if (!clips.length) return;
    const nextIndex = currentIndex <= 0 ? clips.length - 1 : currentIndex - 1;
    playAnimation(clips[nextIndex].name, { fadeDuration: 0.16 });
  }, [clips, currentIndex, playAnimation]);

  const replayAnimation = React.useCallback(() => {
    if (currentNameRef.current) {
      playAnimation(currentNameRef.current, { fadeDuration: 0.08, reset: true });
    }
  }, [playAnimation]);

  React.useEffect(() => {
    if (!visible || !clips.length || !model) return;

    const semantic = initialAnimation as MonsterSemanticAnimation;
    const played =
      playBySemantic(semantic, { fadeDuration: 0.05 }) ||
      playAnimation(initialAnimation, { fadeDuration: 0.05 }) ||
      playBySemantic("idle", { fadeDuration: 0.05 });

    if (!played && debug) {
      console.warn("[MonsterMutant] no usable animation found, model remains static");
    }
  }, [clips.length, debug, initialAnimation, model, playAnimation, playBySemantic, visible]);

  React.useEffect(() => {
    if (visible) return;
    mixerRef.current?.stopAllAction();
    currentActionRef.current = null;
    currentNameRef.current = null;
    setCurrentAnimation(null);
    setCurrentIndex(-1);
  }, [visible]);

  useFrame((_, delta) => {
    if (!visible) return;
    mixerRef.current?.update(Math.min(delta, 0.05));
  });

  return {
    currentAnimation,
    currentIndex,
    clipNames,
    clipCount: clips.length,
    semanticClips,
    semanticDurations,
    playAnimation,
    playBySemantic,
    playVariantBySemantic,
    nextAnimation,
    previousAnimation,
    replayAnimation,
    logAnimations,
  };
};
