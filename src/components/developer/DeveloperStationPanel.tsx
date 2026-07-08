import React from "react";
import { FiX } from "react-icons/fi";
import type { DeveloperStationData } from "../../data/developerPath";

interface DeveloperStationPanelProps {
  station: DeveloperStationData;
  onClose: () => void;
}

export const DeveloperStationPanel: React.FC<DeveloperStationPanelProps> = ({
  station,
  onClose,
}) => {
  return (
    <aside className="developer-station-panel" aria-label={station.title}>
      <button className="developer-station-panel__close" type="button" onClick={onClose} aria-label="Fermer le panneau">
        <FiX aria-hidden="true" />
      </button>
      <p>{station.subtitle}</p>
      <h2>{station.title}</h2>
      <span>{station.description}</span>

      <div className="developer-station-panel__block">
        <strong>Competences</strong>
        <div>
          {station.skills.map((skill) => (
            <i key={skill}>{skill}</i>
          ))}
        </div>
      </div>

      <div className="developer-station-panel__block">
        <strong>Ce que ca prouve</strong>
        <span>{station.proof}</span>
      </div>

      <div className="developer-station-panel__block">
        <strong>Projets lies</strong>
        <div>
          {station.relatedProjects.map((project) => (
            <i key={project}>{project}</i>
          ))}
        </div>
      </div>
    </aside>
  );
};
