import React from "react";
import { FiActivity, FiBox, FiCheckCircle, FiCode, FiCpu, FiTarget } from "react-icons/fi";
import { developerQuickModeData } from "../../../data/developerQuickModeData";

const railIcons = [FiBox, FiTarget, FiCode, FiActivity];

export const QuickModeHeroVisual: React.FC = () => (
  <aside className="quick-hero-visual" aria-label="Aperçu visuel de l'expérience développeur">
    <img
      src={developerQuickModeData.hero.heroImage}
      alt="Architecture futuriste lumineuse évoquant une expérience web 3D premium"
      width="890"
      height="490"
      loading="eager"
    />
    <div className="quick-hero-visual__veil" aria-hidden="true" />
    <div className="quick-hero-visual__badge">
      <FiBox aria-hidden="true" />
      <div>
        <strong>Expérience immersive</strong>
        <span>Visualisation 3D temps réel</span>
      </div>
    </div>
    <div className="quick-hero-visual__metrics" aria-label="Indicateurs techniques">
      <span>WebGL</span>
      <span>Responsive</span>
      <span>Accessible</span>
    </div>
    <div className="quick-hero-visual__rail" aria-hidden="true">
      {railIcons.map((Icon, index) => (
        <span key={index}>
          <Icon />
        </span>
      ))}
    </div>
    <div className="quick-hero-visual__thumbs" aria-hidden="true">
      {developerQuickModeData.visualTabs.map((tab) => (
        <span key={tab}>{tab}</span>
      ))}
    </div>
    <div className="quick-hero-visual__system">
      <strong>Système produit</strong>
      {developerQuickModeData.systemDimensions.map((item, index) => (
        <span key={item}>
          <FiCpu aria-hidden="true" />
          {item}
          <FiCheckCircle aria-hidden="true" className={index === 4 ? "quick-hero-visual__check--purple" : ""} />
        </span>
      ))}
    </div>
  </aside>
);
