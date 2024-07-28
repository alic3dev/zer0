import { DelayReverb } from './effects/reverb/DelayReverb'
import { Effect } from './Effect'
import { BPMSync } from './BPMSync'
import { PossibleEffect } from 'effects'

export class EffectChain {
  private readonly audioContext: AudioContext
  private readonly gain: GainNode
  private readonly BPMSync: BPMSync
  private output: AudioNode

  public readonly destination: AudioNode
  public readonly effects: Effect[] = []

  constructor({
    audioContext,
    BPMSync,
    effects = [],
    output = audioContext.destination,
  }: {
    audioContext: AudioContext
    BPMSync: BPMSync
    effects?: Effect[]
    output?: AudioNode
  }) {
    this.audioContext = audioContext

    this.BPMSync = BPMSync
    this.BPMSync.onBPMChange(this.onBPMChange.bind(this))

    this.gain = this.audioContext.createGain()

    this.destination = this.gain
    this.output = output

    this.gain.connect(this.output)

    for (const effect of effects) {
      this.addEffect(effect)
    }
  }

  private onBPMChange(bpm: number): void {
    for (const effect of this.effects) {
      effect.BPMSync.setBPM(bpm)
    }
  }

  public addEffect(effect: Effect | PossibleEffect): void {
    const _effect: Effect =
      effect instanceof Effect
        ? effect
        : new effect({ audioContext: this.audioContext })

    const lastEffect: Effect | undefined = this.effects[this.effects.length - 1]

    if (lastEffect) {
      lastEffect.connect(_effect)
    } else {
      this.gain.disconnect(this.output)
      this.gain.connect(_effect.destination)
    }

    _effect.BPMSync.setBPM(this.BPMSync.getBPM())

    _effect.connect(this.output)

    this.effects.push(_effect)
  }
}
