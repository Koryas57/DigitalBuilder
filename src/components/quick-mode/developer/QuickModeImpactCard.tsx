import React from "react";
import { FiTrendingUp } from "react-icons/fi";
import { developerQuickModeData } from "../../../data/developerQuickModeData";
import { QuickModeCard } from "./QuickModeCard";

export const QuickModeImpactCard: React.FC = () => (
  <QuickModeCard className="quick-card--impact" title="Impact" icon={<FiTrendingUp />}>
    <div className="quick-impact">
      <div className="quick-impact__stats">
        {developerQuickModeData.impact.metrics.map((metric) => (
          <span key={metric.label}>
            <strong>{metric.value}</strong>
            {metric.label}
          </span>
        ))}
      </div>
      <p>{developerQuickModeData.impact.statement}</p>
    </div>
  </QuickModeCard>
);
