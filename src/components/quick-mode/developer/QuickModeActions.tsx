import React from "react";
import { FiArrowRight, FiEye, FiMail } from "react-icons/fi";
import { contactLinks } from "../../../data/profile";

interface QuickModeActionsProps {
  onImmersiveMode: () => void;
  onProjectsClick: () => void;
}

export const QuickModeActions: React.FC<QuickModeActionsProps> = ({ onImmersiveMode, onProjectsClick }) => (
  <div className="quick-actions">
    <button className="quick-actions__primary" type="button" onClick={onImmersiveMode}>
      <FiArrowRight aria-hidden="true" />
      Entrer dans l'univers
    </button>
    <button className="quick-actions__secondary" type="button" onClick={onProjectsClick}>
      <FiEye aria-hidden="true" />
      Voir les projets
    </button>
    <a className="quick-actions__secondary" href={contactLinks.email}>
      <FiMail aria-hidden="true" />
      Contact
    </a>
  </div>
);
