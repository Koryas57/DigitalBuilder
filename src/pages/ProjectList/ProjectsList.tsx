import React from "react";
import { useNavigate } from "react-router-dom";
import { Footer } from "../../components/Footer/Footer";
import { ProjectCard } from "../../components/ProjectCard/ProjectCard";
import { ExperienceNav } from "../../components/experience/ExperienceNav";
import { projects } from "../../data/projects";
import "../../assets/style/main.scss";

export const ProjectsList: React.FC = () => {
  const navigate = useNavigate();

  return (
    <main className="site-shell">
      <ExperienceNav
        currentLabel="Parcours Projets"
        onBackToPaths={() => navigate("/")}
        onReplayIntro={() => navigate("/?intro=1")}
      />
      <section className="section-frame projects-page">
        <div className="section-heading">
          <p className="eyebrow">Portfolio</p>
          <h1>Projets sélectionnés.</h1>
          <p>
            Une sélection de produits numériques, de sites et d’expériences
            interactives, présentés à travers des résultats concrets.
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
