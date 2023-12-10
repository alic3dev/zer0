import {
  Note,
  Octave,
  createNoteTable,
  notes,
  frequencyRoots,
} from './NoteTables'
import { scales, getScaleInKey } from './Scales'

export type { Note }
export type { Octave }

export const utils = {
  createNoteTable,
  notes,
  scales,
  frequencyRoots,
  getScaleInKey,
}
