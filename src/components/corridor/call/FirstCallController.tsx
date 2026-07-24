import React from "react";
import {
  useFirstCallSequence,
  type FirstCallRuntime,
} from "../../../hooks/useFirstCallSequence";
import { FirstCallOverlay } from "./FirstCallOverlay";
import "./FirstCall.scss";

interface FirstCallControllerProps {
  ready: boolean;
  audioUnlocked: boolean;
  reducedMotion: boolean;
  resetToken: number;
  onRuntimeChange: (runtime: FirstCallRuntime) => void;
}

export const FirstCallController: React.FC<FirstCallControllerProps> = ({
  ready,
  audioUnlocked,
  reducedMotion,
  resetToken,
  onRuntimeChange,
}) => {
  const { runtime, currentCue, answer } = useFirstCallSequence({
    ready,
    audioUnlocked,
    resetToken,
  });

  React.useEffect(() => {
    onRuntimeChange(runtime);
  }, [onRuntimeChange, runtime]);

  return (
    <FirstCallOverlay
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
