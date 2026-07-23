import React from "react";
import { FiBox } from "react-icons/fi";
import { INTERFACE_CHOICE_ZONES, type InterfaceChoice } from "./interfaceChoiceData";
import { InterfaceChoiceCard } from "./InterfaceChoiceCard";
import { InterfaceDetailPanel } from "./InterfaceDetailPanel";

type Zone = Pick<InterfaceChoice, "left" | "top" | "width" | "height">;

type InterfaceChoiceOverlayProps = {
  selectedChoiceId: InterfaceChoice["id"] | null;
  onSelect: (choiceId: InterfaceChoice["id"]) => void;
  onBack: () => void;
};

const SYSTEM_ZONE: Zone = {
  left: 35.5,
  top: 16,
  width: 29.2,
  height: 27.6,
};

const toStyle = (zone: Zone): React.CSSProperties => ({
  left: `${zone.left}%`,
  top: `${zone.top}%`,
  width: `${zone.width}%`,
  height: `${zone.height}%`,
});

export const InterfaceChoiceOverlay: React.FC<InterfaceChoiceOverlayProps> = ({
  selectedChoiceId,
  onSelect,
  onBack,
}) => {
  const selectedChoice = INTERFACE_CHOICE_ZONES.find((choice) => choice.id === selectedChoiceId) ?? null;

  return (
    <div className="interface-choice-overlay">
      <div className="interface-choice-overlay__system" style={toStyle(SYSTEM_ZONE)} aria-hidden="true">
        <FiBox />
        <span>
          <strong>Interface system</strong>
          <small>3 modules generes</small>
        </span>
      </div>

      {INTERFACE_CHOICE_ZONES.map((choice) => (
        <InterfaceChoiceCard
          key={choice.id}
          choice={choice}
          style={toStyle(choice)}
          isSelected={choice.id === selectedChoiceId}
          isDimmed={Boolean(selectedChoiceId && choice.id !== selectedChoiceId)}
          onSelect={onSelect}
        />
      ))}

      {selectedChoice && <InterfaceDetailPanel choice={selectedChoice} onBack={onBack} />}

      <div className="interface-choice-overlay__mobile-actions" aria-label="Choix Interface">
        {INTERFACE_CHOICE_ZONES.map((choice) => (
          <button key={choice.id} type="button" onClick={() => onSelect(choice.id)}>
            <strong>{choice.label}</strong>
            <span>{choice.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
