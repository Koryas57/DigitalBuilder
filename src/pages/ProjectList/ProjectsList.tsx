import React from "react";
import { Navigation } from "../../components/Navigation/Navigation";
import { Footer } from "../../components/Footer/Footer";
import { ProjectCard } from "../../components/ProjectCard/ProjectCard";
import { projects } from "../../data/projects";
import "../../assets/style/main.scss";

export const ProjectsList: React.FC = () => {
  return (
    <main className="site-shell">
      <Navigation />
      <section className="section-frame projects-page">
        <div className="section-heading">
          <p className="eyebrow">Tous les projets</p>
          <h1>Projets, produits, expérimentations et preuves de progression.</h1>
          <p>
            Cette page regroupe les projets en ligne, les projets en construction et les placeholders prêts à recevoir leurs études de cas.
          </p>
        </div>
        <div className="projects-grid">
          {projects.map((project) => (
            <ProjectCard project={project} key={project.id} />
          ))}
        </div>
      </section>
      <Footer />
    </main>
  );
};
