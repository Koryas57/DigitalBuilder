import { useEffect } from "react";

interface InteractionSystemProps {
  nearStationId: string | null;
  onInteract: (stationId: string) => void;
  onClosePanel: () => void;
}

export const InteractionSystem: React.FC<InteractionSystemProps> = ({
  nearStationId,
  onInteract,
  onClosePanel,
}) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClosePanel();
        return;
      }

      if (event.key.toLowerCase() === "e" && nearStationId) {
        onInteract(nearStationId);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nearStationId, onClosePanel, onInteract]);

  return null;
};
