import React from "react";
import { FiBox, FiCode, FiStar } from "react-icons/fi";
import { developerQuickModeData } from "../../../data/developerQuickModeData";
import { QuickModeBenefitsBar } from "./QuickModeBenefitsBar";
import { QuickModeCapabilitiesCard } from "./QuickModeCapabilitiesCard";
import { QuickModeCard } from "./QuickModeCard";
import { QuickModeExpertiseCard } from "./QuickModeExpertiseCard";
import { QuickModeFeaturedProjects } from "./QuickModeFeaturedProjects";
import { QuickModeHeader } from "./QuickModeHeader";
import { QuickModeHero } from "./QuickModeHero";
import { QuickModeImpactCard } from "./QuickModeImpactCard";
import { QuickModeMetricCard } from "./QuickModeMetricCard";
import { QuickModeMobileNav } from "./QuickModeMobileNav";
import { QuickModeStackCard } from "./QuickModeStackCard";
import { QuickModeTechTags } from "./QuickModeTechTags";
import "./DeveloperQuickMode.scss";

interface DeveloperQuickModeProps {
  onImmersiveMode: () => void;
  onBackToPaths: () => void;
  onReplayIntro: () => void;
}

export const DeveloperQuickMode: React.FC<DeveloperQuickModeProps> = ({
  onImmersiveMode,
  onBackToPaths,
  onReplayIntro,
}) => {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="quick-dev" id="quick-top">
      <div className="quick-dev__aurora" aria-hidden="true" />
      <QuickModeHeader
        onBackToPaths={onBackToPaths}
        onReplayIntro={onReplayIntro}
        onImmersiveMode={onImmersiveMode}
      />
      <main className="quick-dev__content">
        <QuickModeHero onImmersiveMode={onImmersiveMode} onProjectsClick={() => scrollTo("quick-projects")} />
        <QuickModeTechTags tags={developerQuickModeData.techTags} />
        <QuickModeMetricCard />
        <section className="quick-grid" aria-label="Expertises développeur">
          <QuickModeExpertiseCard />
          <QuickModeCapabilitiesCard />
          <QuickModeImpactCard />
          <div id="quick-projects">
            <QuickModeFeaturedProjects onProjectsClick={() => scrollTo("quick-projects")} />
          </div>
          <div id="quick-stack">
            <QuickModeStackCard />
          </div>
        </section>
        <section className="quick-mobile-secondary" aria-label="Modules et projets liés">
          <QuickModeCard className="quick-card--modules" title="Modules explorables" icon={<FiBox />}>
            <div className="quick-stack quick-stack--modules">
              {developerQuickModeData.modules.map((module) => (
                <span key={module}>{module}</span>
              ))}
            </div>
          </QuickModeCard>
          <QuickModeCard className="quick-card--linked" title="Projets liés" icon={<FiStar />}>
            <div className="quick-stack quick-stack--linked">
              {developerQuickModeData.linkedProjects.map((project) => (
                <span key={project}>{project}</span>
              ))}
            </div>
            <button type="button" className="quick-projects__link" onClick={() => scrollTo("quick-projects")}>
              Découvrir tous les projets
            </button>
          </QuickModeCard>
        </section>
        <QuickModeBenefitsBar />
      </main>
      <QuickModeMobileNav
        onImmersiveMode={onImmersiveMode}
        onProjectsClick={() => scrollTo("quick-projects")}
        onStackClick={() => scrollTo("quick-stack")}
      />
      <span className="quick-dev__code-mark" aria-hidden="true">
        <FiCode />
      </span>
    </div>
  );
};
