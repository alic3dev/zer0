export { Channel } from './src/Channel'
export { Effect } from './src/Effect'
export { Noise } from './src/Noise'
export { Oscillator } from './src/Oscillator'
export { Sample } from './src/Sample'
export { SampleKit } from './src/SampleKit'
export { Synth } from './src/Synth'

import { Octave, Note, utils } from './src/utils'
export type { Octave, Note }
export { utils }

import { filter, reverb } from './src/effects'
export const effects = {
  filter,
  reverb,
}
