import React from "react";
import { FiArrowUpRight, FiBookOpen, FiCode } from "react-icons/fi";
import type { Project } from "../../data/projects";
import { ProjectDetailDialog } from "../projects/ProjectDetailDialog";
import "./ProjectCard.scss";

interface ProjectCardProps {
  project: Project;
  priority?: boolean;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, priority = false }) => {
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [videoFailed, setVideoFailed] = React.useState(false);

  return (
    <>
      <article className={`project-card project-card--${project.accent} ${priority ? "project-card--priority" : ""}`}>
        <div className="project-card__poster">
          {project.videoSrc && !videoFailed ? (
            <video
              src={project.videoSrc}
              poster={project.imageSrc}
              muted
              loop
              playsInline
              autoPlay
              preload={priority ? "auto" : "metadata"}
              aria-hidden="true"
              onError={() => setVideoFailed(true)}
            />
          ) : project.showImageVisual && project.imageSrc ? (
            <img
              src={project.imageSrc}
              alt={`Aperçu du projet ${project.projectName}`}
              loading={priority ? "eager" : "lazy"}
            />
          ) : (
            <div className="project-card__visual-pending">
              <span>Visuel à venir</span>
              <i />
            </div>
          )}
          <span className="project-card__status">{project.status}</span>
        </div>

        <div className="project-card__body">
          <p className="project-card__category">{project.category}</p>
          <h3>{project.projectName}</h3>
          <p className="project-card__summary">{project.summary}</p>

          <div className="project-card__proof">
            <span>{project.role}</span>
            <span>{project.demonstratedSkills.slice(0, 2).join(" · ")}</span>
          </div>

          <div className="project-card__stack">
            {project.stack.slice(0, 4).map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>

          <div className="project-card__actions">
            {project.link && (
              <a href={project.link} target="_blank" rel="noopener noreferrer">
                <FiArrowUpRight aria-hidden="true" />
                {project.id === "mode-immersion" ? "Mode immersion" : "Projet"}
              </a>
            )}
            {project.repositoryUrl && (
              <a href={project.repositoryUrl} target="_blank" rel="noopener noreferrer">
                <FiCode aria-hidden="true" />
                Code
              </a>
            )}
            {project.context ? (
              <button type="button" onClick={() => setDetailOpen(true)}>
                <FiBookOpen aria-hidden="true" />
                Découvrir
              </button>
            ) : (
              <a className={!project.caseStudyUrl ? "is-disabled" : ""} href={project.caseStudyUrl ?? undefined}>
                <FiBookOpen aria-hidden="true" />
                Étude
              </a>
            )}
          </div>
        </div>
      </article>
      <ProjectDetailDialog
        project={detailOpen ? project : null}
        onClose={() => setDetailOpen(false)}
      />
    </>
  );
};
