import React from "react";
import { FiArrowRight, FiArrowUpRight, FiMonitor } from "react-icons/fi";
import { contactLinks } from "../../data/profile";
import { webCommerceProjects, type Project } from "../../data/projects";
import { ExperienceNav } from "../experience/ExperienceNav";
import "./CommerceExperience.scss";

interface CommerceExperienceProps {
  onBackToPaths: () => void;
  onReplayIntro: () => void;
}

type ProjectPresentation = {
  category: string;
  headline: string;
  previewLabel: string;
  previewLine: string;
  description: string;
  tags: string[];
  variant: "featured" | "editorial" | "panoramic";
  useEditorialFallback?: boolean;
};

const projectPresentations: Record<string, ProjectPresentation> = {
  "travel-tactik": {
    category: "Services",
    headline: "Le monde vous attend.",
    previewLabel: "Voyage sur mesure",
    previewLine: "Organisation de voyages pensée dans les moindres détails.",
    description:
      "Direction artistique et développement d’un service de voyage sur mesure, construit autour d’une offre claire.",
    tags: ["Direction artistique", "UX/UI", "Next.js", "Business"],
    variant: "featured",
    useEditorialFallback: true,
  },
  "le-quai": {
    category: "Restaurants",
    headline: "Une table. Une atmosphère. Une identité.",
    previewLabel: "Restaurant · bord de mer",
    previewLine: "Une expérience gastronomique à l’identité singulière.",
    description:
      "Une identité gastronomique éditoriale pensée pour faire ressentir le lieu avant même la réservation.",
    tags: ["Direction artistique", "UI/UX", "Mobile-first", "Restaurant"],
    variant: "editorial",
  },
  "cbd-relax": {
    category: "Boutiques",
    headline: "La culture du bon.",
    previewLabel: "Retail · univers de marque",
    previewLine: "Catalogue, boutiques et conseils réunis dans une même expérience.",
    description:
      "Une vitrine retail contemporaine qui relie catalogue, univers de marque et boutiques.",
    tags: ["UI/UX", "Catalogue", "Retail", "Front-end"],
    variant: "panoramic",
  },
};

const useMediaPreference = (query: string) => {
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const updatePreference = () => setMatches(mediaQuery.matches);
    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);
    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, [query]);

  return matches;
};

interface ProjectMediaProps {
  active: boolean;
  shouldLoad: boolean;
  project: Project;
  presentation: ProjectPresentation;
  reducedMotion: boolean;
}

const TravelTactikFallback: React.FC = () => (
  <div className="commerce-travel-poster" aria-hidden="true">
    <div className="commerce-travel-poster__topline">
      <span>TRAVELTACTIK</span>
      <span>VOYAGE SUR MESURE</span>
    </div>
    <div className="commerce-travel-poster__offer">
      <span>Votre voyage</span>
      <strong>Sur mesure</strong>
      <small>pensé dans les moindres détails</small>
    </div>
    <div className="commerce-travel-poster__destinations">
      <span>Rome</span>
      <span>Barcelone</span>
      <span>New York</span>
      <span>Carnets personnalisés</span>
    </div>
  </div>
);

const ProjectMedia: React.FC<ProjectMediaProps> = ({
  active,
  shouldLoad,
  project,
  presentation,
  reducedMotion,
}) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [videoFailed, setVideoFailed] = React.useState(false);
  const canUseVideo = shouldLoad && !reducedMotion && !videoFailed && Boolean(project.videoSrc);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!active) {
      video.pause();
      return;
    }

    void video.play().catch(() => {
      // Autoplay can still be blocked by an individual browser policy.
    });
  }, [active, canUseVideo]);

  return (
    <div className="commerce-project__media-inner">
      {canUseVideo && (
        <video
          ref={videoRef}
          className="commerce-project__video"
          muted
          loop
          playsInline
          autoPlay
          preload="metadata"
          poster={presentation.useEditorialFallback ? undefined : project.imageSrc}
          aria-hidden="true"
          onCanPlay={() => {
            if (active) void videoRef.current?.play();
          }}
          onError={() => setVideoFailed(true)}
        >
          <source src={project.videoSrc} type="video/mp4" />
        </video>
      )}

      {presentation.useEditorialFallback ? (
        <TravelTactikFallback />
      ) : (
        project.imageSrc && (
          <img
            className="commerce-project__poster"
            src={project.imageSrc}
            alt=""
            loading={project.webOrder === 1 ? "eager" : "lazy"}
          />
        )
      )}
    </div>
  );
};

