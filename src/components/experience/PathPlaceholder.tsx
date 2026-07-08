import React from "react";
import { FiArrowLeft, FiClock, FiRotateCcw } from "react-icons/fi";
import type { ExperiencePath } from "../../data/paths";
import { ExperienceNav } from "./ExperienceNav";

interface PathPlaceholderProps {
  path: ExperiencePath;
  onBackToPaths: () => void;
  onReplayIntro: () => void;
}

export const PathPlaceholder: React.FC<PathPlaceholderProps> = ({
  path,
  onBackToPaths,
  onReplayIntro,
}) => {
  return (
    <section className={`path-placeholder path-placeholder--${path.accent}`}>
      <div className="experience-ambient" aria-hidden="true" />
      <ExperienceNav
        currentLabel={path.title}
        onBackToPaths={onBackToPaths}
        onReplayIntro={onReplayIntro}
      />

      <div className="path-placeholder__content">
        <div className="path-placeholder__sigil" aria-hidden="true">
          <FiClock />
        </div>
        <p>{path.label}</p>
        <h1>{path.title}</h1>
        <strong>Parcours bientot disponible</strong>
        <span>
          Cet univers aura sa propre navigation, ses propres interactions et sa
          propre logique. Il ne redirigera pas vers l'ancien site vitrine.
        </span>
        <div className="path-placeholder__actions">
          <button type="button" onClick={onBackToPaths}>
            <FiArrowLeft aria-hidden="true" />
            Choisir un autre parcours
          </button>
          <button type="button" onClick={onReplayIntro}>
            <FiRotateCcw aria-hidden="true" />
            Revoir l'intro
          </button>
        </div>
      </div>
    </section>
  );
};
