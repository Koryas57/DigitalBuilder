import React from "react";
import {
  CONTROL_HINT_DELAY_MS,
  CONTROL_HINT_DURATION_MS,
  DEFAULT_INTRO_CAMERA_STATE,
  type IntroCameraState,
  type PlayerControlState,
} from "./introConfig";
import { IntroCameraController } from "./IntroCameraController";
import { IntroOverlay } from "./IntroOverlay";
import { useIntroSequence } from "./useIntroSequence";
import type { ExperiencePhase } from "./introConfig";

export interface IntroRuntimeState {
  phase: ExperiencePhase;
  introEnabled: boolean;
  sentenceIndex: number;
  cameraProgress: number;
  currentFov: number;
  neonPlayed: boolean;
  backgroundAudioState: "locked" | "fade-in" | "playing";
  controlState: PlayerControlState;
}

export const INITIAL_INTRO_RUNTIME_STATE: IntroRuntimeState = {
  phase: "loading",
  introEnabled: true,
  sentenceIndex: -1,
  cameraProgress: 0,
  currentFov: DEFAULT_INTRO_CAMERA_STATE.fov,
  neonPlayed: false,
  backgroundAudioState: "locked",
  controlState: {
    controlsEnabled: false,
    movementEnabled: false,
    lookEnabled: false,
    headBobEnabled: false,
    sprintEnabled: false,
  },
};

interface IntroManagerProps {
  mapReady: boolean;
  audioUnlocked: boolean;
  reducedMotion: boolean;
  finalYaw: number;
  playerMoved: boolean;
  onRequestAudioUnlock: () => void;
  onIntroStateChange: (state: IntroRuntimeState) => void;
  onCameraStateChange: (state: IntroCameraState) => void;
}

export const IntroManager: React.FC<IntroManagerProps> = ({
  mapReady,
  audioUnlocked,
  reducedMotion,
  finalYaw,
  playerMoved,
  onRequestAudioUnlock,
  onIntroStateChange,
  onCameraStateChange,
}) => {
  const sequence = useIntroSequence({ mapReady, audioUnlocked, reducedMotion });
  const [cameraState, setCameraState] = React.useState<IntroCameraState>(
    DEFAULT_INTRO_CAMERA_STATE
  );
  const [controlsHintVisible, setControlsHintVisible] = React.useState(false);

  const handleCameraStateChange = React.useCallback(
    (state: IntroCameraState) => {
      setCameraState(state);
      onCameraStateChange(state);
    },
    [onCameraStateChange]
  );

  React.useEffect(() => {
    if (sequence.phase !== "playing" || playerMoved) {
      setControlsHintVisible(false);
      return undefined;
    }

    const showTimer = window.setTimeout(() => {
      if (!playerMoved) setControlsHintVisible(true);
    }, CONTROL_HINT_DELAY_MS);
    const hideTimer = window.setTimeout(() => {
      setControlsHintVisible(false);
    }, CONTROL_HINT_DELAY_MS + CONTROL_HINT_DURATION_MS);

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, [playerMoved, sequence.phase]);

  React.useEffect(() => {
    if (playerMoved) setControlsHintVisible(false);
  }, [playerMoved]);

  React.useEffect(() => {
    onIntroStateChange({
      phase: sequence.phase,
      introEnabled: sequence.introEnabled,
      sentenceIndex: sequence.sentenceIndex,
      cameraProgress: sequence.cameraProgress,
      currentFov: cameraState.fov,
      neonPlayed: sequence.neonPlayed,
      backgroundAudioState: !audioUnlocked
        ? "locked"
        : sequence.phase === "playing"
          ? "playing"
          : "fade-in",
      controlState: sequence.controlState,
    });
  }, [
    audioUnlocked,
    cameraState.fov,
    onIntroStateChange,
    sequence.cameraProgress,
    sequence.controlState,
    sequence.introEnabled,
    sequence.neonPlayed,
    sequence.phase,
    sequence.sentenceIndex,
  ]);

  return (
    <>
      <IntroCameraController
        phase={sequence.phase}
        finalYaw={finalYaw}
        progress={sequence.cameraProgress}
        reducedMotion={reducedMotion}
        onCameraStateChange={handleCameraStateChange}
      />
      <IntroOverlay
        phase={sequence.phase}
        audioUnlocked={audioUnlocked}
        overlayOpacity={sequence.overlayOpacity}
        sentenceIndex={sequence.sentenceIndex}
        sentenceVisible={sequence.sentenceVisible}
        sentenceDissolving={sequence.sentenceDissolving}
        controlsHintVisible={controlsHintVisible}
        onEnter={onRequestAudioUnlock}
      />
    </>
  );
};
