import Kasa from "../assets/images/Kasa.webp";
import Qwenta from "../assets/images/Qwenta.webp";
import VitrineExpress from "../assets/images/VitrineExpress.png";

export type ProjectCollection =
  | "dev"
  | "sites-web-commerces"
  | "business";

export type ProjectStatus =
  | "En ligne"
  | "En construction"
  | "Concept"
  | "Projet entrepreneurial actif"
  | "Démonstration commerciale"
  | "Prototype commercial";

export interface Project {
  id: string;
  projectName: string;
  subtitle?: string;
  category: string;
  categories: ProjectCollection[];
  summary: string;
  context?: string;
  objective?: string;
  solution?: string;
  features?: string[];
  role: string;
  stack: string[];
  demonstratedSkills: string[];
  status: ProjectStatus;
  imageSrc?: string;
  showImageVisual?: boolean;
  videoSrc?: string;
  link?: string;
  repositoryUrl?: string;
  caseStudyUrl?: string;
  featured?: boolean;
  webOrder?: number;
  accent: "kynam" | "gold" | "violet" | "night" | "blue";
}

export const projects: Project[] = [
  {
    id: "le-quai",
    projectName: "Le Quai",
    subtitle: "Concept digital pour restaurant",
    category: "Site web · restaurant · commerce local",
    categories: ["dev", "sites-web-commerces"],
    summary:
      "Un prototype de site de restaurant à forte identité visuelle, conçu en priorité pour le mobile et pour faciliter la consultation de la carte, les appels, l’itinéraire et la découverte de l’établissement.",
    context:
      "Concept commercial réalisé pour démontrer comment une présence digitale premium peut valoriser un restaurant local. Ce prototype n’est pas une commande ni une validation de l’établissement présenté.",
    objective:
      "Créer une expérience immédiatement évocatrice tout en donnant un accès rapide aux informations et actions essentielles sur mobile.",
    solution:
      "Une vitrine immersive, structurée autour de l’identité du lieu, de sa carte et de boutons d’action directs pour réserver, appeler ou préparer son itinéraire.",
    features: [
      "Direction artistique forte",
      "Présentation immersive",
      "Carte du restaurant",
      "Actions adaptées au mobile",
      "Téléphone et itinéraire",
      "Pages informatives",
      "Responsive design",
    ],
    role: "Conception · direction artistique · développement",
    stack: ["Next.js", "React", "Responsive design"],
    demonstratedSkills: ["Direction artistique", "UI/UX", "Mobile-first", "Restaurant"],
    status: "Prototype commercial",
    imageSrc: "/assets/projects/le-quai-cover.webp",
    videoSrc: "/videos/projects/lequai.mp4",
    link: "https://demo-resto-sigma.vercel.app/",
    featured: true,
    webOrder: 2,
    accent: "gold",
  },
  {
    id: "travel-tactik",
    projectName: "TravelTactik",
    subtitle: "Organisation de voyages sur mesure",
    category: "Site web · voyage · activité entrepreneuriale",
    categories: ["dev", "sites-web-commerces", "business"],
    summary:
      "Repositionnement, direction artistique et développement d’un service d’organisation de voyages autour d’une offre simple : 20 € par jour de voyage.",
    context:
      "Projet entrepreneurial actif réunissant positionnement de marque, offre de service, parcours de conversion et production de livrables personnalisés.",
    objective:
      "Rendre la préparation d’un voyage plus claire et plus sereine, de la première demande jusqu’à la livraison d’un plan personnalisé.",
    solution:
      "Une identité visuelle complète, une présentation structurée des prestations et un parcours de demande fluide incluant le paiement et la livraison d’un carnet sur mesure.",
    features: [
      "Identité visuelle complète",
      "Présentation claire des prestations",
      "Parcours de demande client",
      "Intégration du paiement",
      "Comparaisons détaillées",
      "Carnets de voyage sur mesure",
      "Expérience responsive",
    ],
    role: "Produit · identité · développement · SEO",
    stack: ["Next.js", "React", "SEO", "Responsive design"],
    demonstratedSkills: ["Direction artistique", "UX/UI", "Next.js", "Business"],
    status: "Projet entrepreneurial actif",
    imageSrc: "/assets/projects/travel-tactik-cover.webp",
    videoSrc: "/videos/projects/traveltactik.mp4",
    link: "https://www.travel-tactik.com/",
    repositoryUrl: "https://github.com/Koryas57/TravelTactik",
    featured: true,
    webOrder: 1,
    accent: "blue",
  },
  {
    id: "cbd-relax",
    projectName: "CBD Relax",
    subtitle: "Concept digital pour boutique CBD",
    category: "Site web · catalogue · commerce local",
    categories: ["dev", "sites-web-commerces"],
    summary:
      "Un concept de site vitrine et catalogue conçu pour moderniser la présence numérique d’une boutique de CBD locale et permettre aux visiteurs de découvrir rapidement l’univers, les produits et les informations pratiques.",
    context:
      "Démonstration commerciale conçue de manière proactive. La boutique présentée n’a ni commandé ni payé ce site.",
    objective:
      "Montrer comment une boutique locale peut clarifier son offre, renforcer son image et guider rapidement les visiteurs vers ses points de vente.",
    solution:
      "Un univers visuel premium et rassurant, associé à un catalogue par catégories, une navigation mobile claire et des informations pratiques immédiatement accessibles.",
    features: [
      "Univers visuel premium adapté au secteur",
      "Catalogue de catégories",
      "Mise en avant des boutiques",
      "Navigation mobile",
      "Coordonnées et informations pratiques",
      "Expérience claire et rassurante",
    ],
    role: "Concept · UI/UX · développement front-end",
    stack: ["Vite", "React", "Responsive design"],
    demonstratedSkills: ["UI/UX", "Catalogue", "Retail", "Front-end"],
    status: "Démonstration commerciale",
    imageSrc: "/assets/projects/cbd-relax-cover.webp",
    videoSrc: "/videos/projects/cbdrelax.mp4",
    link: "https://cbd-relax.vercel.app/",
    featured: true,
    webOrder: 3,
    accent: "kynam",
  },
  {
    id: "nagara",
    projectName: "Nagara",
    category: "Jeu vidéo / expérience interactive",
    categories: ["dev"],
    summary:
      "Un monde jouable. Une direction artistique. Une logique d’expérience.",
    role: "Game design · prototype · narration",
    stack: ["Unreal Engine", "C++", "UI"],
    demonstratedSkills: ["Imaginaire", "Système", "Immersion"],
    status: "En construction",
    featured: true,
    accent: "violet",
  },
  {
    id: "vitrine-express",
    projectName: "Vitrine Express",
    category: "Création de sites vitrines",
    categories: ["dev", "business"],
    summary:
      "Une offre claire pour concevoir rapidement des sites vitrines nets, crédibles et orientés conversion.",
    role: "Produit · landing page · conversion",
    stack: ["React", "TypeScript", "SCSS"],
    demonstratedSkills: ["Marketing", "Clarté", "Vente"],
    status: "En ligne",
    imageSrc: VitrineExpress,
    showImageVisual: true,
    link: "https://vitrine-express-zeta.vercel.app/",
    featured: true,
    accent: "gold",
  },
  {
    id: "mode-immersion",
    projectName: "Mode Immersion",
    category: "Expérience 3D immersive",
    categories: ["dev"],
    summary:
      "Une expérience interactive jouable qui réunit conception 3D, gameplay, narration, ambiance sonore et intégration web.",
    role: "Conception · Unity · développement 3D · sound design",
    stack: ["Unity", "Audacity", "Three.js", "React", "WebGL"],
    demonstratedSkills: [
      "Unity",
      "Gameplay",
      "3D temps réel",
      "Sound design",
      "Narration interactive",
      "Intégration web",
    ],
    status: "En ligne",
    link: "/?path=developpeur&mode=immersive",
    featured: true,
    accent: "night",
  },
  {
    id: "applications-web",
    projectName: "Applications web",
    category: "Interfaces et outils métier",
    categories: ["dev"],
    summary:
      "Des interfaces qui manipulent des données et rendent un workflow plus lisible.",
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
    categories: ["dev"],
    summary:
      "Faire disparaître les tâches répétitives. Garder l’humain sur la décision.",
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
    category: "Commerce numérique / sourcing international",
    categories: ["business"],
    summary:
      "Un laboratoire business : produit, marge, marché, sourcing, exécution.",
    role: "Fondateur · sourcing · stratégie",
    stack: ["Commerce numérique", "Sourcing", "Marketplaces"],
    demonstratedSkills: ["Business", "Négociation", "Marché"],
    status: "En construction",
    featured: true,
    accent: "violet",
  },
];

export const featuredProjects = projects.filter((project) => project.featured);

export const getProjectsByCollection = (collection: ProjectCollection) =>
  projects.filter((project) => project.categories.includes(collection));

export const webCommerceProjects = getProjectsByCollection(
  "sites-web-commerces"
).sort((projectA, projectB) =>
  (projectA.webOrder ?? Number.MAX_SAFE_INTEGER) -
  (projectB.webOrder ?? Number.MAX_SAFE_INTEGER)
);

export const developerWebProjects = webCommerceProjects.filter((project) =>
  project.categories.includes("dev")
);
