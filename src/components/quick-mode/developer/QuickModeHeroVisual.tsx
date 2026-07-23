import React from "react";
import { FiActivity, FiBox, FiCheckCircle, FiCode, FiCpu, FiTarget } from "react-icons/fi";
import { developerQuickModeData } from "../../../data/developerQuickModeData";
import { InterfaceRevealExperience } from "./InterfaceRevealExperience";

const railIcons = [FiBox, FiTarget, FiCode, FiActivity];

export const QuickModeHeroVisual: React.FC = () => (
  <aside className="quick-hero-visual" aria-label="Apercu visuel de l'experience developpeur">
    <InterfaceRevealExperience visualTabs={developerQuickModeData.visualTabs}>
      <div className="quick-hero-visual__badge">
        <FiBox aria-hidden="true" />
        <div>
          <strong>Experience immersive</strong>
          <span>Visualisation 3D temps reel</span>
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

      <div className="quick-hero-visual__system">
        <strong>Systeme produit</strong>
        {developerQuickModeData.systemDimensions.map((item, index) => (
          <span key={item}>
            <FiCpu aria-hidden="true" />
            {item}
            <FiCheckCircle aria-hidden="true" className={index === 4 ? "quick-hero-visual__check--purple" : ""} />
          </span>
        ))}
      </div>
    </InterfaceRevealExperience>
  </aside>
);
