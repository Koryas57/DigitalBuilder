import { developerStations } from "./developerPath";
import { featuredProjects, projects } from "./projects";

const visibleProjects = featuredProjects.slice(0, 3);

export const developerQuickModeData = {
  hero: {
    eyebrow: "Mode rapide",
    title: ["Ingenieur", "Produit &", "Experiences web"],
    mobileTitle: ["Ingenieur", "Logiciel · Produit ·", "Experiences 3D"],
    subtitle:
      "Je conçois et développe des produits numériques complets, des interfaces premium et des expériences 3D interactives. De l'idée au lancement, j'allie code, design et stratégie produit pour créer des solutions utiles, performantes et mémorables.",
    heroImage: "/assets/quick-mode/developer-hero-background.png",
  },
  techTags: [
    "React",
    "TypeScript",
    "Three.js",
    "IA",
    "Node.js",
    "UX",
    "APIs",
    "3D",
    "Performance",
    "Product Strategy",
  ],
  metrics: [
    {
      value: `${projects.length}`,
      label: "projets référencés",
      detail: "portfolio vivant",
    },
    {
      value: `${developerStations.length}`,
      label: "modules explorables",
      detail: "parcours développeur",
    },
    {
      value: "WebGL",
      label: "expérience temps réel",
      detail: "mode immersif dédié",
    },
    {
      value: "Remote",
      label: "France & international",
      detail: "collaboration flexible",
    },
  ],
  systemDimensions: ["Interface", "API & données", "Performance", "Sécurité", "Analytics"],
  visualTabs: ["Interface", "Dashboard", "Mobile", "3D"],
  expertise: [
    "Développement front & back",
    "Interfaces premium & design systems",
    "Expériences 3D & interactives",
    "Intégrations, APIs & automatisations",
    "Performance, SEO & accessibilité",
    "Stratégie produit & itération",
  ],
  capabilities: [
    "Interfaces web responsives",
    "Expériences 3D immersives",
    "Applications métier & dashboards",
    "Sites marketing & landing pages",
    "Design systems & composants",
    "Outils internes & automatisations",
  ],
  impact: {
    metrics: [
      { value: `${projects.length}`, label: "projets" },
      { value: `${developerStations.length}`, label: "axes d'expertise" },
      { value: "3D", label: "expérience jouable" },
    ],
    statement:
      "Une approche qui relie architecture, expérience utilisateur et impact produit.",
  },
  featuredProjects: visibleProjects.map((project) => ({
    id: project.id,
    name: project.projectName,
    summary: project.summary,
    imageSrc: project.imageSrc,
    accent: project.accent,
  })),
  stack: [
    "React",
    "TypeScript",
    "Next.js",
    "Node.js",
    "Three.js",
    "Sass / SCSS",
    "Redux",
    "API REST",
    "Vite",
    "Vercel",
    "GitHub",
    "SEO",
  ],
  benefits: [
    {
      title: "Disponible en remote",
      text: "France & international",
    },
    {
      title: "Code maintenable",
      text: "Architecture, composants, documentation",
    },
    {
      title: "Performance",
      text: "Core Web Vitals, optimisation 3D",
    },
    {
      title: "Produit",
      text: "UX, accessibilité, logique métier",
    },
  ],
  modules: developerStations.map((station) => station.title),
  linkedProjects: featuredProjects.slice(0, 4).map((project) => project.projectName),
};

export type DeveloperQuickModeData = typeof developerQuickModeData;
