import React from "react";
import { FiChevronDown, FiChevronLeft, FiChevronRight, FiChevronUp } from "react-icons/fi";

interface DeveloperTouchControlsProps {
  onMove: (x: number, y: number) => void;
  onInteract: () => void;
  canInteract: boolean;
}

export const DeveloperTouchControls: React.FC<DeveloperTouchControlsProps> = ({
  onMove,
  onInteract,
  canInteract,
}) => {
  return (
    <div className="developer-touch">
      <div className="developer-touch__pad" aria-label="Controle tactile">
        <button type="button" onClick={() => onMove(0, -8)} aria-label="Avancer">
          <FiChevronUp aria-hidden="true" />
        </button>
        <button type="button" onClick={() => onMove(-8, 0)} aria-label="Gauche">
          <FiChevronLeft aria-hidden="true" />
        </button>
        <button type="button" onClick={() => onMove(8, 0)} aria-label="Droite">
          <FiChevronRight aria-hidden="true" />
        </button>
        <button type="button" onClick={() => onMove(0, 8)} aria-label="Reculer">
          <FiChevronDown aria-hidden="true" />
        </button>
      </div>
      <button className="developer-touch__interact" type="button" onClick={onInteract} disabled={!canInteract}>
        Interagir
      </button>
    </div>
  );
};
