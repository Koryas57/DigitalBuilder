import React from "react";
import {
  useNarrativeCallSequence,
  type NarrativeCallRuntime,
} from "../../../hooks/useNarrativeCallSequence";
import type { NarrativeCallConfig } from "../../../data/narrativeCallConfig";
import { NarrativeCallOverlay } from "./NarrativeCallOverlay";
import "./FirstCall.scss";

interface NarrativeCallControllerProps {
  config: NarrativeCallConfig;
  ready: boolean;
  audioUnlocked: boolean;
  reducedMotion: boolean;
  resetToken: number;
  triggerToken?: number;
  onRuntimeChange: (runtime: NarrativeCallRuntime) => void;
}

export const NarrativeCallController: React.FC<NarrativeCallControllerProps> = ({
  config,
  ready,
  audioUnlocked,
  reducedMotion,
  resetToken,
  triggerToken = 0,
  onRuntimeChange,
}) => {
  const { runtime, currentCue, answer } = useNarrativeCallSequence({
    config,
    ready,
    audioUnlocked,
    resetToken,
    triggerToken,
  });

  React.useEffect(() => {
    onRuntimeChange(runtime);
  }, [onRuntimeChange, runtime]);

  return (
    <NarrativeCallOverlay
      config={config}
      state={runtime.state}
      cue={currentCue}
      reducedMotion={reducedMotion}
      objectiveVisible={runtime.objectiveVisible}
      resumeHintVisible={runtime.resumeHintVisible}
      error={runtime.error}
      onAnswer={answer}
    />
  );
};
