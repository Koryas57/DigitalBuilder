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
        <h2>Yacine<br /> Nezreg</h2>
        <br />
        <small>Bâtisseur digital</small>
      </section>

      <section
        className="intro-scene intro-scene--founder"
        aria-label="Fondateur de Bien en ligne et Travel Tactik"
      >
        <div className="intro-founder">
          <p className="intro-founder__eyebrow">Fondateur de</p>
          <div className="intro-founder__brands">
            <a
              className="intro-founder__brand intro-founder__brand--bien-en-ligne"
              href="https://bienenligne.fr/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Découvrir Bien en ligne dans un nouvel onglet"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => event.stopPropagation()}
            >
              <strong>Bien en ligne</strong>
              <span>Sites web pour entreprises</span>
            </a>

            <i className="intro-founder__divider" aria-hidden="true" />

            <a
              className="intro-founder__brand intro-founder__brand--travel-tactik"
              href="https://travel-tactik.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Découvrir Travel Tactik dans un nouvel onglet"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => event.stopPropagation()}
            >
              <strong>Travel Tactik</strong>
              <span>Voyages pensés sur mesure</span>
            </a>
          </div>
        </div>
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
