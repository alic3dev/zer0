import { Note, notes } from "./NoteTables";

type ScaleName = "all" | "major" | "minor";

export const scales: Record<ScaleName, number[]> = {
  //    C  C# D  D# E  F  F# G  G# A  A#   B
  all: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
};

export function getScaleInKey(scale: ScaleName, key: Note) {
  const offset = notes.indexOf(key);

  return scales[scale].map((v) => notes[(v + offset) % notes.length]);
}

// export const scalesAsNotes: Record<ScaleName, Scale> = {
//   all: ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"],
//   major: ["C", "D", "E", "F", "G", "A", "B"],
//   minor: ["C", "D", "D#", "F", "G", "G#", "A#"],
// };
