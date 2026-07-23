import React from "react";
import { FiArrowRight } from "react-icons/fi";
import type { InterfaceChoice } from "./interfaceChoiceData";

type InterfaceChoiceCardProps = {
  choice: InterfaceChoice;
  style: React.CSSProperties;
  isSelected: boolean;
  isDimmed: boolean;
  onSelect: (choiceId: InterfaceChoice["id"]) => void;
};

export const InterfaceChoiceCard: React.FC<InterfaceChoiceCardProps> = ({
  choice,
  style,
  isSelected,
  isDimmed,
  onSelect,
}) => (
  <button
    type="button"
    className={[
      "interface-choice-zone",
      `interface-choice-zone--${choice.color}`,
      isSelected ? "interface-choice-zone--selected" : "",
      isDimmed ? "interface-choice-zone--dimmed" : "",
    ]
      .filter(Boolean)
      .join(" ")}
    style={style}
    aria-label={`Explorer ${choice.label}. ${choice.description}`}
    onClick={() => onSelect(choice.id)}
  >
    <span className="interface-choice-zone__shine" aria-hidden="true" />
    <span className="interface-choice-zone__content">
      <strong>{choice.label}</strong>
      <small>{choice.description}</small>
      <span>
        Explorer
        <FiArrowRight aria-hidden="true" />
      </span>
    </span>
  </button>
);
