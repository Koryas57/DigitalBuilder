import React from "react";
import { FiArrowRight, FiStar } from "react-icons/fi";
import { developerQuickModeData } from "../../../data/developerQuickModeData";
import { QuickModeCard } from "./QuickModeCard";

interface QuickModeFeaturedProjectsProps {
  onProjectsClick: () => void;
}

export const QuickModeFeaturedProjects: React.FC<QuickModeFeaturedProjectsProps> = ({ onProjectsClick }) => (
  <QuickModeCard className="quick-card--projects" title="Projets phares" icon={<FiStar />}>
    <div className="quick-projects">
      {developerQuickModeData.featuredProjects.map((project) => (
        <article key={project.id}>
          {project.imageSrc ? <img src={project.imageSrc} alt="" loading="lazy" /> : <span aria-hidden="true" />}
          <div>
            <strong>{project.name}</strong>
            <p>{project.summary}</p>
          </div>
        </article>
      ))}
    </div>
    <button type="button" className="quick-projects__link" onClick={onProjectsClick}>
      Découvrir tous les projets
      <FiArrowRight aria-hidden="true" />
    </button>
  </QuickModeCard>
);
