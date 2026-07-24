import React from "react";

interface ObjectiveNotificationProps {
  visible: boolean;
  label: string;
  text: string;
}

export const ObjectiveNotification: React.FC<ObjectiveNotificationProps> = ({
  visible,
  label,
  text,
}) => (
  <div
    className={`corridor-objective${visible ? " is-visible" : ""}`}
    role="status"
    aria-live="polite"
    aria-hidden={!visible}
  >
    <span>{label}</span>
    <strong>{text}</strong>
  </div>
);
