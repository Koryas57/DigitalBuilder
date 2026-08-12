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
        <span className="experience-nav__text">Retour intro</span>
      </button>
      <button type="button" onClick={onBackToPaths}>
        <FiCompass aria-hidden="true" />
        <span className="experience-nav__text">Choix de parcours</span>
      </button>
      {onQuickMode && (
        <button type="button" onClick={onQuickMode}>
          <FiZap aria-hidden="true" />
          <span className="experience-nav__text">Mode rapide</span>
        </button>
      )}
      <a href={contactLinks.email}>
        <FiMail aria-hidden="true" />
        <span className="experience-nav__text">Contact</span>
      </a>
      <span className="experience-nav__label">{currentLabel}</span>
    </header>
  );
};
