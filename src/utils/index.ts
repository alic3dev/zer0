import {
  Note,
  Octave,
  FrequencyRootName,
  createNoteTable,
  notes,
  frequencyRoots,
  frequencyRootNames,
} from './NoteTables'
import { scales, scaleNames, getScaleInKey } from './Scales'

export type { Note, Octave, FrequencyRootName }

export const utils = {
  createNoteTable,
  notes,
  scales,
  scaleNames,
  frequencyRoots,
  frequencyRootNames,
  getScaleInKey,
}
