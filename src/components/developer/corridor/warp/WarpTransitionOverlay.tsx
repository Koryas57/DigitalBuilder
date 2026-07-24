import React from "react";
import type { WarpTransitionState } from "../../../../data/corridorNarrativeConfig";

interface WarpTransitionOverlayProps {
  state: WarpTransitionState;
  reducedMotion: boolean;
}

type GhostParticleStyle = React.CSSProperties & {
  "--ghost-x": string;
  "--ghost-y": string;
  "--ghost-dx": string;
  "--ghost-dy": string;
  "--ghost-delay": string;
  "--ghost-duration": string;
  "--ghost-width": string;
  "--ghost-height": string;
  "--ghost-rotation": string;
  "--ghost-hue": string;
};

const GHOST_PARTICLES = Array.from({ length: 24 }, (_, index) => {
  const angle = (index / 24) * Math.PI * 2 + (index % 3) * 0.12;
  const startRadius = 5 + (index % 5) * 1.8;
  const travelRadius = 20 + (index % 7) * 3.3;

  return {
    id: index,
    style: {
      "--ghost-x": `${Math.cos(angle) * startRadius}vw`,
      "--ghost-y": `${Math.sin(angle) * startRadius * 0.72}vh`,
      "--ghost-dx": `${Math.cos(angle) * travelRadius}vw`,
      "--ghost-dy": `${Math.sin(angle) * travelRadius * 0.72}vh`,
      "--ghost-delay": `${(index % 8) * 55}ms`,
      "--ghost-duration": `${1800 + (index % 6) * 170}ms`,
      "--ghost-width": `${18 + (index % 5) * 5}px`,
      "--ghost-height": `${58 + (index % 7) * 11}px`,
      "--ghost-rotation": `${(index % 2 === 0 ? 1 : -1) * (18 + index * 7)}deg`,
      "--ghost-hue": index % 3 === 0 ? "176deg" : "222deg",
    } as GhostParticleStyle,
  };
});

export const WarpTransitionOverlay: React.FC<WarpTransitionOverlayProps> = ({
  state,
  reducedMotion,
}) => {
  const [arrivalParticlesVisible, setArrivalParticlesVisible] =
    React.useState(false);
  const arrivalTimerRef = React.useRef<number | null>(null);
  const visible =
    state === "entering" ||
    state === "fadingOut" ||
    state === "teleporting" ||
    state === "fadingIn";

  React.useEffect(() => {
    if (state !== "fadingIn") return undefined;

    if (arrivalTimerRef.current !== null) {
      window.clearTimeout(arrivalTimerRef.current);
    }
    setArrivalParticlesVisible(true);
    arrivalTimerRef.current = window.setTimeout(
      () => {
        setArrivalParticlesVisible(false);
        arrivalTimerRef.current = null;
      },
      reducedMotion ? 900 : 2800
    );

    return undefined;
  }, [reducedMotion, state]);

  React.useEffect(
    () => () => {
      if (arrivalTimerRef.current !== null) {
        window.clearTimeout(arrivalTimerRef.current);
      }
    },
    []
  );

  return (
    <>
      <div
        className={`developer-warp-transition is-${state}${
          reducedMotion ? " is-reduced-motion" : ""
        }`}
        aria-hidden={!visible}
      >
        <div className="developer-warp-transition__tunnel" />
        <div className="developer-warp-transition__departure-particles">
          {GHOST_PARTICLES.slice(0, 16).map(({ id, style }) => (
            <i key={id} style={style} />
          ))}
        </div>
        <div className="developer-warp-transition__veil" />
        <div className="developer-warp-transition__flash" />
      </div>

      <div
        className={`developer-warp-arrival-particles${
          arrivalParticlesVisible ? " is-visible" : ""
        }${reducedMotion ? " is-reduced-motion" : ""}`}
        aria-hidden="true"
      >
        {GHOST_PARTICLES.map(({ id, style }) => (
          <i key={id} style={style} />
        ))}
      </div>
    </>
  );
};
