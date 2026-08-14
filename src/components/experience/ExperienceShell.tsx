import React, { Suspense, useCallback, useEffect, useLayoutEffect, useState } from "react";
import { CinematicIntro } from "../CinematicIntro/CinematicIntro";
import { PathSelector } from "../PathSelector/PathSelector";
import { PathPlaceholder } from "./PathPlaceholder";
import { getExperiencePath, type PathId } from "../../data/paths";
import { useIntroState } from "../../hooks/useIntroState";
import { resetDocumentScroll } from "../../utils/scrollPosition";
import "./ExperienceShell.scss";

type ExperienceView =
  | "pathSelection"
  | "developerPath"
  | "commercePath"
  | "placeholder";

const getInitialExperience = (): {
  view: ExperienceView;
  selectedPathId: PathId | null;
} => {
  if (typeof window === "undefined") {
    return { view: "pathSelection", selectedPathId: null };
  }

  const requestedPath = new URLSearchParams(window.location.search).get(
    "path"
  );
  const path = requestedPath ? getExperiencePath(requestedPath) : null;

  if (path?.id === "developpeur") {
    return { view: "developerPath", selectedPathId: path.id };
  }

  if (path?.id === "sites-web-commerces") {
    return { view: "commercePath", selectedPathId: path.id };
  }

  if (path) return { view: "placeholder", selectedPathId: path.id };

  return { view: "pathSelection", selectedPathId: null };
};

const DeveloperExperience = React.lazy(() =>
  import("../developer/DeveloperExperience").then((module) => ({
    default: module.DeveloperExperience,
  }))
);

const CommerceExperience = React.lazy(() =>
  import("../commerce/CommerceExperience").then((module) => ({
    default: module.CommerceExperience,
  }))
);

export const ExperienceShell: React.FC = () => {
  const [initialExperience] = useState(getInitialExperience);
  const { isIntroVisible, completeIntro } = useIntroState();
  const [showIntro, setShowIntro] = useState(isIntroVisible);
  const [view, setView] = useState<ExperienceView>(initialExperience.view);
  const [selectedPathId, setSelectedPathId] = useState<PathId | null>(
    initialExperience.selectedPathId
  );

  useLayoutEffect(() => {
    resetDocumentScroll();
  }, [view]);

  const updatePathQuery = useCallback((pathId: PathId | null) => {
    const url = new URL(window.location.href);
    if (pathId) url.searchParams.set("path", pathId);
    else url.searchParams.delete("path");
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }, []);

  useEffect(() => {
    const requestedPath = new URLSearchParams(window.location.search).get(
      "path"
    );
    if (requestedPath === "e-commerce" && initialExperience.selectedPathId) {
      updatePathQuery(initialExperience.selectedPathId);
    }
  }, [initialExperience.selectedPathId, updatePathQuery]);

  const showPathSelection = useCallback(() => {
    setSelectedPathId(null);
    setView("pathSelection");
    updatePathQuery(null);
  }, [updatePathQuery]);

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
      updatePathQuery("developpeur");
      return;
    }

    if (path.id === "sites-web-commerces") {
      setSelectedPathId("sites-web-commerces");
      setView("commercePath");
      updatePathQuery("sites-web-commerces");
      return;
    }

    setSelectedPathId(path.id);
    setView("placeholder");
    updatePathQuery(path.id);
  }, [updatePathQuery]);

  const selectedPath = selectedPathId ? getExperiencePath(selectedPathId) : null;

  return (
    <main className="experience-shell">
      {view === "pathSelection" && <PathSelector onSelectPath={handleSelectPath} />}

      {view === "developerPath" && (
        <Suspense fallback={null}>
          <DeveloperExperience
            onBackToPaths={showPathSelection}
            onReplayIntro={replayIntro}
          />
        </Suspense>
      )}

      {view === "commercePath" && (
        <Suspense fallback={null}>
          <CommerceExperience
            onBackToPaths={showPathSelection}
            onReplayIntro={replayIntro}
          />
        </Suspense>
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
