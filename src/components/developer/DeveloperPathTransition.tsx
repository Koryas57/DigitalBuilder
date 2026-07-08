import React from "react";

interface DeveloperPathTransitionProps {
  isActive: boolean;
}

export const DeveloperPathTransition: React.FC<DeveloperPathTransitionProps> = ({
  isActive,
}) => {
  if (!isActive) return null;

  return (
    <div className="developer-path-transition" aria-hidden="true">
      <span />
      <i />
    </div>
  );
};
