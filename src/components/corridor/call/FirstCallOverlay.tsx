import React from "react";
import { FiPhoneCall } from "react-icons/fi";
import {
  FIRST_CALL_OBJECTIVE,
  FIRST_CALL_UI,
  type FirstCallState,
} from "../../../data/firstCallConfig";
import type { SubtitleCue } from "../../../data/firstCallSubtitles";
import { IncomingCallSlider } from "./IncomingCallSlider";
import { CallSubtitles } from "./CallSubtitles";
import { ObjectiveNotification } from "../objectives/ObjectiveNotification";

interface FirstCallOverlayProps {
  state: FirstCallState;
  cue: SubtitleCue | null;
  reducedMotion: boolean;
  objectiveVisible: boolean;
  resumeHintVisible: boolean;
  error: string | null;
  onAnswer: () => void;
}

export const FirstCallOverlay: React.FC<FirstCallOverlayProps> = ({
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
                ? FIRST_CALL_UI.incomingLabel
                : state === "ending"
                  ? FIRST_CALL_UI.completedLabel
                  : "APPEL EN COURS"}
            </span>
            <strong>{FIRST_CALL_UI.caller}</strong>
          </div>
          <div className="first-call-panel__phone" aria-hidden="true">
            <FiPhoneCall />
          </div>

          {state === "ringing" && <IncomingCallSlider onAnswer={onAnswer} />}
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

      <CallSubtitles cue={state === "playingMessage" ? cue : null} />

      <ObjectiveNotification
        visible={objectiveVisible}
        label={FIRST_CALL_OBJECTIVE.label}
        text={FIRST_CALL_OBJECTIVE.text}
      />

      <div
        className={`first-call-resume-hint${resumeHintVisible ? " is-visible" : ""}`}
        role="status"
        aria-hidden={!resumeHintVisible}
      >
        {FIRST_CALL_UI.resumeHint}
      </div>
    </div>
  );
};
