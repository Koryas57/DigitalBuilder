import React from "react";
import { FiArrowRight, FiArrowUpRight, FiStar } from "react-icons/fi";
import { developerQuickModeData } from "../../../data/developerQuickModeData";
import type { Project } from "../../../data/projects";
import { ProjectDetailDialog } from "../../projects/ProjectDetailDialog";
import { QuickModeCard } from "./QuickModeCard";

const QuickProjectThumbnail: React.FC<{ project: Project }> = ({ project }) => {
  const [videoFailed, setVideoFailed] = React.useState(false);

  if (project.videoSrc && !videoFailed) {
    return (
      <video
        src={project.videoSrc}
        poster={project.imageSrc}
        muted
        loop
        playsInline
        autoPlay
        preload="metadata"
        aria-hidden="true"
        onError={() => setVideoFailed(true)}
      />
    );
  }

  if (project.showImageVisual && project.imageSrc) {
    return (
      <img
        src={project.imageSrc}
        alt={`Aperçu de ${project.projectName}`}
        loading="lazy"
      />
    );
  }

  return <span className="quick-projects__visual-pending">Visuel à venir</span>;
};

export const QuickModeFeaturedProjects: React.FC = () => {
  const [selectedProject, setSelectedProject] = React.useState<Project | null>(
    null
  );

  return (
    <>
      <QuickModeCard
        className="quick-card--projects"
        title="Projets web récents"
        icon={<FiStar />}
      >
        <div className="quick-projects">
          {developerQuickModeData.featuredProjects.map((project) => (
            <article key={project.id}>
              <QuickProjectThumbnail project={project} />
              <div className="quick-projects__copy">
                <span>{project.status}</span>
                <strong>{project.projectName}</strong>
                <p>{project.subtitle}</p>
                <div className="quick-projects__actions">
                  <button
                    type="button"
                    onClick={() => setSelectedProject(project)}
                  >
                    Découvrir
                    <FiArrowRight aria-hidden="true" />
                  </button>
                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Voir le site ${project.projectName}`}
                    >
                      Site
                      <FiArrowUpRight aria-hidden="true" />
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
        <a className="quick-projects__link" href="/projects">
          Tous les projets
          <FiArrowRight aria-hidden="true" />
        </a>
      </QuickModeCard>

      <ProjectDetailDialog
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </>
  );
};
