export type { SynthPresetValues } from './src/SynthPreset'
export type { SampleKitPresetValues } from './src/SampleKitPreset'
export type { Octave, Note, FrequencyRootName } from './src/utils'
export type { ScaleName } from './src/utils/Scales'

export { AutomatableParameter } from './src/AutomatableParameter'
export { Channel } from './src/Channel'
export { Effect } from './src/Effect'
export { EffectChain } from './src/EffectChain'
export { Noise } from './src/Noise'
export { Oscillator } from './src/Oscillator'
export { Sample } from './src/Sample'
export { SampleKit } from './src/SampleKit'
export { Synth } from './src/Synth'

export { SynthPreset } from './src/SynthPreset'
export { utils } from './src/utils'

import { filter, reverb } from './src/effects'
export const effects = {
  filter,
  reverb,
}
