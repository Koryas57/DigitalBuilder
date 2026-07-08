import React, { useEffect, useState } from "react";
import { FiArrowLeft, FiMail, FiZap } from "react-icons/fi";
import { CorridorGameExperience } from "./corridor/CorridorGameExperience";
import { MobileJoystick } from "./r3f/MobileJoystick";

interface DeveloperImmersiveExperienceProps {
  onQuickMode: () => void;
  onBackToSelector: () => void;
}

const canUseWebGL = () => {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
};

export const DeveloperImmersiveExperience: React.FC<DeveloperImmersiveExperienceProps> = ({
  onQuickMode,
  onBackToSelector,
}) => {
  const [webGLAvailable, setWebGLAvailable] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [movementInput, setMovementInput] = useState({ x: 0, z: 0 });
  const [lookInput, setLookInput] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setWebGLAvailable(canUseWebGL());

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateReducedMotion = () => setReducedMotion(mediaQuery.matches);

    updateReducedMotion();
    mediaQuery.addEventListener("change", updateReducedMotion);

    return () => mediaQuery.removeEventListener("change", updateReducedMotion);
  }, []);

  return (
    <div className="developer-r3f developer-r3f--corridor">
      <div className="developer-r3f__top">
        <button type="button" onClick={onBackToSelector}>
          <FiArrowLeft aria-hidden="true" />
          Retour parcours
        </button>
        <button type="button" onClick={onQuickMode}>
          <FiZap aria-hidden="true" />
          Mode rapide
        </button>
        <a href="/#contact">
          <FiMail aria-hidden="true" />
          Contact
        </a>
        <span>
          WASD / ZQSD avancer - souris regarder - Shift sprint - R reset - P position
        </span>
      </div>

      <div className="developer-r3f__stage">
        {webGLAvailable ? (
          <CorridorGameExperience
            movementInput={movementInput}
            lookInput={lookInput}
            reducedMotion={reducedMotion}
          />
        ) : (
          <div className="developer-r3f-fallback">
            <p>WebGL indisponible</p>
            <h2>Visite reduite</h2>
            <span>
              Votre navigateur ne peut pas charger la scene 3D. Les fragments
              restent accessibles en mode rapide.
            </span>
            <div>
              <button type="button" onClick={onQuickMode}>
                Mode rapide
              </button>
              <button type="button" onClick={onBackToSelector}>
                Retour parcours
              </button>
            </div>
          </div>
        )}

        <MobileJoystick
          onMoveChange={setMovementInput}
          onLook={(delta) =>
            setLookInput((current) => ({
              x: current.x + delta.x,
              y: current.y + delta.y,
            }))
          }
          onInteract={() => undefined}
          onQuickMode={onQuickMode}
          onBackToSelector={onBackToSelector}
          canInteract={false}
        />
      </div>
    </div>
  );
};
