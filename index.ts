export { Channel } from './src/Channel'
export { Effect } from './src/Effect'
export { Noise } from './src/Noise'
export { Oscillator } from './src/Oscillator'
export { Sample } from './src/Sample'
export { SampleKit } from './src/SampleKit'
export { Synth } from './src/Synth'

import { SynthPreset, SynthPresetValues } from './src/SynthPreset'
import { Octave, Note, utils } from './src/utils'

export type { SynthPresetValues, Octave, Note }
export { SynthPreset, utils }

import { filter, reverb } from './src/effects'
export const effects = {
  filter,
  reverb,
}
