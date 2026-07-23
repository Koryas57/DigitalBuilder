export type InterfaceChoiceColor = "cyan" | "green" | "purple";

export type InterfaceChoice = {
  id: "interfaces" | "systems" | "immersive";
  label: string;
  shortLabel: string;
  description: string;
  detailTitle: string;
  detailDescription: string;
  skills: string[];
  color: InterfaceChoiceColor;
  left: number;
  top: number;
  width: number;
  height: number;
};

export const INTERFACE_SOURCE_RATIO = 16 / 9;

export const INTERFACE_POSTER_SRC = "/assets/quick-mode/developer-hero-background.png";
export const INTERFACE_VIDEO_SRC = "/assets/quick-mode/2061-interface-reveal.mp4";
export const INTERFACE_FINAL_FRAME_SRC = "/assets/quick-mode/2061-interface-final-frame.webp";

export const INTERFACE_CHOICE_ZONES: InterfaceChoice[] = [
  {
    id: "interfaces",
    label: "Interfaces premium",
    shortLabel: "Interfaces",
    description: "Design systems, composants et experiences responsives.",
    detailTitle: "Interfaces premium",
    detailDescription: "Design systems, UX et interfaces responsives pour des produits propres, memorables et utiles.",
    skills: ["Composants reutilisables", "Responsive", "Accessibilite", "Motion design", "Systemes visuels"],
    color: "cyan",
    left: 9.9,
    top: 50.8,
    width: 24,
    height: 38.6,
  },
  {
    id: "systems",
    label: "Systemes produits",
    shortLabel: "Systemes",
    description: "Logique metier, donnees, APIs et architecture.",
    detailTitle: "Systemes produit",
    detailDescription: "Architecture, donnees et logique metier pour transformer une idee en produit fiable.",
    skills: ["APIs", "State management", "Automatisations", "Integrations", "Performance"],
    color: "green",
    left: 37,
    top: 49.4,
    width: 25,
    height: 38.6,
  },
  {
    id: "immersive",
    label: "Experiences interactives",
    shortLabel: "Interactif",
    description: "3D, WebGL, animation et experiences immersives.",
    detailTitle: "Experiences interactives",
    detailDescription: "Univers 3D, interactions WebGL et scenes immersives qui donnent envie d'explorer.",
    skills: ["Three.js", "React Three Fiber", "Scenes 3D", "Interactions", "Portfolio immersif"],
    color: "purple",
    left: 63.5,
    top: 49.4,
    width: 24,
    height: 38.6,
  },
];
