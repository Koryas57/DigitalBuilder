import React from "react";
import type { SubtitleCue } from "../../../data/firstCallSubtitles";

interface CallSubtitlesProps {
  cue: SubtitleCue | null;
}

export const CallSubtitles: React.FC<CallSubtitlesProps> = ({ cue }) => (
  <div
    className={`first-call-subtitles${cue ? " is-visible" : ""}`}
    aria-live="polite"
    aria-atomic="true"
  >
    {cue && (
      <div key={`${cue.start}-${cue.end}`} className="first-call-subtitles__cue">
        <span>INCONNU</span>
        <p>{cue.text}</p>
      </div>
    )}
  </div>
);
