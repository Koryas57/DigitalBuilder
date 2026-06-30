import React, { useCallback, useEffect, useState } from "react";
import { FiArrowUpRight, FiGithub, FiLinkedin, FiMail, FiMapPin } from "react-icons/fi";
import { CinematicIntro } from "../components/CinematicIntro/CinematicIntro";
import { Footer } from "../components/Footer/Footer";
import { Navigation } from "../components/Navigation/Navigation";
import { PathSelector } from "../components/PathSelector/PathSelector";
import { ProjectCard } from "../components/ProjectCard/ProjectCard";
import { curiosityTeasers } from "../data/curiosity";
import { featuredProjects } from "../data/projects";
import { contactLinks } from "../data/profile";
import { capabilityGroups, heroBadges, hybridPillars, processSteps } from "../data/skills";
import { timeline } from "../data/timeline";
import { useIntroState } from "../hooks/useIntroState";
import "../assets/style/main.scss";

const heroWords = ["Sites.", "Applications.", "Jeux.", "Outils.", "Marques.", "Expériences."];

export const Home: React.FC = () => {
  const { isIntroVisible, completeIntro } = useIntroState();
  const [isPathSelectorVisible, setIsPathSelectorVisible] = useState(false);
  const [hasEnteredSite, setHasEnteredSite] = useState(false);

  useEffect(() => {
    if (!isIntroVisible && !hasEnteredSite) {
      setIsPathSelectorVisible(true);
    }
  }, [hasEnteredSite, isIntroVisible]);

  const preparePathSelector = useCallback(() => {
    setIsPathSelectorVisible(true);
  }, []);

  const handleIntroComplete = useCallback(() => {
    completeIntro();
  }, [completeIntro]);

  const enterSite = () => {
    setHasEnteredSite(true);
    setIsPathSelectorVisible(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="site-shell">
      {isIntroVisible && (
        <CinematicIntro onComplete={handleIntroComplete} onPrepareExit={preparePathSelector} />
      )}
      {isPathSelectorVisible && <PathSelector onSelectPath={enterSite} />}
      {hasEnteredSite && (
        <>
          <Navigation />

          <section className="hero-cinema section-frame" id="top">
            <div className="hero-cinema__ambient" aria-hidden="true" />
            <div className="hero-cinema__content">
              <p className="signature">Yacine Nezreg</p>
              <h1>Je construis des choses.</h1>
              <div className="hero-cinema__words" aria-label="Types de projets">
                {heroWords.map((word) => (
                  <span key={word}>{word}</span>
                ))}
              </div>
              <p className="hero-cinema__line">
                Je résous des problèmes avec du code, du design et une logique produit.
              </p>
              <div className="hero-cinema__actions">
                <a className="button button--primary" href="#projects">
                  Explorer mes projets
                  <FiArrowUpRight aria-hidden="true" />
                </a>
                <a className="button button--ghost" href="#contact">
                  Me contacter
                </a>
              </div>
              <div className="badge-row">
                {heroBadges.map((badge) => (
                  <span key={badge}>{badge}</span>
                ))}
              </div>
            </div>
            <div className="hero-cinema__object" aria-hidden="true">
              <span>Produit</span>
              <strong>Bâtir</strong>
              <i />
            </div>
          </section>

          <section className="section-frame proof-section" id="projects">
            <div className="section-heading section-heading--split">
              <div>
                <p className="eyebrow">Ce que j'ai construit</p>
                <h2>Chaque projet est une preuve.</h2>
              </div>
              <p>Une idée cadrée. Une interface pensée. Une solution construite.</p>
            </div>
            <div className="projects-grid projects-grid--posters">
              {featuredProjects.map((project, index) => (
                <ProjectCard project={project} key={project.id} priority={index === 0} />
              ))}
            </div>
          </section>

          <section className="section-frame thinking-section" id="thinking">
            <div className="section-heading">
              <p className="eyebrow">Comment je pense</p>
              <h2>Comprendre avant de produire.</h2>
            </div>
            <div className="process-strip">
              {processSteps.map((step, index) => (
                <article key={step.title}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="section-frame split-impact" id="profile">
            <div>
              <p className="eyebrow">Profil hybride</p>
              <h2>Relier technique, produit et business.</h2>
              <p>
                Comprendre un besoin. Construire l'interface. Automatiser le process. Mesurer ce qui compte.
              </p>
            </div>
            <div className="impact-tags">
              {hybridPillars.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </section>

          <section className="section-frame capability-section" id="skills">
            <div className="section-heading">
              <p className="eyebrow">Stack & capacités</p>
              <h2>Des outils au service d'un résultat.</h2>
            </div>
            <div className="capability-grid">
              {capabilityGroups.map((group) => (
                <article key={group.title}>
                  <h3>{group.title}</h3>
                  <p>{group.items.join(" · ")}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="section-frame curiosity-lab">
            <div>
              <p className="eyebrow">Curiosity Lab</p>
              <h2>Ce que j'apprends hors du code nourrit ma manière de construire.</h2>
            </div>
            <div>
              {curiosityTeasers.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </section>

          <section className="section-frame narrative-section" id="journey">
            <div className="section-heading">
              <p className="eyebrow">Parcours</p>
              <h2>Une trajectoire, pas une excuse.</h2>
            </div>
            <div className="narrative-grid">
              {timeline.map((item) => (
                <article key={item.title}>
                  <span>{item.period}</span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="section-frame final-contact" id="contact">
            <p className="eyebrow">Contact</p>
            <h2>Discutons d'un projet, d'un poste ou d'une idée ambitieuse.</h2>
            <p>
              Basé entre Sausset-les-Pins, Marseille et le remote. Disponible pour construire vite, bien, et réfléchir au-delà du simple code.
            </p>
            <div className="final-contact__links">
              <a href={contactLinks.email}>
                <FiMail aria-hidden="true" />
                Email
              </a>
              <a href={contactLinks.linkedin} target="_blank" rel="noopener noreferrer">
                <FiLinkedin aria-hidden="true" />
                LinkedIn
              </a>
              <a href={contactLinks.github} target="_blank" rel="noopener noreferrer">
                <FiGithub aria-hidden="true" />
                GitHub
              </a>
              <span>
                <FiMapPin aria-hidden="true" />
                {contactLinks.location}
              </span>
            </div>
          </section>

          <Footer />
        </>
      )}
    </main>
  );
};
