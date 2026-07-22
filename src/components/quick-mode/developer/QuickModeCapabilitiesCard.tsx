import React from "react";
import { FiBox, FiMonitor } from "react-icons/fi";
import { developerQuickModeData } from "../../../data/developerQuickModeData";
import { QuickModeCard } from "./QuickModeCard";

export const QuickModeCapabilitiesCard: React.FC = () => (
  <QuickModeCard className="quick-card--capabilities" title="Ce que je conçois" icon={<FiBox />}>
    <ul className="quick-list quick-list--two-tone">
      {developerQuickModeData.capabilities.map((item) => (
        <li key={item}>
          <FiMonitor aria-hidden="true" />
          {item}
        </li>
      ))}
    </ul>
  </QuickModeCard>
);
