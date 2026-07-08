import React from "react";
import { FiArrowLeft, FiBox, FiCpu, FiMail, FiZap } from "react-icons/fi";
import { developerQuickSummary, developerStations } from "../../data/developerPath";
import { contactLinks } from "../../data/profile";

interface DeveloperQuickViewProps {
  onImmersiveMode: () => void;
  onBackToSelector: () => void;
}

export const DeveloperQuickView: React.FC<DeveloperQuickViewProps> = ({
  onImmersiveMode,
  onBackToSelector,
}) => {
  return (
    <div className="developer-quick">
      <div className="developer-quick__hero">
        <p>Mode rapide</p>
        <h1>{developerQuickSummary.title}</h1>
        <span>{developerQuickSummary.text}</span>
        <div className="developer-quick__actions">
          <button type="button" onClick={onImmersiveMode}>
            <FiCpu aria-hidden="true" />
            Passer en mode immersif
          </button>
          <button type="button" onClick={onBackToSelector}>
            <FiArrowLeft aria-hidden="true" />
            Choix du mode
          </button>
          <a href={contactLinks.email}>
            <FiMail aria-hidden="true" />
            Contact
          </a>
        </div>
      </div>

      <div className="developer-quick__grid">
        <article>
          <FiZap aria-hidden="true" />
          <h2>Stack</h2>
          <div>
            {developerQuickSummary.stack.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </article>

        <article>
          <FiBox aria-hidden="true" />
          <h2>Preuves</h2>
          <ul>
            {developerQuickSummary.proofs.map((proof) => (
              <li key={proof}>{proof}</li>
            ))}
          </ul>
        </article>

        <article>
          <FiCpu aria-hidden="true" />
          <h2>Modules explorables</h2>
          <div>
            {developerStations.map((station) => (
              <span key={station.id}>{station.title}</span>
            ))}
          </div>
        </article>

        <article>
          <FiBox aria-hidden="true" />
          <h2>Projets lies</h2>
          <div>
            {developerQuickSummary.projects.map((project) => (
              <span key={project}>{project}</span>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
};
