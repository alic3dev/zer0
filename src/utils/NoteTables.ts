export type Note =
  | 'A'
  | 'A#'
  | 'B'
  | 'C'
  | 'C#'
  | 'D'
  | 'D#'
  | 'E'
  | 'F'
  | 'F#'
  | 'G'
  | 'G#'

export const notes: Note[] = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
]

export type Octave = Record<Note, number>

export type FrequencyRootName = 'standard' | 'magic' | 'scientific'

export const frequencyRoots: Record<FrequencyRootName, number> = {
  standard: 440,
  magic: 432,
  scientific: 430.54,
}

export const frequencyRootNames: FrequencyRootName[] = Object.keys(
  frequencyRoots,
) as FrequencyRootName[]

export function createNoteTable(
  startingOctave = 0,
  endingOctave = 10,
  frequency = 440,
): Octave[] {
  const noteTable: Octave[] = []

  for (let i: number = startingOctave; i <= endingOctave; i++) {
    noteTable.push({
      C: Math.pow(2, (-57 + i * 12) / 12) * frequency,
      'C#': Math.pow(2, (-56 + i * 12) / 12) * frequency,
      D: Math.pow(2, (-55 + i * 12) / 12) * frequency,
      'D#': Math.pow(2, (-54 + i * 12) / 12) * frequency,
      E: Math.pow(2, (-53 + i * 12) / 12) * frequency,
      F: Math.pow(2, (-52 + i * 12) / 12) * frequency,
      'F#': Math.pow(2, (-51 + i * 12) / 12) * frequency,
      G: Math.pow(2, (-50 + i * 12) / 12) * frequency,
      'G#': Math.pow(2, (-49 + i * 12) / 12) * frequency,
      A: Math.pow(2, (-48 + i * 12) / 12) * frequency,
      'A#': Math.pow(2, (-47 + i * 12) / 12) * frequency,
      B: Math.pow(2, (-46 + i * 12) / 12) * frequency,
    })
  }

  return noteTable
}
