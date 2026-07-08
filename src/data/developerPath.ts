export interface DeveloperStationData {
  id: string;
  title: string;
  subtitle: string;
  accentColor: string;
  description: string;
  skills: string[];
  proof: string;
  relatedProjects: string[];
  visualType: "orb" | "terminal" | "grid" | "core";
  position: {
    x: number;
    y: number;
  };
  ctaLabel: string;
}

export interface DeveloperStationPlacement {
  id: string;
  title: string;
  position: [number, number, number];
  rotation: [number, number, number];
  radius: number;
  accentColor: string;
}

export const developerStations: DeveloperStationData[] = [
  {
    id: "front-end-systems",
    title: "Front-end Systems",
    subtitle: "Interfaces rapides, lisibles, maintenables.",
    accentColor: "#b7f8ca",
    description:
      "Je construis des interfaces pensees pour l'usage reel: composants solides, responsive propre, et details qui rendent le produit fluide.",
    skills: ["React", "TypeScript", "Next.js", "SCSS / Tailwind", "Design systems", "Animations"],
    proof: "Architecture d'interface, rigueur de composants, sens du rendu final.",
    relatedProjects: ["Travel Tactik", "Site Web Pas Cher", "Portfolio personnel"],
    visualType: "orb",
    position: { x: 50, y: 18 },
    ctaLabel: "Explorer Front-end",
  },
  {
    id: "product-interfaces",
    title: "Product Interfaces",
    subtitle: "Des parcours clairs, pas juste de jolies pages.",
    accentColor: "#e8cf91",
    description:
      "Je relie UX, UI et logique produit pour transformer un besoin flou en experience comprehensible et actionnable.",
    skills: ["UX", "UI", "Parcours utilisateur", "Performance percue", "Accessibilite", "Mobile-first"],
    proof: "Capacite a cadrer, simplifier et concevoir pour l'utilisateur final.",
    relatedProjects: ["Site Web Pas Cher", "Portfolio personnel", "Applications web"],
    visualType: "grid",
    position: { x: 78, y: 34 },
    ctaLabel: "Voir la logique produit",
  },
  {
    id: "data-apis",
    title: "Data & APIs",
    subtitle: "Connecter l'interface a une vraie logique metier.",
    accentColor: "#9eefff",
    description:
      "Je structure les donnees, integre des APIs et construis des flux utiles pour que l'interface serve un systeme coherent.",
    skills: ["API REST", "Integrations", "Node.js", "Bases de donnees", "Automatisation", "Etat applicatif"],
    proof: "Comprendre les flux, fiabiliser les donnees, livrer des outils exploitables.",
    relatedProjects: ["Applications web", "Outils & automatisations", "Travel Tactik"],
    visualType: "terminal",
    position: { x: 80, y: 68 },
    ctaLabel: "Ouvrir les flux",
  },
  {
    id: "performance-seo",
    title: "Performance & SEO",
    subtitle: "Rapide, visible, durable.",
    accentColor: "#b7f8ca",
    description:
      "Je pense structure, chargement, contenu et lisibilite pour creer des experiences qui restent agreables sur mobile.",
    skills: ["Core Web Vitals", "SEO technique", "Lazy loading", "Architecture", "Optimisation mobile", "Structure de contenu"],
    proof: "Un produit web ne doit pas seulement exister: il doit charger vite, se comprendre vite, et tenir dans le temps.",
    relatedProjects: ["Travel Tactik", "Site Web Pas Cher", "Portfolio personnel"],
    visualType: "core",
    position: { x: 50, y: 82 },
    ctaLabel: "Analyser la performance",
  },
  {
    id: "interactive-experiences",
    title: "Interactive Experiences",
    subtitle: "Créer de la memoire par l'interaction.",
    accentColor: "#b992ff",
    description:
      "Je prototype des experiences qui donnent envie d'explorer: micro-interactions, jeux, WebGL et narration interactive.",
    skills: ["Jeux", "Prototypes", "Three.js", "WebGL", "Micro-interactions", "Storytelling"],
    proof: "Capacite a construire une experience, pas seulement assembler des sections.",
    relatedProjects: ["Nagara", "Portfolio personnel", "Experiences immersives"],
    visualType: "orb",
    position: { x: 22, y: 66 },
    ctaLabel: "Entrer dans l'interaction",
  },
  {
    id: "tools-workflow",
    title: "Tools & Workflow",
    subtitle: "Travailler proprement, livrer plus sereinement.",
    accentColor: "#e8cf91",
    description:
      "Je m'appuie sur des outils simples et fiables pour organiser, versionner, debugger et documenter mon travail.",
    skills: ["Git / GitHub", "Vercel", "Figma", "VS Code", "Notion", "Tests / debug"],
    proof: "Autonomie, methode, documentation, iteration rapide.",
    relatedProjects: ["Portfolio personnel", "Outils & automatisations", "Applications web"],
    visualType: "terminal",
    position: { x: 22, y: 34 },
    ctaLabel: "Voir le workflow",
  },
];

export const stationPositions: DeveloperStationPlacement[] = [
  {
    id: "front-end-systems",
    title: "Front-end Systems",
    position: [-2.85, 0.12, 2.35],
    rotation: [0, 0.48, 0],
    radius: 1.15,
    accentColor: "#b7f8ca",
  },
  {
    id: "product-interfaces",
    title: "Product Interfaces",
    position: [2.72, 0.12, -0.95],
    rotation: [0, -0.55, 0],
    radius: 1.15,
    accentColor: "#e8cf91",
  },
  {
    id: "data-apis",
    title: "Data & APIs",
    position: [-2.35, 0.12, -4.75],
    rotation: [0, 1.05, 0],
    radius: 1.1,
    accentColor: "#9eefff",
  },
  {
    id: "performance-seo",
    title: "Performance & SEO",
    position: [2.48, 0.12, -8.45],
    rotation: [0, -1.1, 0],
    radius: 1.1,
    accentColor: "#b7f8ca",
  },
  {
    id: "interactive-experiences",
    title: "Interactive Experiences",
    position: [-0.45, 0.12, -11.7],
    rotation: [0, 0.12, 0],
    radius: 1.2,
    accentColor: "#b992ff",
  },
  {
    id: "tools-workflow",
    title: "Tools & Workflow",
    position: [2.2, 0.12, -14.2],
    rotation: [0, -0.85, 0],
    radius: 1.1,
    accentColor: "#e8cf91",
  },
];

export const developerQuickSummary = {
  title: "Developpeur front-end oriente produit",
  text:
    "Je construis des interfaces React/TypeScript rapides, lisibles et utiles, avec une attention forte au mobile, a la performance et a la logique produit.",
  stack: ["React", "TypeScript", "Next.js", "SCSS", "Node.js", "API REST", "SEO", "Vercel", "GitHub"],
  proofs: [
    "Transformer un besoin en interface claire.",
    "Structurer des composants maintenables.",
    "Relier design, performance et logique business.",
    "Prototyper des experiences interactives memorables.",
  ],
  projects: ["Travel Tactik", "Site Web Pas Cher", "Portfolio personnel", "Applications web"],
};
