import PortfolioImage from "../assets/images/YassShanghai.webp";
import TravelTactik from "../assets/images/TravelTactik.svg";
import Kasa from "../assets/images/Kasa.webp";
import Qwenta from "../assets/images/Qwenta.webp";

export interface Project {
  id: string;
  projectName: string;
  category: string;
  summary: string;
  role: string;
  stack: string[];
  demonstratedSkills: string[];
  status: "En ligne" | "En construction" | "Concept";
  imageSrc?: string;
  link?: string;
  repositoryUrl?: string;
  caseStudyUrl?: string;
  featured?: boolean;
  accent: "kynam" | "gold" | "violet" | "night" | "blue";
}

export const projects: Project[] = [
  {
    id: "nagara",
    projectName: "Nagara",
    category: "Jeu vidéo / expérience interactive",
    summary: "Un monde jouable. Une direction artistique. Une logique d'expérience.",
    role: "Game design · prototype · narration",
    stack: ["Unreal Engine", "C++", "UI"],
    demonstratedSkills: ["Imaginaire", "Système", "Immersion"],
    status: "En construction",
    featured: true,
    accent: "violet",
  },
  {
    id: "travel-tactik",
    projectName: "Travel Tactik",
    category: "Voyage / SEO / produit web",
    summary: "Planifier mieux. Structurer le contenu. Transformer l'envie de voyage en parcours utile.",
    role: "Produit · front-end · SEO",
    stack: ["Next.js", "React", "SEO"],
    demonstratedSkills: ["Architecture", "Performance", "Contenu"],
    status: "En construction",
    imageSrc: TravelTactik,
    repositoryUrl: "https://github.com/Koryas57/TravelTactik",
    featured: true,
    accent: "kynam",
  },
  {
    id: "site-web-pas-cher",
    projectName: "Site Web Pas Cher",
    category: "Service de création de sites",
    summary: "Une offre simple: des sites nets, rapides, crédibles, sans complexité inutile.",
    role: "Offre · landing · conversion",
    stack: ["React", "TypeScript", "SCSS"],
    demonstratedSkills: ["Marketing", "Clarté", "Vente"],
    status: "Concept",
    featured: true,
    accent: "gold",
  },
  {
    id: "portfolio-personnel",
    projectName: "Portfolio personnel",
    category: "Vitrine interactive",
    summary: "Un objet de marque personnel: court, sombre, précis, mémorable.",
    role: "DA · UX · développement",
    stack: ["React", "TypeScript", "Vite"],
    demonstratedSkills: ["Branding", "Interface", "Storytelling"],
    status: "En ligne",
    imageSrc: PortfolioImage,
    featured: true,
    accent: "night",
  },
  {
    id: "applications-web",
    projectName: "Applications web",
    category: "Interfaces et outils métier",
    summary: "Des interfaces qui manipulent des données et rendent un workflow plus lisible.",
    role: "Front-end · API · état applicatif",
    stack: ["React", "TypeScript", "Redux"],
    demonstratedSkills: ["Données", "Architecture", "Fiabilité"],
    status: "Concept",
    imageSrc: Kasa,
    featured: true,
    accent: "blue",
  },
  {
    id: "outils-automatisations",
    projectName: "Outils & automatisations",
    category: "Scripts, API, workflows",
    summary: "Faire disparaître les tâches répétitives. Garder l'humain sur la décision.",
    role: "Analyse · scripts · outils internes",
    stack: ["Node.js", "API", "Notion"],
    demonstratedSkills: ["Process", "Automatisation", "Gain de temps"],
    status: "Concept",
    imageSrc: Qwenta,
    featured: true,
    accent: "gold",
  },
  {
    id: "scarlet-avenue",
    projectName: "Scarlet Avenue",
    category: "E-commerce / sourcing international",
    summary: "Un laboratoire business: produit, marge, marché, sourcing, exécution.",
    role: "Fondateur · sourcing · stratégie",
    stack: ["E-commerce", "Sourcing", "Marketplaces"],
    demonstratedSkills: ["Business", "Négociation", "Marché"],
    status: "En construction",
    featured: true,
    accent: "violet",
  },
];

export const featuredProjects = projects.filter((project) => project.featured);
