import React from "react";
import { FiZap } from "react-icons/fi";
import { developerQuickModeData } from "../../../data/developerQuickModeData";
import { QuickModeActions } from "./QuickModeActions";
import { QuickModeHeroVisual } from "./QuickModeHeroVisual";

interface QuickModeHeroProps {
  onImmersiveMode: () => void;
  onProjectsClick: () => void;
}

export const QuickModeHero: React.FC<QuickModeHeroProps> = ({ onImmersiveMode, onProjectsClick }) => (
  <section className="quick-hero" aria-label="Mode rapide développeur">
    <div className="quick-hero__copy">
      <p className="quick-eyebrow">
        <FiZap aria-hidden="true" />
        {developerQuickModeData.hero.eyebrow}
      </p>
      <h1 id="quick-hero-title" className="quick-hero__title quick-hero__title--desktop">
        <span>{developerQuickModeData.hero.title[0]}</span>
        <span className="quick-gradient">{developerQuickModeData.hero.title[1]}</span>
        <span className="quick-gradient">{developerQuickModeData.hero.title[2]}</span>
      </h1>
      <h1 className="quick-hero__title quick-hero__title--mobile" aria-hidden="true">
        <span>{developerQuickModeData.hero.mobileTitle[0]}</span>
        <span className="quick-gradient">{developerQuickModeData.hero.mobileTitle[1]}</span>
        <span className="quick-gradient">{developerQuickModeData.hero.mobileTitle[2]}</span>
      </h1>
      <p className="quick-hero__subtitle">{developerQuickModeData.hero.subtitle}</p>
      <QuickModeActions onImmersiveMode={onImmersiveMode} onProjectsClick={onProjectsClick} />
    </div>
    <QuickModeHeroVisual />
  </section>
);
