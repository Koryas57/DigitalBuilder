import React from "react";
import { FiPhoneCall } from "react-icons/fi";
import {
  type NarrativeCallConfig,
  type NarrativeCallState,
} from "../../../data/narrativeCallConfig";
import type { SubtitleCue } from "../../../data/firstCallSubtitles";
import { IncomingCallSlider } from "./IncomingCallSlider";
import { CallSubtitles } from "./CallSubtitles";
import { ObjectiveNotification } from "../objectives/ObjectiveNotification";

interface NarrativeCallOverlayProps {
  config: NarrativeCallConfig;
  state: NarrativeCallState;
  cue: SubtitleCue | null;
  reducedMotion: boolean;
  objectiveVisible: boolean;
  resumeHintVisible: boolean;
  error: string | null;
  onAnswer: () => void;
}

export const NarrativeCallOverlay: React.FC<NarrativeCallOverlayProps> = ({
  config,
  state,
  cue,
  reducedMotion,
  objectiveVisible,
  resumeHintVisible,
  error,
  onAnswer,
}) => {
  const phoneVisible = [
    "ringing",
    "answering",
    "playingMessage",
    "ending",
  ].includes(state);

  return (
    <div
      className={`first-call-layer${reducedMotion ? " is-reduced-motion" : ""}`}
      aria-hidden={!phoneVisible && !objectiveVisible && !resumeHintVisible}
    >
      {phoneVisible && (
        <section
          className={`first-call-panel is-${state}`}
          aria-label={
            state === "ringing" ? "Appel téléphonique entrant" : "Appel téléphonique en cours"
          }
        >
          <div className="first-call-panel__signal" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <div className="first-call-panel__heading">
            <span>
              {state === "ringing"
                ? config.incomingLabel
                : state === "ending"
                  ? config.completedLabel
                  : "APPEL EN COURS"}
            </span>
            <strong>{config.caller}</strong>
          </div>
          <div className="first-call-panel__phone" aria-hidden="true">
            <FiPhoneCall />
          </div>

          {state === "ringing" && (
            <IncomingCallSlider
              slideHint={config.slideHint}
              onAnswer={onAnswer}
            />
          )}
          {state === "answering" && (
            <p className="first-call-panel__status">Connexion…</p>
          )}
          {state === "playingMessage" && (
            <p className="first-call-panel__status">Ligne sécurisée</p>
          )}
          {state === "ending" && (
            <p className="first-call-panel__status">
              {error ?? "La communication a été interrompue."}
            </p>
          )}
        </section>
      )}

      <CallSubtitles
        caller={config.caller}
        cue={state === "playingMessage" ? cue : null}
      />

      {config.objective && (
        <ObjectiveNotification
          visible={objectiveVisible}
          label={config.objective.label}
          text={config.objective.text}
        />
      )}

      <div
        className={`first-call-resume-hint${resumeHintVisible ? " is-visible" : ""}`}
        role="status"
        aria-hidden={!resumeHintVisible}
      >
        {config.resumeHint}
      </div>
    </div>
  );
};
