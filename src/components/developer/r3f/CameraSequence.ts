export type CameraEase = "smooth" | "inOut" | "out";

export interface CameraSequenceStep {
  position: [number, number, number];
  lookAt: [number, number, number];
  duration: number;
  ease?: CameraEase;
  text?: string;
  stationId?: string;
}

export interface CameraSequence {
  id: string;
  replayable?: boolean;
  steps: CameraSequenceStep[];
}

export const mineSequences: CameraSequence[] = [
  {
    id: "front-end-systems",
    steps: [
      {
        position: [-1.2, 1.66, 3.6],
        lookAt: [-2.85, 0.98, 2.35],
        duration: 1800,
        text: "Comprendre avant de produire.",
        stationId: "front-end-systems",
      },
      {
        position: [-3.05, 1.62, 1.45],
        lookAt: [-2.85, 0.9, 2.35],
        duration: 2200,
        text: "Une interface n'est solide que si elle resiste a l'usage.",
        stationId: "front-end-systems",
      },
    ],
  },
  {
    id: "product-interfaces",
    steps: [
      {
        position: [1.2, 1.63, 0.45],
        lookAt: [2.72, 0.95, -0.95],
        duration: 1900,
        text: "Une idee floue devient un systeme.",
        stationId: "product-interfaces",
      },
      {
        position: [3.1, 1.6, -1.9],
        lookAt: [2.72, 0.9, -0.95],
        duration: 2200,
        text: "La clarte est une forme de vitesse.",
        stationId: "product-interfaces",
      },
    ],
  },
  {
    id: "data-apis",
    steps: [
      {
        position: [-0.7, 1.62, -3.2],
        lookAt: [-2.35, 0.9, -4.75],
        duration: 2200,
        text: "Les flux invisibles tiennent l'experience debout.",
        stationId: "data-apis",
      },
    ],
  },
  {
    id: "performance-seo",
    steps: [
      {
        position: [0.75, 1.64, -7.2],
        lookAt: [2.48, 0.9, -8.45],
        duration: 2100,
        text: "Ce qui charge vite se comprend plus vite.",
        stationId: "performance-seo",
      },
    ],
  },
  {
    id: "interactive-experiences",
    steps: [
      {
        position: [0.82, 1.68, -10.25],
        lookAt: [-0.45, 0.92, -11.7],
        duration: 2200,
        text: "Le code n'est qu'une partie de l'experience.",
        stationId: "interactive-experiences",
      },
    ],
  },
  {
    id: "tools-workflow",
    steps: [
      {
        position: [0.4, 1.62, -13.45],
        lookAt: [2.2, 0.92, -14.2],
        duration: 1900,
        text: "La methode laisse moins de bruit derriere elle.",
        stationId: "tools-workflow",
      },
    ],
  },
];
