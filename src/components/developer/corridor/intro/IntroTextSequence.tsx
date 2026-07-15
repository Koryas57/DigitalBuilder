import React from "react";
import { INTRO_TEXT_SEQUENCE } from "./introConfig";

interface IntroTextSequenceProps {
  sentenceIndex: number;
  visible: boolean;
  dissolving: boolean;
}

export const IntroTextSequence: React.FC<IntroTextSequenceProps> = ({
  sentenceIndex,
  visible,
  dissolving,
}) => {
  const sentence = INTRO_TEXT_SEQUENCE[sentenceIndex];
  if (!sentence) return null;

  return (
    <p
      className={[
        "developer-intro-text",
        visible ? "is-visible" : "",
        dissolving ? "is-dissolving" : "",
        sentence.text === "..." ? "is-ellipsis" : "",
      ].join(" ")}
    >
      <span>{sentence.text}</span>
    </p>
  );
};
