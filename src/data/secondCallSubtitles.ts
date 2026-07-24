import type { SubtitleCue } from "./firstCallSubtitles";

// Les indications vocales entre crochets ne sont volontairement pas affichées.
// La fin de l'appel reste sans sous-titre pendant les rires et autres effets.
export const SECOND_CALL_SUBTITLES: SubtitleCue[] = [
  {
    start: 0.12,
    end: 1.35,
    text: "Oh non !!",
  },
  {
    start: 1.42,
    end: 3.32,
    text: "Tu es dans la boucle !",
  },
  {
    start: 3.72,
    end: 8.42,
    text: "Résous l'énigme et tu pourras sortir d'ici.",
  },
  {
    start: 8.72,
    end: 14.18,
    text: "Sinon tu resteras bloqué dans ce couloir pour l'éternité !",
  },
  {
    start: 14.52,
    end: 18.0,
    text: "???",
  },
];
