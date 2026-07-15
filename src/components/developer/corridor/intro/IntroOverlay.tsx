import React from "react";
import type { ExperiencePhase } from "./introConfig";
import { IntroTextSequence } from "./IntroTextSequence";

interface IntroOverlayProps {
  phase: ExperiencePhase;
  audioUnlocked: boolean;
  overlayOpacity: number;
  sentenceIndex: number;
  sentenceVisible: boolean;
  sentenceDissolving: boolean;
  controlsHintVisible: boolean;
  onEnter: () => void;
}

export const IntroOverlay: React.FC<IntroOverlayProps> = ({
  phase,
  audioUnlocked,
  overlayOpacity,
  sentenceIndex,
  sentenceVisible,
  sentenceDissolving,
  controlsHintVisible,
  onEnter,
}) => {
  const needsUnlock = phase === "loading" && !audioUnlocked;
  const overlayVisible = needsUnlock || phase !== "playing" || overlayOpacity > 0.02;

  return (
    <>
      {overlayVisible && (
        <div
          className={[
            "developer-intro-overlay",
            needsUnlock ? "is-waiting" : "",
            phase === "introReveal" ? "is-revealing" : "",
          ].join(" ")}
          style={{ opacity: needsUnlock ? 1 : overlayOpacity }}
        >
          <div className="developer-intro-grain" aria-hidden="true" />
          {needsUnlock ? (
            <button className="developer-intro-enter" type="button" onClick={onEnter}>
              Entrer
            </button>
          ) : (
            <IntroTextSequence
              sentenceIndex={sentenceIndex}
              visible={sentenceVisible}
              dissolving={sentenceDissolving}
            />
          )}
        </div>
      )}

      {controlsHintVisible && (
        <div className="developer-intro-controls-hint">
          ZQSD / WASD pour avancer
        </div>
      )}
    </>
  );
};
