import React from "react";
import type { SubtitleCue } from "../../../data/firstCallSubtitles";

interface CallSubtitlesProps {
  caller: string;
  cue: SubtitleCue | null;
}

export const CallSubtitles: React.FC<CallSubtitlesProps> = ({ caller, cue }) => (
  <div
    className={`first-call-subtitles${cue ? " is-visible" : ""}`}
    aria-live="polite"
    aria-atomic="true"
  >
    {cue && (
      <div key={`${cue.start}-${cue.end}`} className="first-call-subtitles__cue">
        <span>{caller}</span>
        <p>{cue.text}</p>
      </div>
    )}
  </div>
);
