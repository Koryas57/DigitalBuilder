import React from "react";
import { FiArrowLeft, FiArrowRight, FiClock, FiCpu } from "react-icons/fi";

interface DeveloperModeSelectorProps {
  onBackToPaths: () => void;
  onChooseImmersive: () => void;
  onChooseQuick: () => void;
}

export const DeveloperModeSelector: React.FC<DeveloperModeSelectorProps> = ({
  onBackToPaths,
  onChooseImmersive,
  onChooseQuick,
}) => {
  return (
    <div className="developer-mode">
      <button className="developer-mode__back" type="button" onClick={onBackToPaths}>
        <FiArrowLeft aria-hidden="true" />
        Retour aux choix de parcours
      </button>

      <div className="developer-mode__grid">
        <button className="developer-mode-card developer-mode-card--immersive" type="button" onClick={onChooseImmersive}>
          <FiCpu aria-hidden="true" />
          <strong>Mode immersif</strong>
          <i>
            Entrer
            <FiArrowRight aria-hidden="true" />
          </i>
        </button>

        <button className="developer-mode-card developer-mode-card--quick" type="button" onClick={onChooseQuick}>
          <FiClock aria-hidden="true" />
          <strong>Mode rapide</strong>
          <i>
            Voir l'essentiel
            <FiArrowRight aria-hidden="true" />
          </i>
        </button>
      </div>
    </div>
  );
};
