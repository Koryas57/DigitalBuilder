import React from "react";
import { createPortal } from "react-dom";
import {
  FiArrowUpRight,
  FiCheck,
  FiLayers,
  FiTarget,
  FiX,
} from "react-icons/fi";
import type { Project } from "../../data/projects";
import "./ProjectDetailDialog.scss";

interface ProjectDetailDialogProps {
  project: Project | null;
  onClose: () => void;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export const ProjectDetailDialog: React.FC<ProjectDetailDialogProps> = ({
  project,
  onClose,
}) => {
  const titleId = React.useId();
  const panelRef = React.useRef<HTMLDivElement>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);
  const [videoFailed, setVideoFailed] = React.useState(false);

  React.useEffect(() => {
    setVideoFailed(false);
  }, [project?.id]);

  React.useEffect(() => {
    if (!project) return undefined;

    const previousActiveElement = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => closeButtonRef.current?.focus(), 0);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) return;

      const focusableElements = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      if (!firstElement || !lastElement) return;

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previousActiveElement?.focus();
    };
  }, [onClose, project]);

  if (!project) return null;

  return createPortal(
    <div
      className="project-detail"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className={`project-detail__panel project-detail__panel--${project.accent}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        ref={panelRef}
      >
        <button
          className="project-detail__close"
          type="button"
          onClick={onClose}
          aria-label="Fermer la présentation du projet"
          ref={closeButtonRef}
        >
          <FiX aria-hidden="true" />
        </button>

        <div className="project-detail__hero">
          {project.videoSrc && !videoFailed ? (
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
          ) : project.showImageVisual && project.imageSrc ? (
            <img
              src={project.imageSrc}
              alt={`Page d’accueil du projet ${project.projectName}`}
            />
          ) : (
            <div className="project-detail__visual-pending">
              <span>Visuel à venir</span>
            </div>
          )}
        </div>

        <div className="project-detail__content">
          <header className="project-detail__heading">
            <span>{project.status}</span>
            <h2 id={titleId}>{project.projectName}</h2>
            {project.subtitle && <p>{project.subtitle}</p>}
          </header>
          <section className="project-detail__lead" aria-label="Présentation">
            <p>{project.summary}</p>
            {project.context && <p>{project.context}</p>}
          </section>

          <div className="project-detail__story">
            {project.objective && (
              <section>
                <FiTarget aria-hidden="true" />
                <div>
                  <h3>Objectif</h3>
                  <p>{project.objective}</p>
                </div>
              </section>
            )}
            {project.solution && (
              <section>
                <FiLayers aria-hidden="true" />
                <div>
                  <h3>Solution proposée</h3>
                  <p>{project.solution}</p>
                </div>
              </section>
            )}
          </div>

          {project.features && (
            <section className="project-detail__features">
              <h3>Fonctionnalités principales</h3>
              <ul>
                {project.features.map((feature) => (
                  <li key={feature}>
                    <FiCheck aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="project-detail__technologies">
            <h3>Technologies et conception</h3>
            <div>
              {project.stack.map((technology) => (
                <span key={technology}>{technology}</span>
              ))}
            </div>
          </section>

          {project.link && (
            <a
              className="project-detail__site-link"
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              Voir le site en ligne
              <FiArrowUpRight aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
