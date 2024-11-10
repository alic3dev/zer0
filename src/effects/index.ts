import type { UUID } from 'crypto'

import { Delay } from './delay'
import { BiquadFilter, IIRFilter } from './filter'
import { DelayReverb } from './reverb'

export type PossibleEffect =
  | typeof Delay
  | typeof BiquadFilter
  | typeof IIRFilter
  | typeof DelayReverb

export type EffectLookup = Record<string, PossibleEffect>

export interface EffectListItemEffect {
  id: UUID
  name: string
  effect: PossibleEffect
}

export interface EffectListItem {
  name: string
  effects: EffectListItemEffect[]
}

export const delay: EffectLookup = {
  Delay,
}

export const filter: EffectLookup = {
  BiquadFilter,
  IIRFilter,
}

export const reverb: EffectLookup = {
  DelayReverb,
}

export { Delay, BiquadFilter, IIRFilter, DelayReverb }

export const effects = {
  delay,
  filter,
  reverb,
}

function getEffectListItem(
  name: EffectListItem['name'],
  effects: EffectLookup,
): EffectListItem {
  return {
    name,
    effects: Object.values(effects).map(
      (effect: PossibleEffect): EffectListItemEffect => ({
        id: crypto.randomUUID(),
        name: effect.baseName,
        effect,
      }),
    ),
  }
}

export const effectsList: EffectListItem[] = [
  getEffectListItem('Delay', delay),
  getEffectListItem('Filter', filter),
  getEffectListItem('Reverb', reverb),
]
