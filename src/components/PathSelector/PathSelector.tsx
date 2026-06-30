import React, { useEffect, useRef, useState } from "react";
import {
  FiArrowLeft,
  FiArrowRight,
  FiBriefcase,
  FiCheckCircle,
  FiCode,
  FiCompass,
  FiShoppingCart,
} from "react-icons/fi";
import { audiencePaths } from "../../data/audiencePaths";
import { ParticleField } from "../CinematicIntro/ParticleField";
import "./PathSelector.scss";

interface PathSelectorProps {
  onSelectPath: () => void;
}

const iconMap = {
  code: FiCode,
  briefcase: FiBriefcase,
  cart: FiShoppingCart,
  orbit: FiCompass,
};

const getOffset = (index: number, activeIndex: number) => {
  const length = audiencePaths.length;
  let offset = index - activeIndex;

  if (offset > length / 2) offset -= length;
  if (offset < -length / 2) offset += length;

  return offset;
};

export const PathSelector: React.FC<PathSelectorProps> = ({ onSelectPath }) => {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const pauseUntilRef = useRef(0);
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);
  const suppressClickRef = useRef(false);
  const lastSwipeAtRef = useRef(0);
  const activePath = audiencePaths[activeIndex];

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateReducedMotion = () => setReducedMotion(mediaQuery.matches);

    updateReducedMotion();
    mediaQuery.addEventListener("change", updateReducedMotion);

    return () => mediaQuery.removeEventListener("change", updateReducedMotion);
  }, []);

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    const interval = window.setInterval(() => {
      if (Date.now() < pauseUntilRef.current) return;
      setActiveIndex((current) => (current + 1) % audiencePaths.length);
    }, 5400);

    return () => window.clearInterval(interval);
  }, [reducedMotion]);

  const pauseAutoRotation = () => {
    pauseUntilRef.current = Date.now() + 15000;
  };

  const goToPrevious = () => {
    pauseAutoRotation();
    setActiveIndex((current) =>
      current === 0 ? audiencePaths.length - 1 : current - 1
    );
  };

  const goToNext = () => {
    pauseAutoRotation();
    setActiveIndex((current) => (current + 1) % audiencePaths.length);
  };

  const selectCard = (index: number) => {
    pauseAutoRotation();
    setActiveIndex(index);
  };

  const completeSwipe = (deltaX: number, deltaY: number) => {
    const isHorizontalSwipe = Math.abs(deltaX) > 44 && Math.abs(deltaX) > Math.abs(deltaY) * 1.25;

    if (!isHorizontalSwipe || Date.now() - lastSwipeAtRef.current < 280) return;

    lastSwipeAtRef.current = Date.now();
    suppressClickRef.current = true;
    window.setTimeout(() => {
      suppressClickRef.current = false;
    }, 350);

    if (deltaX < 0) goToNext();
    else goToPrevious();
  };

  const startSwipe = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse") return;
    pauseAutoRotation();
    swipeStartRef.current = { x: event.clientX, y: event.clientY };
  };

  const endSwipe = (event: React.PointerEvent<HTMLDivElement>) => {
    const start = swipeStartRef.current;
    swipeStartRef.current = null;

    if (!start || event.pointerType === "mouse") return;

    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;
    completeSwipe(deltaX, deltaY);
  };

  const startTouchSwipe = (event: React.TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    if (!touch) return;

    pauseAutoRotation();
    swipeStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const endTouchSwipe = (event: React.TouchEvent<HTMLDivElement>) => {
    const start = swipeStartRef.current;
    const touch = event.changedTouches[0];
    swipeStartRef.current = null;

    if (!start || !touch) return;

    completeSwipe(touch.clientX - start.x, touch.clientY - start.y);
  };

  return (
    <section className={`path-selector path-selector--${activePath.accent}`} aria-label="Choix de parcours">
      <ParticleField reducedMotion={reducedMotion} />
      <div className="path-selector__topology" aria-hidden="true" />
      <div className="path-selector__aurora" aria-hidden="true" />

      <div className="path-selector__intro">
        <h2>Choisissez votre <em>parcours</em></h2>
        <p>Chaque parcours révèle une facette de mon travail. Choisissez celui qui correspond à votre besoin.</p>
      </div>

      <div
        className="path-carousel"
        aria-live="polite"
        onMouseEnter={pauseAutoRotation}
        onTouchStart={startTouchSwipe}
        onTouchEnd={endTouchSwipe}
        onPointerDown={startSwipe}
        onPointerUp={endSwipe}
        onPointerCancel={() => {
          swipeStartRef.current = null;
        }}
      >
        <button className="path-carousel__control path-carousel__control--left" type="button" onClick={goToPrevious} aria-label="Parcours précédent">
          <FiArrowLeft aria-hidden="true" />
        </button>

        <div className="path-carousel__stage">
          {audiencePaths.map((path, index) => {
            const Icon = iconMap[path.icon as keyof typeof iconMap];
            const offset = getOffset(index, activeIndex);
            const absOffset = Math.abs(offset);
            const isActive = offset === 0;

            return (
              <article
                className={`path-card path-card--${path.accent} path-card--offset-${offset} ${isActive ? "is-active" : ""}`}
                style={{
                  "--card-image": `url(${path.image})`,
                  zIndex: isActive ? 30 : 20 - absOffset,
                } as React.CSSProperties}
                key={path.id}
                aria-hidden={!isActive}
                onClick={() => {
                  if (suppressClickRef.current) return;
                  selectCard(index);
                }}
                onMouseEnter={pauseAutoRotation}
                onTouchStart={pauseAutoRotation}
              >
                <div className="path-card__inner">
                  <div className="path-card__icon">
                    <Icon aria-hidden="true" />
                  </div>
                  <h3>{path.title}</h3>
                  <p>{path.intro}</p>
                  <ul>
                    {path.items.map((item) => (
                      <li key={item}>
                        <FiCheckCircle aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      if (isActive) onSelectPath();
                      else selectCard(index);
                    }}
                    tabIndex={isActive ? 0 : -1}
                  >
                    Accéder au parcours
                    <span>
                      <FiArrowRight aria-hidden="true" />
                    </span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        <button className="path-carousel__control path-carousel__control--right" type="button" onClick={goToNext} aria-label="Parcours suivant">
          <FiArrowRight aria-hidden="true" />
        </button>
      </div>

      <div className="path-carousel__dots" aria-label="Sélection du parcours">
        {audiencePaths.map((path, index) => (
          <button
            type="button"
            className={index === activeIndex ? "is-active" : ""}
            onClick={() => selectCard(index)}
            aria-label={`Afficher le parcours ${path.title}`}
            key={path.id}
          />
        ))}
      </div>

      <div className="path-selector__free">
        <span aria-hidden="true">✧</span>
        <p>Pas encore sûr ?</p>
        <button type="button" onClick={onSelectPath}>
          Explorer le site librement
        </button>
      </div>
    </section>
  );
};
