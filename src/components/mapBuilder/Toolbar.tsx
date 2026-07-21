import React from "react";
import {
  FiArrowRight,
  FiArrowUp,
  FiCopy,
  FiDownload,
  FiMove,
  FiPlus,
  FiRotateCcw,
  FiRotateCw,
  FiTrash2,
  FiUpload,
} from "react-icons/fi";
import { LoadManager } from "./LoadManager";
import { SaveManager } from "./SaveManager";
import { MODULE_STEP, SNAP_LEVELS, useMapBuilderStore } from "./mapBuilderStore";

export const Toolbar: React.FC = () => {
  const modules = useMapBuilderStore((state) => state.modules);
  const requestAddCorridor = useMapBuilderStore((state) => state.requestAddCorridor);
  const requestAddObject = useMapBuilderStore((state) => state.requestAddObject);
  const setMoveMode = useMapBuilderStore((state) => state.setMoveMode);
  const gridSize = useMapBuilderStore((state) => state.gridSize);
  const setSnapSize = useMapBuilderStore((state) => state.setSnapSize);
  const rotateSelected = useMapBuilderStore((state) => state.rotateSelected);
  const rotateSelectedBy = useMapBuilderStore((state) => state.rotateSelectedBy);
  const deleteSelected = useMapBuilderStore((state) => state.deleteSelected);
  const duplicateSelected = useMapBuilderStore((state) => state.duplicateSelected);
  const duplicateSelectedOffset = useMapBuilderStore((state) => state.duplicateSelectedOffset);
  const alignSelectedToPrevious = useMapBuilderStore((state) => state.alignSelectedToPrevious);
  const copyPreviousPosition = useMapBuilderStore((state) => state.copyPreviousPosition);
  const pastePosition = useMapBuilderStore((state) => state.pastePosition);
  const setSelectedPositionAxis = useMapBuilderStore((state) => state.setSelectedPositionAxis);
  const setSelectedRotation = useMapBuilderStore((state) => state.setSelectedRotation);
  const clearMap = useMapBuilderStore((state) => state.clearMap);
  const selectedId = useMapBuilderStore((state) => state.selectedId);
  const lastMessage = useMapBuilderStore((state) => state.lastMessage);
  const selected = modules.find((module) => module.id === selectedId);

  const updatePosition = (axis: "x" | "y" | "z", value: string) => {
    setSelectedPositionAxis(axis, Number(value));
  };

  return (
    <aside className="map-builder-toolbar">
      <header>
        <p>Map Builder</p>
        <h1>Corridor Assembly</h1>
        <span>Mini Unity specialise GLB modules</span>
      </header>

      <section>
        <h2>Placement</h2>
        <button type="button" className="map-builder-toolbar__primary" onClick={requestAddCorridor}>
          <FiPlus aria-hidden="true" />
          Ajouter un couloir
        </button>
        <div className="map-builder-toolbar__palette">
          <button type="button" onClick={() => requestAddObject("playerSpawn")}>PlayerSpawn</button>
          <button type="button" onClick={() => requestAddObject("warp")}>Warp</button>
          <button type="button" onClick={() => requestAddObject("trigger")}>Trigger</button>
          <button type="button" onClick={() => requestAddObject("audioPoint")}>AudioPoint</button>
          <button type="button" onClick={() => requestAddObject("lightPoint")}>LightPoint</button>
          <button type="button" onClick={() => requestAddObject("monsterSpawn")}>MonsterSpawn</button>
        </div>
      </section>

      <section>
        <h2>Transform</h2>
        <span className="map-builder-toolbar__status">
          {selectedId ? "Selection active. G pour deplacer, clic pour poser." : "Cliquez un module pour le selectionner"}
        </span>
        <div className="map-builder-toolbar__grid">
          <button type="button" onClick={() => setMoveMode(true)} disabled={!selectedId}>
            <FiMove aria-hidden="true" />
            G Move
          </button>
          <button type="button" onClick={rotateSelected} disabled={!selectedId}>
            <FiRotateCw aria-hidden="true" />
            R 90
          </button>
          <button type="button" onClick={() => rotateSelectedBy(-90)} disabled={!selectedId}>
            <FiRotateCcw aria-hidden="true" />
            Q -90
          </button>
          <button type="button" onClick={() => rotateSelectedBy(5)} disabled={!selectedId}>
            <FiRotateCw aria-hidden="true" />
            +5
          </button>
          <button type="button" onClick={duplicateSelected} disabled={!selectedId}>
            <FiCopy aria-hidden="true" />
            Ctrl+D
          </button>
          <button type="button" onClick={deleteSelected} disabled={!selectedId}>
            <FiTrash2 aria-hidden="true" />
            Delete
          </button>
        </div>
      </section>

      <section>
        <h2>Snap courant: {gridSize}m</h2>
        <div className="map-builder-toolbar__snap">
          {SNAP_LEVELS.map((snap) => (
            <button
              type="button"
              className={snap === gridSize ? "is-active" : undefined}
              onClick={() => setSnapSize(snap)}
              key={snap}
            >
              Snap {snap === 0.5 ? ".5" : snap === 0.25 ? ".25" : snap === 0.1 ? ".1" : snap === 0.05 ? ".05" : snap}
            </button>
          ))}
        </div>
        <span className="map-builder-toolbar__status">[ snap plus fin | ] snap plus large</span>
      </section>

      <section>
        <h2>Coordonnées</h2>
        <div className="map-builder-inspector">
          <label>
            X
            <input
              type="number"
              step="0.01"
              value={selected?.position[0] ?? ""}
              onChange={(event) => updatePosition("x", event.target.value)}
              disabled={!selected}
            />
          </label>
          <label>
            Y
            <input
              type="number"
              step="0.01"
              value={selected?.position[1] ?? ""}
              onChange={(event) => updatePosition("y", event.target.value)}
              disabled={!selected}
            />
          </label>
          <label>
            Z
            <input
              type="number"
              step="0.01"
              value={selected?.position[2] ?? ""}
              onChange={(event) => updatePosition("z", event.target.value)}
              disabled={!selected}
            />
          </label>
          <label>
            Rot Y
            <input
              type="number"
              step="1"
              value={selected?.rotation ?? ""}
              onChange={(event) => setSelectedRotation(Number(event.target.value))}
              disabled={!selected}
            />
          </label>
        </div>
      </section>

      <section>
        <h2>Alignement rapide</h2>
        <div className="map-builder-toolbar__grid">
          <button type="button" onClick={() => alignSelectedToPrevious("x")} disabled={!selectedId}>
            Aligner X
          </button>
          <button type="button" onClick={() => alignSelectedToPrevious("z")} disabled={!selectedId}>
            Aligner Z
          </button>
          <button type="button" onClick={copyPreviousPosition} disabled={!selectedId}>
            Copier prev
          </button>
          <button type="button" onClick={pastePosition} disabled={!selectedId}>
            Coller pos
          </button>
          <button
            type="button"
            onClick={() => duplicateSelectedOffset([MODULE_STEP, 0, 0])}
            disabled={!selectedId}
          >
            <FiArrowRight aria-hidden="true" />
            Dup droite
          </button>
          <button
            type="button"
            onClick={() => duplicateSelectedOffset([0, 0, -MODULE_STEP])}
            disabled={!selectedId}
          >
            <FiArrowUp aria-hidden="true" />
            Dup devant
          </button>
        </div>
      </section>

      <section>
        <h2>Sauvegarde</h2>
        <SaveManager />
      </section>

      <section>
        <h2>Chargement</h2>
        <LoadManager />
      </section>

      <section>
        <h2>Scene</h2>
        <button type="button" onClick={clearMap}>
          <FiTrash2 aria-hidden="true" />
          Vider la map
        </button>
      </section>

      <footer>
        <span>
          <FiDownload aria-hidden="true" />
          JSON export
        </span>
        <span>
          <FiUpload aria-hidden="true" />
          JSON import
        </span>
        <strong>{lastMessage}</strong>
      </footer>
    </aside>
  );
};
