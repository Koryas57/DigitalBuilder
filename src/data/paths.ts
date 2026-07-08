export type PathId =
  | "developpeur"
  | "chef-de-projet"
  | "e-commerce"
  | "univers-personnel";

export type PathAccent = "kynam" | "violet" | "gold" | "cyan";

export interface ExperiencePath {
  id: PathId;
  title: string;
  label: string;
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
    accent: "violet",
    status: "soon",
  },
  {
    id: "e-commerce",
    title: "Parcours E-commerce",
    label: "Business, sourcing et optimisation",
    accent: "gold",
    status: "soon",
  },
  {
    id: "univers-personnel",
    title: "Univers personnel",
    label: "Curiosites, inspirations et laboratoire creatif",
    accent: "cyan",
    status: "soon",
  },
];

export const getExperiencePath = (pathId: string) =>
  experiencePaths.find((path) => path.id === pathId);
