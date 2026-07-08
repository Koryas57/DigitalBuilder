import React from "react";
import { FiCrosshair, FiList, FiZap } from "react-icons/fi";
import type { DeveloperStationData } from "../../data/developerPath";

interface DeveloperHUDProps {
  nearStation?: DeveloperStationData;
  discoveredCount: number;
  totalCount: number;
  onQuickMode: () => void;
  onNextStation: () => void;
  mediaPrompt?: string;
}

export const DeveloperHUD: React.FC<DeveloperHUDProps> = ({
  nearStation,
  discoveredCount,
  totalCount,
  onQuickMode,
  onNextStation,
  mediaPrompt,
}) => {
  return (
    <div className="developer-hud">
      <div className="developer-hud__status">
        <FiCrosshair aria-hidden="true" />
        <span>
          {mediaPrompt
            ? mediaPrompt
            : nearStation
            ? `Appuyez sur E pour explorer ${nearStation.title}`
            : "Approchez une station lumineuse"}
        </span>
      </div>
      <div className="developer-hud__actions">
        <button type="button" onClick={onNextStation}>
          <FiList aria-hidden="true" />
          Station suivante
        </button>
        <button type="button" onClick={onQuickMode}>
          <FiZap aria-hidden="true" />
          Mode rapide
        </button>
      </div>
      <div className="developer-hud__progress">
        {discoveredCount}/{totalCount} modules ouverts
      </div>
    </div>
  );
};
