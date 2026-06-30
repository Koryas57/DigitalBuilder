import { useCallback, useEffect, useMemo, useState } from "react";

const INTRO_ENABLED = true;
const INTRO_SESSION_KEY = "yacine_intro_session_id";
const INTRO_SEEN_KEY = "yacine_intro_seen_session";
const FORCE_INTRO_KEY = "yacine_force_intro";

const createFallbackId = () =>
  `session-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const getSessionId = () => {
  const existingSessionId = sessionStorage.getItem(INTRO_SESSION_KEY);
  if (existingSessionId) return existingSessionId;

  const sessionId = crypto.randomUUID?.() ?? createFallbackId();
  sessionStorage.setItem(INTRO_SESSION_KEY, sessionId);
  return sessionId;
};

const shouldShowIntroInitially = () => {
  if (!INTRO_ENABLED || typeof window === "undefined") return false;

  try {
    const params = new URLSearchParams(window.location.search);
    const forceIntro =
      params.get("intro") === "1" ||
      localStorage.getItem(FORCE_INTRO_KEY) === "true";

    const sessionId = getSessionId();
    const hasSeenIntro = localStorage.getItem(INTRO_SEEN_KEY) === sessionId;

    return forceIntro || !hasSeenIntro;
  } catch {
    return true;
  }
};

export const useIntroState = () => {
  const [isIntroVisible, setIsIntroVisible] = useState(shouldShowIntroInitially);

  const shouldForceIntro = useMemo(() => {
    if (typeof window === "undefined") return false;

    try {
      const params = new URLSearchParams(window.location.search);
      return (
        params.get("intro") === "1" ||
        localStorage.getItem(FORCE_INTRO_KEY) === "true"
      );
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    if (shouldForceIntro) setIsIntroVisible(true);
  }, [shouldForceIntro]);

  const completeIntro = useCallback(() => {
    try {
      const sessionId = getSessionId();
      localStorage.setItem(INTRO_SEEN_KEY, sessionId);
    } catch {
      // The intro remains skippable even if browser storage is unavailable.
    }
    setIsIntroVisible(false);
  }, []);

  return {
    isIntroVisible,
    completeIntro,
  };
};
