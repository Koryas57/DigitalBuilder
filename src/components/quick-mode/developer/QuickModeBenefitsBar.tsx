import React from "react";
import { FiGlobe, FiShield, FiTarget, FiZap } from "react-icons/fi";
import { developerQuickModeData } from "../../../data/developerQuickModeData";

const benefitIcons = [FiGlobe, FiShield, FiZap, FiTarget];

export const QuickModeBenefitsBar: React.FC = () => (
  <section className="quick-benefits" aria-label="Bénéfices de collaboration">
    {developerQuickModeData.benefits.map((benefit, index) => {
      const Icon = benefitIcons[index] ?? FiTarget;

      return (
        <article key={benefit.title}>
          <Icon aria-hidden="true" />
          <div>
            <strong>{benefit.title}</strong>
            <span>{benefit.text}</span>
          </div>
        </article>
      );
    })}
  </section>
);
