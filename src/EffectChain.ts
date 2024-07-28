import { DelayReverb } from './effects/reverb/DelayReverb'
import { Effect } from './Effect'
import { BPMSync } from './BPMSync'

export class EffectChain {
  private audioContext: AudioContext
  private output: AudioNode
  private gain: GainNode

  private BPMSync: BPMSync

  effects: Effect[] = []

  public destination: AudioNode

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

    this.addEffect(
      new DelayReverb({
        audioContext: this.audioContext,
      }),
    )
  }

  private onBPMChange(bpm: number): void {
    for (const effect of this.effects) {
      effect.BPMSync.setBPM(bpm)
    }
  }

  addEffect(effect: Effect): void {
    const lastEffect: Effect | undefined = this.effects[this.effects.length - 1]

    if (lastEffect) {
      lastEffect.connect(effect)
    } else {
      this.gain.disconnect(this.output)
      this.gain.connect(effect.destination)
    }

    effect.BPMSync.setBPM(this.BPMSync.getBPM())

    effect.connect(this.output)

    this.effects.push(effect)
  }
}
