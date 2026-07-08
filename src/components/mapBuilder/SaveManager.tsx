import React from "react";
import { useMapBuilderStore } from "./mapBuilderStore";

export const SaveManager: React.FC = () => {
  const exportJson = useMapBuilderStore((state) => state.exportJson);

  const handleExport = () => {
    const json = exportJson();
    void navigator.clipboard?.writeText(json);
  };

  const handleDownload = () => {
    const json = exportJson();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "map-builder-layout.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="map-builder-panel__row">
      <button type="button" onClick={handleExport}>
        Exporter JSON
      </button>
      <button type="button" onClick={handleDownload}>
        Telecharger
      </button>
    </div>
  );
};
