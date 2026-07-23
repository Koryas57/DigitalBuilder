import React from "react";
import { FiArrowLeft, FiArrowRight, FiCheckCircle } from "react-icons/fi";
import type { InterfaceChoice } from "./interfaceChoiceData";

type InterfaceDetailPanelProps = {
  choice: InterfaceChoice;
  onBack: () => void;
};

export const InterfaceDetailPanel: React.FC<InterfaceDetailPanelProps> = ({ choice, onBack }) => (
  <section className={`interface-detail-panel interface-detail-panel--${choice.color}`} aria-live="polite">
    <button type="button" className="interface-detail-panel__back" onClick={onBack}>
      <FiArrowLeft aria-hidden="true" />
      Retour
    </button>

    <div className="interface-detail-panel__copy">
      <span>{choice.shortLabel}</span>
      <h3>{choice.detailTitle}</h3>
      <p>{choice.detailDescription}</p>
    </div>

    <ul className="interface-detail-panel__skills">
      {choice.skills.map((skill) => (
        <li key={skill}>
          <FiCheckCircle aria-hidden="true" />
          {skill}
        </li>
      ))}
    </ul>

    <button type="button" className="interface-detail-panel__cta">
      Voir les projets associes
      <FiArrowRight aria-hidden="true" />
    </button>
  </section>
);
