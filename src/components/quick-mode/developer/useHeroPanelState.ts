import { useCallback, useState } from "react";
import type { InterfaceChoice } from "./interfaceChoiceData";

export type HeroPanelState =
  | "idle"
  | "transitioning"
  | "playingInterfaceReveal"
  | "interfaceChoices"
  | "interfaceDetail";

export const useHeroPanelState = () => {
  const [panelState, setPanelState] = useState<HeroPanelState>("idle");
  const [selectedChoiceId, setSelectedChoiceId] = useState<InterfaceChoice["id"] | null>(null);
  const [videoPreload, setVideoPreload] = useState<"metadata" | "auto">("metadata");

  const prepareVideo = useCallback(() => {
    setVideoPreload("auto");
  }, []);

  const showChoices = useCallback(() => {
    setSelectedChoiceId(null);
    setPanelState("interfaceChoices");
  }, []);

  const openDetail = useCallback((choiceId: InterfaceChoice["id"]) => {
    setSelectedChoiceId(choiceId);
    setPanelState("interfaceDetail");
  }, []);

  const backToChoices = useCallback(() => {
    setSelectedChoiceId(null);
    setPanelState("interfaceChoices");
  }, []);

  const resetPanel = useCallback(() => {
    setSelectedChoiceId(null);
    setPanelState("idle");
    setVideoPreload("metadata");
  }, []);

  return {
    panelState,
    selectedChoiceId,
    videoPreload,
    setPanelState,
    prepareVideo,
    showChoices,
    openDetail,
    backToChoices,
    resetPanel,
  };
};
