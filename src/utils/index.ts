import { Note, Octave, createNoteTable, notes } from "./NoteTables";
import { scales, getScaleInKey } from "./Scales";

export type { Note };
export type { Octave };

export const utils = {
  createNoteTable,
  notes,
  scales,
  getScaleInKey,
};
