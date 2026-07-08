export interface KoryasVideo {
  id: string;
  embedUrl?: string;
  playlistId?: string;
  channelId?: string;
  title: string;
  description: string;
  thumbnail?: string;
  url: string;
}

export interface KoryasTvScreenConfig {
  featuredIndex: number;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  interactionRadius: number;
}

export const koryasTvScreen: KoryasTvScreenConfig = {
  // Change cet index pour choisir la video affichee directement sur la TV.
  featuredIndex: 0,

  // Axes Three.js : x = gauche/droite, y = hauteur, z = profondeur.
  // Modifie ces valeurs puis recharge la page pour caler l'ecran sur la TV.
  position: [-6.42, 1.18, 2.815],
  rotation: [0, 1.5, 0],
  scale: [1.38, 0.78, 1],
  interactionRadius: 2.55,
};

export const koryasVideos: KoryasVideo[] = [
  {
    id: "",
    channelId: "UCLYTUoJ8nP1y4YszeHi09CQ",
    title: "Koryas FPV - Showreel drone",
    description: "Ajoute ici une URL video YouTube, un ID video, une playlist ou un channel ID UC...",
    thumbnail: "",
    url: "https://www.youtube.com/results?search_query=Koryas+FPV",
  },
  {
    id: "",
    embedUrl: "https://www.youtube.com/watch?v=n47-6HVndik",
    title: "Session freestyle FPV",
    description: "Placeholder pour une session immersive drone / montage.",
    thumbnail: "",
    url: "https://www.youtube.com/watch?v=n47-6HVndik",
  },
  {
    id: "",
    channelId: "UCLYTUoJ8nP1y4YszeHi09CQ",
    title: "Exploration visuelle",
    description: "Placeholder pour une video orientee image, rythme et ambiance.",
    thumbnail: "",
    url: "https://www.youtube.com/results?search_query=Koryas+FPV+drone",
  },
];
