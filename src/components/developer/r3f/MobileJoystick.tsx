import React, { useRef } from "react";
import { FiArrowLeft, FiChevronUp, FiList } from "react-icons/fi";

interface MobileJoystickProps {
  onMoveChange: (input: { x: number; z: number }) => void;
  onLook: (delta: { x: number; y: number }) => void;
  onInteract: () => void;
  onQuickMode: () => void;
  onBackToSelector: () => void;
  canInteract: boolean;
  showNavigation?: boolean;
}

export const MobileJoystick: React.FC<MobileJoystickProps> = ({
  onMoveChange,
  onLook,
  onInteract,
  onQuickMode,
  onBackToSelector,
  canInteract,
  showNavigation = true,
}) => {
  const padRef = useRef<HTMLDivElement | null>(null);
  const lookStartRef = useRef<{ x: number; y: number } | null>(null);

  const updateMove = (clientX: number, clientY: number) => {
    const rect = padRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (clientX - rect.left) / rect.width - 0.5;
    const y = (clientY - rect.top) / rect.height - 0.5;
    const length = Math.hypot(x, y) || 1;
    const multiplier = Math.min(length * 2, 1);

    onMoveChange({
      x: (x / length) * multiplier,
      z: (y / length) * multiplier,
    });
  };

  return (
    <div className="developer-r3f-touch">
      {showNavigation && (
        <div className="developer-r3f-touch__nav">
          <button type="button" onClick={onBackToSelector}>
            <FiArrowLeft aria-hidden="true" />
            Parcours
          </button>
          <button type="button" onClick={onQuickMode}>
            <FiList aria-hidden="true" />
            Rapide
          </button>
        </div>
      )}

      <div
        className="developer-r3f-touch__pad"
        ref={padRef}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          updateMove(event.clientX, event.clientY);
        }}
        onPointerMove={(event) => updateMove(event.clientX, event.clientY)}
        onPointerUp={() => onMoveChange({ x: 0, z: 0 })}
        onPointerCancel={() => onMoveChange({ x: 0, z: 0 })}
        aria-label="Joystick tactile"
      >
        <FiChevronUp aria-hidden="true" />
      </div>

      <div
        className="developer-r3f-touch__look"
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          lookStartRef.current = { x: event.clientX, y: event.clientY };
        }}
        onPointerMove={(event) => {
          if (lookStartRef.current === null) return;
          const delta = {
            x: event.clientX - lookStartRef.current.x,
            y: event.clientY - lookStartRef.current.y,
          };
          lookStartRef.current = { x: event.clientX, y: event.clientY };
          onLook(delta);
        }}
        onPointerUp={() => {
          lookStartRef.current = null;
        }}
        onPointerCancel={() => {
          lookStartRef.current = null;
        }}
        aria-label="Zone de camera tactile"
      />

      <div className="developer-r3f-touch__actions">
        <button
          className="developer-r3f-touch__interact"
          type="button"
          onClick={onInteract}
          disabled={!canInteract}
        >
          Interagir
        </button>
      </div>
    </div>
  );
};
