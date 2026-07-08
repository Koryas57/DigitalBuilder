import React from "react";
import { useMapBuilderStore } from "./mapBuilderStore";

export const CoordinatesOverlay: React.FC = () => {
  const modules = useMapBuilderStore((state) => state.modules);
  const selectedId = useMapBuilderStore((state) => state.selectedId);
  const previousSelectedId = useMapBuilderStore((state) => state.previousSelectedId);
  const isMoveMode = useMapBuilderStore((state) => state.isMoveMode);
  const gridSize = useMapBuilderStore((state) => state.gridSize);
  const selected = modules.find((module) => module.id === selectedId);
  const previous = modules.find((module) => module.id === previousSelectedId);

  return (
    <div className="map-builder-coordinates">
      <strong>Coordinates</strong>
      <span>Snap: {gridSize}m</span>
      <span>Modules: {modules.length}</span>
      <span>Mode: {isMoveMode ? "MOVE actif" : "Select"}</span>
      <span>
        Selected:{" "}
        {selected
          ? `${selected.type} | ${selected.asset} | ${selected.position.join(", ")} | ${selected.rotation}deg`
          : "none"}
      </span>
      <span>
        Previous:{" "}
        {previous ? `${previous.type} | ${previous.position.join(", ")} | ${previous.rotation}deg` : "none"}
      </span>
    </div>
  );
};
