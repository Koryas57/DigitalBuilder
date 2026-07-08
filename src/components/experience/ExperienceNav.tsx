import React from "react";
import { FiCompass, FiMail, FiRotateCcw, FiZap } from "react-icons/fi";
import { contactLinks } from "../../data/profile";

interface ExperienceNavProps {
  currentLabel?: string;
  onBackToPaths: () => void;
  onReplayIntro: () => void;
  onQuickMode?: () => void;
}

export const ExperienceNav: React.FC<ExperienceNavProps> = ({
  currentLabel = "Experience",
  onBackToPaths,
  onReplayIntro,
  onQuickMode,
}) => {
  return (
    <header className="experience-nav">
      <button type="button" onClick={onReplayIntro}>
        <FiRotateCcw aria-hidden="true" />
        Retour intro
      </button>
      <button type="button" onClick={onBackToPaths}>
        <FiCompass aria-hidden="true" />
        Choix de parcours
      </button>
      {onQuickMode && (
        <button type="button" onClick={onQuickMode}>
          <FiZap aria-hidden="true" />
          Mode rapide
        </button>
      )}
      <a href={contactLinks.email}>
        <FiMail aria-hidden="true" />
        Contact
      </a>
      <span>{currentLabel}</span>
    </header>
  );
};
