import React from "react";
import { FiCode, FiFolder, FiHome, FiMail, FiZap } from "react-icons/fi";
import { contactLinks } from "../../../data/profile";

interface QuickModeMobileNavProps {
  onImmersiveMode: () => void;
  onProjectsClick: () => void;
  onStackClick: () => void;
}

export const QuickModeMobileNav: React.FC<QuickModeMobileNavProps> = ({
  onImmersiveMode,
  onProjectsClick,
  onStackClick,
}) => (
  <nav className="quick-mobile-nav" aria-label="Navigation mobile mode rapide">
    <a href="#quick-top">
      <FiHome aria-hidden="true" />
      Accueil
    </a>
    <button type="button" onClick={onProjectsClick}>
      <FiFolder aria-hidden="true" />
      Projets
    </button>
    <button type="button" className="quick-mobile-nav__center" onClick={onImmersiveMode}>
      <FiZap aria-hidden="true" />
      <span>Immersif</span>
    </button>
    <button type="button" onClick={onStackClick}>
      <FiCode aria-hidden="true" />
      Stacks
    </button>
    <a href={contactLinks.email}>
      <FiMail aria-hidden="true" />
      Contact
    </a>
  </nav>
);
