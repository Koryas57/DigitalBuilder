import React, { Suspense, useState } from "react";
import { DeveloperModeSelector } from "./DeveloperModeSelector";
import { DeveloperQuickView } from "./DeveloperQuickView";
import "./DeveloperExperience.scss";

type DeveloperMode = "selector" | "immersive" | "quick";

interface DeveloperExperienceProps {
  onBackToPaths: () => void;
  onReplayIntro: () => void;
}

const DeveloperImmersiveExperience = React.lazy(() =>
  import("./DeveloperImmersiveExperience").then((module) => ({
    default: module.DeveloperImmersiveExperience,
  }))
);

export const DeveloperExperience: React.FC<DeveloperExperienceProps> = ({
  onBackToPaths,
  onReplayIntro,
}) => {
  const [mode, setMode] = useState<DeveloperMode>("selector");

  return (
    <section className={`developer-experience developer-experience--${mode}`}>
      <div className="experience-ambient" aria-hidden="true" />

      {mode === "selector" && (
        <DeveloperModeSelector
          onBackToPaths={onBackToPaths}
          onChooseImmersive={() => setMode("immersive")}
          onChooseQuick={() => setMode("quick")}
        />
      )}

      {mode === "immersive" && (
        <Suspense fallback={null}>
          <DeveloperImmersiveExperience
            onQuickMode={() => setMode("quick")}
            onBackToSelector={() => setMode("selector")}
          />
        </Suspense>
      )}

      {mode === "quick" && (
        <DeveloperQuickView
          onImmersiveMode={() => setMode("immersive")}
          onBackToPaths={onBackToPaths}
          onReplayIntro={onReplayIntro}
        />
      )}
    </section>
  );
};
