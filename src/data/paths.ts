export type PathId =
  | "developpeur"
  | "chef-de-projet"
  | "sites-web-commerces"
  | "univers-personnel";

export type PathAccent = "kynam" | "violet" | "gold" | "cyan";

export interface ExperiencePath {
  id: PathId;
  title: string;
  label: string;
  placeholderDescription?: string;
  accent: PathAccent;
  status: "ready" | "soon";
}

export const experiencePaths: ExperiencePath[] = [
  {
    id: "developpeur",
    title: "Parcours Developpeur",
    label: "Laboratoire technique interactif",
    accent: "kynam",
    status: "ready",
  },
  {
    id: "chef-de-projet",
    title: "Parcours Chef de projet",
    label: "Vision produit, cadrage et execution",
    placeholderDescription:
      "Une immersion dans ma façon de cadrer une idée, structurer les priorités et piloter un projet jusqu’à sa réalisation.",
    accent: "violet",
    status: "soon",
  },
  {
    id: "sites-web-commerces",
    title: "Sites Web",
    label: "Sites premium, vitrines et expériences digitales",
    accent: "gold",
    status: "ready",
  },
  {
    id: "univers-personnel",
    title: "Univers personnel",
    label: "Curiosites, inspirations et laboratoire creatif",
    placeholderDescription:
      "Un espace consacré à mes inspirations, mes expérimentations et aux projets personnels qui nourrissent ma créativité.",
    accent: "cyan",
    status: "soon",
  },
];

export const getExperiencePath = (pathId: string) => {
  const compatiblePathId =
    pathId === "e-commerce" ? "sites-web-commerces" : pathId;

  return experiencePaths.find((path) => path.id === compatiblePathId);
};
