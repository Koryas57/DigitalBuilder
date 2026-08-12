import React from "react";
import {
  FiArrowRight,
  FiArrowUpRight,
  FiMonitor,
} from "react-icons/fi";
import { webCommerceProjects, type Project } from "../../data/projects";
import { ExperienceNav } from "../experience/ExperienceNav";
import { ProjectDetailDialog } from "../projects/ProjectDetailDialog";
import "./CommerceExperience.scss";

interface CommerceExperienceProps {
  onBackToPaths: () => void;
  onReplayIntro: () => void;
}

export const CommerceExperience: React.FC<CommerceExperienceProps> = ({
  onBackToPaths,
  onReplayIntro,
}) => {
  const [selectedProject, setSelectedProject] = React.useState<Project | null>(
    null
  );

  return (
    <section className="commerce-experience">
      <div className="commerce-experience__ambient" aria-hidden="true" />
      <ExperienceNav
        currentLabel="Sites Web"
        onBackToPaths={onBackToPaths}
        onReplayIntro={onReplayIntro}
      />

      <main className="commerce-experience__content">
        <header className="commerce-experience__header">
          <div>
            <span className="commerce-experience__eyebrow">
              <FiMonitor aria-hidden="true" />
              Sélection web
            </span>
            <h1>Sites Web</h1>
          </div>
          <p>
            Une sélection de sites conçus pour associer identité, clarté et
            efficacité, du concept au produit réellement exploité.
          </p>
        </header>

        <div
          className="commerce-showcase"
          role="list"
          aria-label="Projets de sites web"
        >
          {webCommerceProjects.map((project) => (
            <article
              className={`commerce-project commerce-project--${project.accent}`}
              role="listitem"
              key={project.id}
            >
              <button
                className="commerce-project__surface"
                type="button"
                onClick={() => setSelectedProject(project)}
                aria-label={`Découvrir le projet ${project.projectName}`}
              >
                {project.imageSrc && (
                  <img
                    src={project.imageSrc}
                    alt=""
                    loading={project.webOrder === 1 ? "eager" : "lazy"}
                  />
                )}
              </button>

              <div className="commerce-project__meta">
                <span className="commerce-project__status">
                  {project.status}
                </span>
                <div className="commerce-project__title-row">
                  <div>
                    <h2>{project.projectName}</h2>
                    <p>{project.subtitle}</p>
                  </div>
                  <button
                    className="commerce-project__discover"
                    type="button"
                    onClick={() => setSelectedProject(project)}
                    aria-label={`Découvrir le projet ${project.projectName}`}
                  >
                    <FiArrowRight aria-hidden="true" />
                  </button>
                </div>
                <div className="commerce-project__footer">
                  <div className="commerce-project__tags" aria-label="Tags">
                    {project.demonstratedSkills.slice(0, 2).map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Voir le site
                      <FiArrowUpRight aria-hidden="true" />
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

      </main>

      <ProjectDetailDialog
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </section>
  );
};
