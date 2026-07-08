import React, { useCallback, useState } from "react";
import { CinematicIntro } from "../CinematicIntro/CinematicIntro";
import { PathSelector } from "../PathSelector/PathSelector";
import { DeveloperExperience } from "../developer/DeveloperExperience";
import { PathPlaceholder } from "./PathPlaceholder";
import { getExperiencePath, type PathId } from "../../data/paths";
import { useIntroState } from "../../hooks/useIntroState";
import "./ExperienceShell.scss";

type ExperienceView = "pathSelection" | "developerPath" | "placeholder";

export const ExperienceShell: React.FC = () => {
  const { isIntroVisible, completeIntro } = useIntroState();
  const [showIntro, setShowIntro] = useState(isIntroVisible);
  const [view, setView] = useState<ExperienceView>("pathSelection");
  const [selectedPathId, setSelectedPathId] = useState<PathId | null>(null);

  const showPathSelection = useCallback(() => {
    setSelectedPathId(null);
    setView("pathSelection");
  }, []);

  const replayIntro = useCallback(() => {
    showPathSelection();
    setShowIntro(true);
  }, [showPathSelection]);

  const handleIntroComplete = useCallback(() => {
    completeIntro();
    setShowIntro(false);
    setView("pathSelection");
  }, [completeIntro]);

  const handleSelectPath = useCallback((pathId?: string) => {
    const path = pathId ? getExperiencePath(pathId) : null;

    if (!path || path.id === "developpeur") {
      setSelectedPathId("developpeur");
      setView("developerPath");
      return;
    }

    setSelectedPathId(path.id);
    setView("placeholder");
  }, []);

  const selectedPath = selectedPathId ? getExperiencePath(selectedPathId) : null;

  return (
    <main className="experience-shell">
      {view === "pathSelection" && <PathSelector onSelectPath={handleSelectPath} />}

      {view === "developerPath" && (
        <DeveloperExperience
          onBackToPaths={showPathSelection}
          onReplayIntro={replayIntro}
        />
      )}

      {view === "placeholder" && selectedPath && (
        <PathPlaceholder
          path={selectedPath}
          onBackToPaths={showPathSelection}
          onReplayIntro={replayIntro}
        />
      )}

      {showIntro && (
        <CinematicIntro
          onComplete={handleIntroComplete}
          onPrepareExit={showPathSelection}
        />
      )}
    </main>
  );
};
