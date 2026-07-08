import React, { useRef } from "react";
import { useMapBuilderStore } from "./mapBuilderStore";

export const LoadManager: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const jsonDraft = useMapBuilderStore((state) => state.jsonDraft);
  const setJsonDraft = useMapBuilderStore((state) => state.setJsonDraft);
  const loadJson = useMapBuilderStore((state) => state.loadJson);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setJsonDraft(text);
    loadJson(text);
    event.target.value = "";
  };

  return (
    <>
      <textarea
        value={jsonDraft}
        onChange={(event) => setJsonDraft(event.target.value)}
        placeholder='Collez ici un JSON de map, puis cliquez "Charger JSON".'
        spellCheck={false}
      />
      <div className="map-builder-panel__row">
        <button type="button" onClick={() => loadJson(jsonDraft)}>
          Charger JSON
        </button>
        <button type="button" onClick={() => fileInputRef.current?.click()}>
          Importer fichier
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        onChange={handleFileChange}
        hidden
      />
    </>
  );
};
