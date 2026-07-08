import React, { useEffect } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import { useMapBuilderStore } from "./mapBuilderStore";

const isEditableTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;
  const tagName = target.tagName.toLowerCase();
  return tagName === "input" || tagName === "textarea" || tagName === "select" || target.isContentEditable;
};

export const TransformManager: React.FC = () => {
  const gridSize = useMapBuilderStore((state) => state.gridSize);
  const isMoveMode = useMapBuilderStore((state) => state.isMoveMode);
  const selectedId = useMapBuilderStore((state) => state.selectedId);
  const setMoveMode = useMapBuilderStore((state) => state.setMoveMode);
  const moveSelected = useMapBuilderStore((state) => state.moveSelected);
  const nudgeSelected = useMapBuilderStore((state) => state.nudgeSelected);
  const rotateSelected = useMapBuilderStore((state) => state.rotateSelected);
  const rotateSelectedBy = useMapBuilderStore((state) => state.rotateSelectedBy);
  const deleteSelected = useMapBuilderStore((state) => state.deleteSelected);
  const duplicateSelected = useMapBuilderStore((state) => state.duplicateSelected);
  const cycleSnapSize = useMapBuilderStore((state) => state.cycleSnapSize);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return;

      const key = event.key.toLowerCase();

      if ((event.ctrlKey || event.metaKey) && key === "d") {
        event.preventDefault();
        duplicateSelected();
        return;
      }

      if (key === "g") {
        event.preventDefault();
        setMoveMode(Boolean(selectedId));
        return;
      }

      if (event.key === "[") {
        event.preventDefault();
        cycleSnapSize("finer");
        return;
      }

      if (event.key === "]") {
        event.preventDefault();
        cycleSnapSize("larger");
        return;
      }

      if (key === "r") {
        event.preventDefault();
        rotateSelected();
        return;
      }

      if (key === "q") {
        event.preventDefault();
        rotateSelectedBy(event.shiftKey ? -5 : -90);
        return;
      }

      if (key === "e") {
        event.preventDefault();
        rotateSelectedBy(event.shiftKey ? 5 : 90);
        return;
      }

      if (selectedId && ["arrowleft", "arrowright", "arrowup", "arrowdown"].includes(key)) {
        event.preventDefault();
        const amount = event.altKey ? 0.01 : gridSize * (event.shiftKey ? 5 : 1);
        if (key === "arrowleft") nudgeSelected("x", -amount);
        if (key === "arrowright") nudgeSelected("x", amount);
        if (key === "arrowup") nudgeSelected("z", -amount);
        if (key === "arrowdown") nudgeSelected("z", amount);
        return;
      }

      if (selectedId && key === "pageup") {
        event.preventDefault();
        nudgeSelected("y", event.altKey ? 0.01 : gridSize * (event.shiftKey ? 5 : 1));
        return;
      }

      if (selectedId && key === "pagedown") {
        event.preventDefault();
        nudgeSelected("y", -(event.altKey ? 0.01 : gridSize * (event.shiftKey ? 5 : 1)));
        return;
      }

      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        deleteSelected();
        return;
      }

      if (event.key === "Escape" || event.key === "Enter") {
        setMoveMode(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    cycleSnapSize,
    deleteSelected,
    duplicateSelected,
    gridSize,
    nudgeSelected,
    rotateSelected,
    rotateSelectedBy,
    selectedId,
    setMoveMode,
  ]);

  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    if (!isMoveMode || !selectedId) return;
    moveSelected([event.point.x, 0, event.point.z]);
  };

  const handlePointerDown = () => {
    if (isMoveMode) setMoveMode(false);
  };

  return (
    <mesh
      position={[0, -0.01, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
    >
      <planeGeometry args={[500, 500]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  );
};
