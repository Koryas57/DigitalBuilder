import React from "react";
import type { MonsterPresenceState } from "../data/monsterMutantConfig";

export const useMonsterVisibility = (initialVisible: boolean) => {
  const [visible, setVisible] = React.useState(initialVisible);
  const [state, setState] = React.useState<MonsterPresenceState>(
    initialVisible ? "waiting" : "hidden"
  );

  const show = React.useCallback(() => {
    setVisible(true);
    setState("waiting");
  }, []);

  const hide = React.useCallback(() => {
    setVisible(false);
    setState("hidden");
  }, []);

  const toggle = React.useCallback(() => {
    setVisible((current) => {
      const nextVisible = !current;
      setState(nextVisible ? "waiting" : "hidden");
      return nextVisible;
    });
  }, []);

  return {
    visible,
    state,
    setState,
    show,
    hide,
    toggle,
  };
};
