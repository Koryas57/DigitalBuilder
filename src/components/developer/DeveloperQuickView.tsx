import React from "react";
import { DeveloperQuickMode } from "../quick-mode/developer/DeveloperQuickMode";

interface DeveloperQuickViewProps {
  onImmersiveMode: () => void;
  onBackToPaths: () => void;
  onReplayIntro: () => void;
}

export const DeveloperQuickView: React.FC<DeveloperQuickViewProps> = ({
  onImmersiveMode,
  onBackToPaths,
  onReplayIntro,
}) => (
  <DeveloperQuickMode
    onImmersiveMode={onImmersiveMode}
    onBackToPaths={onBackToPaths}
    onReplayIntro={onReplayIntro}
  />
);
