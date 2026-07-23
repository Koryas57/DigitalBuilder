import React, { useCallback, useEffect, useRef, useState } from "react";
import { FiRefreshCw } from "react-icons/fi";
import {
  INTERFACE_FINAL_FRAME_SRC,
  INTERFACE_POSTER_SRC,
  INTERFACE_VIDEO_SRC,
  type InterfaceChoice,
} from "./interfaceChoiceData";
import { InterfaceChoiceOverlay } from "./InterfaceChoiceOverlay";
import { useHeroPanelState } from "./useHeroPanelState";
import { useVideoEndFrame } from "./useVideoEndFrame";

type InterfaceRevealExperienceProps = {
  visualTabs: string[];
  children: React.ReactNode;
};

const useReducedMotion = () => {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);

    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return reducedMotion;
};

export const InterfaceRevealExperience: React.FC<InterfaceRevealExperienceProps> = ({ visualTabs, children }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const transitionTimeoutRef = useRef<number | null>(null);
  const reducedMotion = useReducedMotion();
  const [finalFrameAvailable, setFinalFrameAvailable] = useState(true);
  const {
    panelState,
    selectedChoiceId,
    videoPreload,
    setPanelState,
    prepareVideo,
    showChoices,
    openDetail,
    backToChoices,
    resetPanel,
  } = useHeroPanelState();

  const isPlaying = panelState === "playingInterfaceReveal";
  const isLocked = panelState === "transitioning" || isPlaying;
  const showInteractiveChoices = panelState === "interfaceChoices" || panelState === "interfaceDetail";

  useVideoEndFrame({
    videoRef,
    isPlaying,
    onEndFrame: useCallback(() => {
      showChoices();
    }, [showChoices]),
  });

  useEffect(
    () => () => {
      if (transitionTimeoutRef.current) {
        window.clearTimeout(transitionTimeoutRef.current);
      }
    },
    [],
  );

  const startReveal = useCallback(() => {
    if (isLocked) {
      return;
    }

    prepareVideo();

    if (reducedMotion) {
      showChoices();
      return;
    }

    setPanelState("transitioning");

    transitionTimeoutRef.current = window.setTimeout(() => {
      const video = videoRef.current;

      if (!video) {
        showChoices();
        return;
      }

      video.pause();
      video.currentTime = 0;
      video.playbackRate = 1.75;
      setPanelState("playingInterfaceReveal");

      void video.play().catch(() => {
        showChoices();
      });
    }, 260);
  }, [isLocked, prepareVideo, reducedMotion, setPanelState, showChoices]);

  const reset = useCallback(() => {
    const video = videoRef.current;

    if (video) {
      video.pause();
      video.currentTime = 0;
      video.playbackRate = 1;
    }

    resetPanel();
  }, [resetPanel]);

  const handleVideoProgress = useCallback(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    video.playbackRate = video.currentTime < 5.4 ? 1.75 : 1.35;
  }, []);

  const handleChoiceSelect = useCallback(
    (choiceId: InterfaceChoice["id"]) => {
      if (!isLocked) {
        openDetail(choiceId);
      }
    },
    [isLocked, openDetail],
  );

  return (
    <div
      className={[
        "quick-interface-experience",
        `quick-interface-experience--${panelState}`,
        showInteractiveChoices ? "quick-interface-experience--choices-visible" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <img
        className="quick-hero-visual__poster"
        src={INTERFACE_POSTER_SRC}
        alt="Architecture futuriste lumineuse evoquant une experience web 3D premium"
        width="890"
        height="490"
        loading="eager"
      />
      <video
        ref={videoRef}
        className="quick-hero-visual__video"
        src={INTERFACE_VIDEO_SRC}
        muted
        playsInline
        preload={videoPreload}
        aria-hidden="true"
        onTimeUpdate={handleVideoProgress}
      />
      {showInteractiveChoices && finalFrameAvailable && (
        <img
          className="quick-hero-visual__final-frame"
          src={INTERFACE_FINAL_FRAME_SRC}
          alt=""
          aria-hidden="true"
          onError={() => setFinalFrameAvailable(false)}
        />
      )}

      <div className="quick-hero-visual__veil" aria-hidden="true" />

      <div className="quick-interface-experience__idle">{children}</div>

      {showInteractiveChoices && (
        <InterfaceChoiceOverlay
          selectedChoiceId={selectedChoiceId}
          onSelect={handleChoiceSelect}
          onBack={backToChoices}
        />
      )}

      <div className="quick-hero-visual__thumbs" aria-label="Selections visuelles du panneau">
        {visualTabs.map((tab) => {
          const isInterface = tab.toLowerCase() === "interface";

          return (
            <button
              key={tab}
              type="button"
              className={isInterface ? "quick-hero-visual__tab quick-hero-visual__tab--active" : "quick-hero-visual__tab"}
              disabled={isLocked}
              onClick={isInterface ? startReveal : undefined}
              onMouseEnter={isInterface ? prepareVideo : undefined}
              onFocus={isInterface ? prepareVideo : undefined}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {(showInteractiveChoices || isPlaying) && (
        <div className="quick-interface-experience__controls" aria-label="Controles de l'experience Interface">
          <button type="button" onClick={reset}>
            <FiRefreshCw aria-hidden="true" />
            Reinitialiser
          </button>
        </div>
      )}
    </div>
  );
};
