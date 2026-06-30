import React, { useEffect, useState } from "react";
import { IntroTypography } from "./IntroTypography";
import { ParticleField } from "./ParticleField";
import "./CinematicIntro.scss";

interface CinematicIntroProps {
  onComplete: () => void;
  onPrepareExit?: () => void;
}

const INTRO_DURATION_MS = 26200;
const REDUCED_MOTION_DURATION_MS = 3600;

export const CinematicIntro: React.FC<CinematicIntroProps> = ({ onComplete, onPrepareExit }) => {
  const [isLeaving, setIsLeaving] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateReducedMotion = () => setReducedMotion(mediaQuery.matches);

    updateReducedMotion();
    mediaQuery.addEventListener("change", updateReducedMotion);

    return () => mediaQuery.removeEventListener("change", updateReducedMotion);
  }, []);

  useEffect(() => {
    const duration = reducedMotion ? REDUCED_MOTION_DURATION_MS : INTRO_DURATION_MS;
    const timer = window.setTimeout(() => {
      onPrepareExit?.();
      setIsLeaving(true);
    }, duration);

    return () => window.clearTimeout(timer);
  }, [onPrepareExit, reducedMotion]);

  useEffect(() => {
    if (!isLeaving) return;

    const timer = window.setTimeout(onComplete, 900);
    return () => window.clearTimeout(timer);
  }, [isLeaving, onComplete]);

  const skipIntro = () => {
    onPrepareExit?.();
    setIsLeaving(true);
  };

  return (
    <section
      className={`cinematic-intro ${isLeaving ? "cinematic-intro--leaving" : ""} ${
        reducedMotion ? "cinematic-intro--reduced" : ""
      }`}
      aria-label="Intro cinématique"
    >
      <ParticleField reducedMotion={reducedMotion} />
      <div className="cinematic-intro__depth" aria-hidden="true" />
      <div className="cinematic-intro__flare" aria-hidden="true" />
      <div className="cinematic-intro__tunnel" aria-hidden="true" />
      <div className="cinematic-intro__flash" aria-hidden="true" />
      <div className="cinematic-intro__vignette" aria-hidden="true" />
      <IntroTypography />
      <button className="cinematic-intro__skip" type="button" onClick={skipIntro}>
        Passer l'intro
      </button>
    </section>
  );
};
