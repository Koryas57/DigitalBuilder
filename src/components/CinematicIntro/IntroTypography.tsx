import React from "react";

const introWords = ["Sites.", "Applications.", "Jeux.", "Outils.", "Marques.", "Expériences."];
const orbitSparks = Array.from({ length: 14 }, (_, index) => index + 1);

export const IntroTypography: React.FC = () => {
  return (
    <div className="intro-sequence" aria-live="polite">
      <section className="intro-scene intro-scene--loading" aria-label="Chargement de l'expérience">
        <p>Chargement<br />de l'expérience</p>
        <div className="intro-progress"><i /></div>
      </section>

      <section className="intro-scene intro-scene--identity" aria-label="Yacine Nezreg">
        <h2>Yacine<br />Nezreg</h2>
        <small>Bâtisseur digital</small>
      </section>

      <section className="intro-scene intro-scene--statement" aria-label="Je construis des choses">
        <h2>Je construis<br /><em>des choses.</em></h2>
        <p>Sites. Applications. Jeux. Outils. Marques. Expériences.</p>
      </section>

      <section className="intro-scene intro-scene--words" aria-label="Types de projets">
        <div>
          {introWords.map((word) => (
            <span key={word}>{word}</span>
          ))}
        </div>
      </section>

      <section className="intro-scene intro-scene--manifesto" aria-label="Méthode">
        <h2>
          Je résous des problèmes<br />
          avec du <em className="is-kynam">code</em>, du{" "}
          <em className="is-violet">design</em><br />
          et une <em className="is-gold">logique produit</em>.
        </h2>
      </section>

      <section className="intro-scene intro-scene--ready" aria-label="Prêt">
        <div className="intro-orbit">
          <span>Prêt ?</span>
          {orbitSparks.map((spark) => (
            <i
              className="intro-orbit__spark"
              style={{ "--spark-index": spark } as React.CSSProperties}
              key={spark}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
