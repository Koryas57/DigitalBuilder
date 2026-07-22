import React from "react";
import { FiCode } from "react-icons/fi";
import { developerQuickModeData } from "../../../data/developerQuickModeData";
import { QuickModeCard } from "./QuickModeCard";

export const QuickModeStackCard: React.FC = () => (
  <QuickModeCard className="quick-card--stack" title="Stack" icon={<FiCode />}>
    <div className="quick-stack">
      {developerQuickModeData.stack.map((item) => (
        <span key={item}>{item}</span>
      ))}
    </div>
  </QuickModeCard>
);
