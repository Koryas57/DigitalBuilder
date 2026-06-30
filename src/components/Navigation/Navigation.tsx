import React from "react";
import { Link } from "react-router-dom";
import "./Navigation.scss";

export const Navigation: React.FC = () => {
  return (
    <header className="navigation">
      <Link className="navigation__brand" to="/">
        <span>YN</span>
        <div>
          <strong>Yacine Nezreg</strong>
          <small>Produit · web · business</small>
        </div>
      </Link>

      <nav className="navigation__links" aria-label="Navigation principale">
        <a href="/#projects">Projets</a>
        <a href="/#profile">Profil</a>
        <Link to="/skills">Compétences</Link>
        <a className="navigation__cta" href="/#contact">
          Contact
        </a>
      </nav>
    </header>
  );
};
