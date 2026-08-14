import React from "react";
import { FiCompass, FiMail, FiRotateCcw, FiZap } from "react-icons/fi";
import { contactLinks } from "../../data/profile";

interface ExperienceNavProps {
  currentLabel?: string;
  variant?: "default" | "editorial";
  onBackToPaths: () => void;
  onReplayIntro: () => void;
  onQuickMode?: () => void;
}

export const ExperienceNav: React.FC<ExperienceNavProps> = ({
  currentLabel = "Experience",
  variant = "default",
  onBackToPaths,
  onReplayIntro,
  onQuickMode,
}) => {
  return (
    <header className={`experience-nav experience-nav--${variant}`}>
      <button type="button" onClick={onReplayIntro}>
        <FiRotateCcw aria-hidden="true" />
        <span className="experience-nav__text">Retour intro</span>
      </button>
      <span className="experience-nav__separator" aria-hidden="true" />
      <button type="button" onClick={onBackToPaths}>
        <FiCompass aria-hidden="true" />
        <span className="experience-nav__text">Choix de parcours</span>
      </button>
      {onQuickMode && (
        <>
          <span className="experience-nav__separator" aria-hidden="true" />
          <button type="button" onClick={onQuickMode}>
            <FiZap aria-hidden="true" />
            <span className="experience-nav__text">Mode rapide</span>
          </button>
        </>
      )}
      <span className="experience-nav__separator" aria-hidden="true" />
      <a href={contactLinks.email}>
        <FiMail aria-hidden="true" />
        <span className="experience-nav__text">Contact</span>
      </a>
      <strong className="experience-nav__label">{currentLabel}</strong>
    </header>
  );
};
