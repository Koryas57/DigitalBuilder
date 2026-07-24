export type SubtitleCue = {
  start: number;
  end: number;
  text: string;
};

// Texte et timings provisoires. La durée réelle est lue depuis FirstCall.mp3
// dans le navigateur et reste visible dans la console de debug.
export const FIRST_CALL_SUBTITLES: SubtitleCue[] = [
  {
    start: 0,
    end: 2.2,
    text: "Allô ? Est-ce que tu m’entends ?",
  },
  {
    start: 2.4,
    end: 4.8,
    text: "Il faut que tu sortes de là tout de suite.",
  },
  {
    start: 5.0,
    end: 7.8,
    text: "Ne reste pas dans ce bâtiment.",
  },
  {
    start: 8.0,
    end: 10.5,
    text: "Je t’attends dehors... Dépêche-toi !",
  },
];
