import React from "react";
import { Navigation } from "../../components/Navigation/Navigation";
import { Footer } from "../../components/Footer/Footer";
import { capabilityGroups } from "../../data/skills";
import "../../assets/style/main.scss";
import "./Skills.scss";

export const Skills: React.FC = () => {
  return (
    <main className="site-shell">
      <Navigation />
      <section className="section-frame skills-page">
        <div className="section-heading">
          <p className="eyebrow">Compétences</p>
          <h1>Un socle technique, produit et business pensé pour construire.</h1>
          <p>
            Je présente mes compétences par usages concrets: concevoir, développer, automatiser, analyser et communiquer.
          </p>
        </div>
        <div className="skills-matrix">
          {capabilityGroups.map((group) => (
            <article className="skill-group" key={group.title}>
              <h2>{group.title}</h2>
              <div>
                {group.items.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
      <Footer />
    </main>
  );
};
