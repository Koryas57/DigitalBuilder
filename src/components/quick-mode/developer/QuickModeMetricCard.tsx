import React from "react";
import { FiBox, FiGlobe, FiLayers, FiZap } from "react-icons/fi";
import { developerQuickModeData } from "../../../data/developerQuickModeData";

const metricIcons = [FiBox, FiLayers, FiZap, FiGlobe];

export const QuickModeMetricCard: React.FC = () => (
  <section className="quick-metrics" aria-label="Preuves rapides">
    {developerQuickModeData.metrics.map((metric, index) => {
      const Icon = metricIcons[index] ?? FiBox;

      return (
        <article key={metric.label}>
          <Icon aria-hidden="true" />
          <strong>{metric.value}</strong>
          <span>{metric.label}</span>
          <small>{metric.detail}</small>
        </article>
      );
    })}
  </section>
);
