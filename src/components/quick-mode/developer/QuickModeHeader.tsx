import React, { useState } from "react";
import { FiCompass, FiMail, FiMenu, FiRotateCcw, FiX, FiZap } from "react-icons/fi";
import { contactLinks } from "../../../data/profile";

interface QuickModeHeaderProps {
  onBackToPaths: () => void;
  onReplayIntro: () => void;
  onImmersiveMode: () => void;
}

export const QuickModeHeader: React.FC<QuickModeHeaderProps> = ({
  onBackToPaths,
  onReplayIntro,
  onImmersiveMode,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const closeAndRun = (action: () => void) => {
    setIsOpen(false);
    action();
  };

  return (
    <>
      <header className="quick-header quick-header--desktop" aria-label="Navigation mode rapide développeur">
        <nav className="quick-header__bar">
          <button type="button" onClick={onReplayIntro}>
            <FiRotateCcw aria-hidden="true" />
            Retour intro
          </button>
          <span aria-hidden="true" />
          <button type="button" onClick={onBackToPaths}>
            <FiCompass aria-hidden="true" />
            Choix de parcours
          </button>
          <span aria-hidden="true" />
          <button type="button" onClick={onImmersiveMode}>
            <FiZap aria-hidden="true" />
            Mode immersif
          </button>
          <span aria-hidden="true" />
          <a href={contactLinks.email}>
            <FiMail aria-hidden="true" />
            Contact
          </a>
          <strong>Parcours développeur</strong>
        </nav>
      </header>

      <header className="quick-mobile-header">
        <button className="quick-mobile-header__brand" type="button" onClick={onBackToPaths}>
          <span aria-hidden="true" />
          Yacine Nezreg
        </button>
        <button
          type="button"
          className="quick-mobile-header__menu"
          onClick={() => setIsOpen(true)}
          aria-label="Ouvrir le menu"
        >
          <FiMenu aria-hidden="true" />
        </button>
      </header>

      {isOpen && (
        <div className="quick-drawer quick-drawer--open" role="dialog" aria-modal="true" aria-label="Menu mode rapide">
          <button type="button" className="quick-drawer__close" onClick={() => setIsOpen(false)} aria-label="Fermer le menu">
            <FiX aria-hidden="true" />
          </button>
          <button type="button" onClick={() => closeAndRun(onReplayIntro)}>
            Retour intro
          </button>
          <button type="button" onClick={() => closeAndRun(onBackToPaths)}>
            Choix de parcours
          </button>
          <button type="button" onClick={() => closeAndRun(onImmersiveMode)}>
            Mode immersif
          </button>
          <a href={contactLinks.email} onClick={() => setIsOpen(false)}>
            Contact
          </a>
        </div>
      )}
    </>
  );
};
