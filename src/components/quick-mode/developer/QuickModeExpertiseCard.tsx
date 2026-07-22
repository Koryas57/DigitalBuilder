import React from "react";
import { FiCheckCircle, FiUser } from "react-icons/fi";
import { developerQuickModeData } from "../../../data/developerQuickModeData";
import { QuickModeCard } from "./QuickModeCard";

export const QuickModeExpertiseCard: React.FC = () => (
  <QuickModeCard className="quick-card--expertise" title="Expertise" icon={<FiUser />}>
    <ul className="quick-list">
      {developerQuickModeData.expertise.map((item) => (
        <li key={item}>
          <FiCheckCircle aria-hidden="true" />
          {item}
        </li>
      ))}
    </ul>
  </QuickModeCard>
);
