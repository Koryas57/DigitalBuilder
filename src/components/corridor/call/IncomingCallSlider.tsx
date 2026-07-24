import React from "react";
import { FiPhoneCall } from "react-icons/fi";
import { FIRST_CALL_UI } from "../../../data/firstCallConfig";

interface IncomingCallSliderProps {
  onAnswer: () => void;
  disabled?: boolean;
}

const ANSWER_THRESHOLD = 0.78;
const KEYBOARD_STEP = 0.12;

export const IncomingCallSlider: React.FC<IncomingCallSliderProps> = ({
  onAnswer,
  disabled = false,
}) => {
  const [progress, setProgress] = React.useState(0);
  const [dragging, setDragging] = React.useState(false);
  const [completing, setCompleting] = React.useState(false);
  const trackRef = React.useRef<HTMLDivElement | null>(null);
  const thumbRef = React.useRef<HTMLDivElement | null>(null);
  const progressRef = React.useRef(0);
  const startRef = React.useRef({ pointerX: 0, progress: 0 });
  const completionTimerRef = React.useRef<number | null>(null);

  const updateProgress = React.useCallback((next: number) => {
    const clamped = Math.min(1, Math.max(0, next));
    progressRef.current = clamped;
    setProgress(clamped);
  }, []);

  const complete = React.useCallback(() => {
    if (disabled || completing) return;
    setDragging(false);
    setCompleting(true);
    updateProgress(1);
    completionTimerRef.current = window.setTimeout(onAnswer, 220);
  }, [completing, disabled, onAnswer, updateProgress]);

  React.useEffect(
    () => () => {
      if (completionTimerRef.current !== null) {
        window.clearTimeout(completionTimerRef.current);
      }
    },
    []
  );

  const getTravel = React.useCallback(() => {
    const track = trackRef.current;
    const thumb = thumbRef.current;
    if (!track || !thumb) return 1;
    const trackStyle = window.getComputedStyle(track);
    const horizontalPadding =
      Number.parseFloat(trackStyle.paddingLeft) +
      Number.parseFloat(trackStyle.paddingRight);
    return Math.max(1, track.clientWidth - thumb.offsetWidth - horizontalPadding);
  }, []);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || completing) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    startRef.current = { pointerX: event.clientX, progress };
    setDragging(true);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging || disabled || completing) return;
    event.preventDefault();
    const next =
      startRef.current.progress +
      (event.clientX - startRef.current.pointerX) / getTravel();
    updateProgress(next);
  };

  const release = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setDragging(false);
    if (progressRef.current >= ANSWER_THRESHOLD) {
      complete();
    } else {
      updateProgress(0);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled || completing) return;
    if (event.key === "ArrowRight") {
      event.preventDefault();
      updateProgress(progressRef.current + KEYBOARD_STEP);
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      updateProgress(progressRef.current - KEYBOARD_STEP);
    }
    if (event.key === "Home") {
      event.preventDefault();
      updateProgress(0);
    }
    if (event.key === "End") {
      event.preventDefault();
      updateProgress(1);
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      complete();
    }
  };

  return (
    <div
      ref={trackRef}
      className={`first-call-slider${dragging ? " is-dragging" : ""}${
        completing ? " is-completing" : ""
      }`}
      style={{ "--call-progress": progress } as React.CSSProperties}
    >
      <span className="first-call-slider__hint" aria-hidden="true">
        {FIRST_CALL_UI.slideHint}
        <i>››</i>
      </span>
      <span className="first-call-slider__target" aria-hidden="true">
        <FiPhoneCall />
      </span>
      <div
        ref={thumbRef}
        className="first-call-slider__thumb"
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label="Décrocher l’appel"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
        aria-valuetext={`${Math.round(progress * 100)} % vers décrocher`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={release}
        onPointerCancel={release}
        onKeyDown={handleKeyDown}
      >
        <FiPhoneCall aria-hidden="true" />
      </div>
      <button
        className="first-call-slider__accessible-answer"
        type="button"
        onClick={complete}
        disabled={disabled}
      >
        Décrocher l’appel
      </button>
    </div>
  );
};
