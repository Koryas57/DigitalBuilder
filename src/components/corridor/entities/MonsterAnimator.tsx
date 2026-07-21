import React from "react";
import * as THREE from "three";
import type { MonsterSemanticAnimation } from "../../../data/monsterMutantConfig";
import {
  useMonsterAnimations,
  type MonsterAnimationApi,
} from "../../../hooks/useMonsterAnimations";

interface MonsterAnimatorProps {
  model: THREE.Group | null;
  clips: THREE.AnimationClip[];
  visible: boolean;
  initialAnimation?: MonsterSemanticAnimation | string;
  debug?: boolean;
  onApiChange: (api: MonsterAnimationApi) => void;
}

export const MonsterAnimator: React.FC<MonsterAnimatorProps> = ({
  model,
  clips,
  visible,
  initialAnimation = "idle",
  debug = false,
  onApiChange,
}) => {
  const api = useMonsterAnimations(model, clips, visible, initialAnimation, debug);

  React.useEffect(() => {
    onApiChange(api);
  }, [api, onApiChange]);

  return null;
};