interface ProjectSequenceProps {
  project: Project;
  reducedMotion: boolean;
}

const ProjectSequence: React.FC<ProjectSequenceProps> = ({
  project,
  reducedMotion,
}) => {
  const sectionRef = React.useRef<HTMLElement>(null);
  const initialHash = typeof window !== "undefined" ? window.location.hash : "";
  const isInitialHashTarget =
    initialHash === `#project-${project.id}` ||
    initialHash === `#commerce-project-${project.id}`;
  const [active, setActive] = React.useState(isInitialHashTarget);
  const [revealed, setRevealed] = React.useState(reducedMotion || isInitialHashTarget);
  const [shouldLoad, setShouldLoad] = React.useState(isInitialHashTarget);
  const presentation = projectPresentations[project.id];

  React.useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          setRevealed(true);
        }
        setActive(entry.isIntersecting && entry.intersectionRatio >= 0.42);
      },
      { root: null, rootMargin: "280px 0px", threshold: [0, 0.42, 0.7] }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  if (!presentation) return null;

  return (
    <article
      ref={sectionRef}
      id={`project-${project.id}`}
      className={`commerce-project commerce-project--${presentation.variant}${
        revealed ? " is-revealed" : ""
      }`}
      aria-labelledby={`commerce-project-${project.id}`}
    >
      <div className="commerce-project__category" aria-label={`Catégorie ${presentation.category}`}>
        <span aria-hidden="true" />
        <strong>{presentation.category}</strong>
        <span aria-hidden="true" />
      </div>

      {project.link && (
        <div className="commerce-project__media">
          <ProjectMedia
            active={active}
            shouldLoad={shouldLoad}
            project={project}
            presentation={presentation}
            reducedMotion={reducedMotion}
          />
          <span className="commerce-project__shade" aria-hidden="true" />
          <div className="commerce-project__editorial">
            <span>{presentation.previewLabel}</span>
            <strong>{presentation.headline}</strong>
            <small>{presentation.previewLine}</small>
          </div>
          <aside className="commerce-project__info">
            <span className="commerce-project__status">{project.status}</span>
            <h2 id={`commerce-project-${project.id}`}>{project.projectName}</h2>
            <p className="commerce-project__subtitle">{project.subtitle}.</p>
            <p className="commerce-project__description">{presentation.description}</p>
            <div className="commerce-project__tags" aria-label="Compétences mobilisées">
              {presentation.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
            <a
              className="commerce-project__text-link"
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              Voir le site
              <FiArrowUpRight aria-hidden="true" />
            </a>
          </aside>
        </div>
      )}
    </article>
  );
};

export const CommerceExperience: React.FC<CommerceExperienceProps> = ({
  onBackToPaths,
  onReplayIntro,
}) => {
  const reducedMotion = useMediaPreference("(prefers-reduced-motion: reduce)");

  React.useEffect(() => {
    if (!window.location.hash) return;

    const frame = window.requestAnimationFrame(() => {
      document.querySelector(window.location.hash)?.scrollIntoView({ block: "start" });
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <section className="commerce-experience">
      <div className="commerce-experience__ambient" aria-hidden="true" />
      <ExperienceNav
        currentLabel="Parcours Site Web"
        variant="editorial"
        onBackToPaths={onBackToPaths}
        onReplayIntro={onReplayIntro}
      />

      <main className="commerce-experience__content">
        <header className="commerce-experience__hero">
          <span className="commerce-experience__eyebrow">
            <FiMonitor aria-hidden="true" />
            Sélection web
          </span>
          <h1>Sites Web</h1>
          <p>
            <strong>Identité, expérience et développement.</strong>
            Une sélection de projets parmi les interfaces et expériences web que j’ai conçues.
          </p>
          <a className="commerce-experience__scroll-cue" href="#web-projects">
            Découvrir la sélection
            <FiArrowRight aria-hidden="true" />
          </a>
        </header>

        <div id="web-projects" className="commerce-showcase" role="list">
          {webCommerceProjects.map((project) => (
            <div role="listitem" key={project.id}>
              <ProjectSequence
                project={project}
                reducedMotion={reducedMotion}
              />
            </div>
          ))}
        </div>

        <footer className="commerce-contact">
          <span>Un projet en tête ?</span>
          <h2>Construisons quelque chose qui mérite d’être vu.</h2>
          <a href={contactLinks.email}>
            Me contacter
            <FiArrowRight aria-hidden="true" />
          </a>
        </footer>
      </main>
    </section>
  );
};
