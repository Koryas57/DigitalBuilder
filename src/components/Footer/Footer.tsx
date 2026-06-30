import React from "react";
import { FiGithub, FiLinkedin, FiMail } from "react-icons/fi";
import { contactLinks } from "../../data/profile";
import "./Footer.scss";

export const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div>
        <p>Yacine Nezreg</p>
        <span>Chef de projet digital & développeur web orienté produit.</span>
      </div>
      <nav aria-label="Liens sociaux">
        <a href={contactLinks.email}>
          <FiMail aria-hidden="true" />
          Email
        </a>
        <a href={contactLinks.github} target="_blank" rel="noopener noreferrer">
          <FiGithub aria-hidden="true" />
          GitHub
        </a>
        <a href={contactLinks.linkedin} target="_blank" rel="noopener noreferrer">
          <FiLinkedin aria-hidden="true" />
          LinkedIn
        </a>
      </nav>
    </footer>
  );
};
