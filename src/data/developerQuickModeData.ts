import { developerStations } from "./developerPath";
import { developerWebProjects, featuredProjects, projects } from "./projects";

export const developerQuickModeData = {
  hero: {
    eyebrow: "Mode rapide",
    title: ["Bâtisseur", "digital"],
    mobileTitle: ["Bâtisseur", "digital"],
    subtitle:
      "Je conçois des produits numériques complets, des interfaces premium et des expériences interactives. Code, design et stratégie produit réunis pour créer des solutions utiles, performantes et mémorables.",
    heroImage: "/assets/quick-mode/developer-hero-background.png",
  },
  techTags: [
    "React",
    "TypeScript",
    "Three.js",
    "Unity",
    "IA",
    "Node.js",
    "Blender",
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
  featuredProjects: developerWebProjects,
  stack: [
    "React",
    "TypeScript",
    "Next.js",
    "Node.js",
    "Three.js",
    "Unity",
    "Blender",
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
