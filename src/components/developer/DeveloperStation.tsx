import React from "react";
import type { DeveloperStationData } from "../../data/developerPath";

interface DeveloperStationProps {
  station: DeveloperStationData;
  isNear: boolean;
  isActive: boolean;
  onOpen: () => void;
}

export const DeveloperStation: React.FC<DeveloperStationProps> = ({
  station,
  isNear,
  isActive,
  onOpen,
}) => {
  return (
    <button
      className={`developer-station developer-station--${station.visualType} ${isNear ? "is-near" : ""} ${
        isActive ? "is-active" : ""
      }`}
      style={{
        left: `${station.position.x}%`,
        top: `${station.position.y}%`,
        "--station-accent": station.accentColor,
      } as React.CSSProperties}
      type="button"
      onClick={onOpen}
    >
      <span aria-hidden="true" />
      <strong>{station.title}</strong>
      <small>{station.subtitle}</small>
    </button>
  );
};
