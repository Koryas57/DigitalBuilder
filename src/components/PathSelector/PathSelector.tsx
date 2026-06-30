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

type PathCardStyle = React.CSSProperties & {
  "--card-image": string;
};

const iconMap = {
  code: FiCode,
  briefcase: FiBriefcase,
  cart: FiShoppingCart,
  orbit: FiCompass,
};

const CARD_REVEAL_MS = 620;
const CARD_TRANSITION_MS = 1120;
const CARD_REVEAL_END_MS = 1800;
const SWIPE_MIN_DISTANCE = 24;

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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [departingIndex, setDepartingIndex] = useState<number | null>(null);
  const [transitionDirection, setTransitionDirection] = useState<"next" | "previous">("next");
  const activeIndexRef = useRef(0);
  const isTransitioningRef = useRef(false);
  const pauseUntilRef = useRef(0);
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);
  const suppressClickRef = useRef(false);
  const transitionTimerRef = useRef<number>();
  const revealTimerRef = useRef<number>();
  const revealEndTimerRef = useRef<number>();
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
      if (isTransitioningRef.current) return;

      setTransitionDirection("next");
      animateToIndex((current) => (current + 1) % audiencePaths.length);
    }, 5400);

    return () => window.clearInterval(interval);
  }, [reducedMotion]);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) window.clearTimeout(transitionTimerRef.current);
      if (revealTimerRef.current) window.clearTimeout(revealTimerRef.current);
      if (revealEndTimerRef.current) window.clearTimeout(revealEndTimerRef.current);
    };
  }, []);

  const animateToIndex = (nextIndex: number | ((current: number) => number)) => {
    if (isTransitioningRef.current) return;

    const currentIndex = activeIndexRef.current;
    const resolvedIndex =
      typeof nextIndex === "function" ? nextIndex(currentIndex) : nextIndex;

    if (resolvedIndex === currentIndex) return;

    if (!reducedMotion) {
      isTransitioningRef.current = true;
      setIsTransitioning(true);
      setIsRevealing(false);
      setDepartingIndex(currentIndex);

      if (transitionTimerRef.current) window.clearTimeout(transitionTimerRef.current);
      if (revealTimerRef.current) window.clearTimeout(revealTimerRef.current);
      if (revealEndTimerRef.current) window.clearTimeout(revealEndTimerRef.current);

      revealTimerRef.current = window.setTimeout(() => {
        setIsRevealing(true);
      }, CARD_REVEAL_MS);

      transitionTimerRef.current = window.setTimeout(() => {
        setIsTransitioning(false);
        setDepartingIndex(null);
        isTransitioningRef.current = false;
      }, CARD_TRANSITION_MS);

      revealEndTimerRef.current = window.setTimeout(() => {
        setIsRevealing(false);
      }, CARD_REVEAL_END_MS);
    }

    activeIndexRef.current = resolvedIndex;
    setActiveIndex(resolvedIndex);
  };

  const pauseAutoRotation = () => {
    pauseUntilRef.current = Date.now() + 15000;
  };

  const goToPrevious = () => {
    pauseAutoRotation();
    setTransitionDirection("previous");
    animateToIndex((current) =>
      current === 0 ? audiencePaths.length - 1 : current - 1
    );
  };

  const goToNext = () => {
    pauseAutoRotation();
    setTransitionDirection("next");
    animateToIndex((current) => (current + 1) % audiencePaths.length);
  };

  const selectCard = (index: number) => {
    if (index === activeIndex) return;

    pauseAutoRotation();
    setTransitionDirection(getOffset(index, activeIndex) < 0 ? "previous" : "next");
    animateToIndex(index);
  };

  const startTouchSwipe = (event: React.TouchEvent<HTMLDivElement>) => {
    if (isTransitioningRef.current) return;

    const touch = event.touches[0];
    if (!touch) return;

    pauseAutoRotation();
    swipeStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const endTouchSwipe = (event: React.TouchEvent<HTMLDivElement>) => {
    const start = swipeStartRef.current;
    const touch = event.changedTouches[0];
    swipeStartRef.current = null;

    if (!start || !touch || isTransitioningRef.current) return;

    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    const isHorizontalSwipe =
      Math.abs(deltaX) >= SWIPE_MIN_DISTANCE && Math.abs(deltaX) > Math.abs(deltaY) * 0.95;

    if (!isHorizontalSwipe) return;

    suppressClickRef.current = true;
    window.setTimeout(() => {
      suppressClickRef.current = false;
    }, 420);

    if (deltaX < 0) goToNext();
    else goToPrevious();
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
        className={`path-carousel path-carousel--${transitionDirection} ${isTransitioning ? "is-transitioning" : ""} ${
          isRevealing ? "is-revealing" : ""
        }`}
        aria-live="polite"
        onMouseEnter={pauseAutoRotation}
        onTouchStart={startTouchSwipe}
        onTouchEnd={endTouchSwipe}
        onTouchCancel={endTouchSwipe}
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
            const isDeparting = departingIndex === index && isTransitioning;
            const zIndex = isActive ? 40 : isDeparting ? 24 : 20 - absOffset;

            return (
              <article
                className={`path-card path-card--${path.accent} path-card--offset-${offset} ${
                  isActive ? "is-active" : ""
                } ${isDeparting ? "is-departing" : ""}`}
                style={{
                  "--card-image": `url(${path.image})`,
                  zIndex,
                } as PathCardStyle}
                key={path.id}
                aria-hidden={!isActive}
                onClick={() => {
                  if (suppressClickRef.current) return;
                  selectCard(index);
                }}
                onMouseEnter={pauseAutoRotation}
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
