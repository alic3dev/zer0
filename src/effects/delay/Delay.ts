import type { UUID } from 'crypto'

import { AutomatableParameter } from '../../AutomatableParameter'
import { Effect } from '../../Effect'

export class Delay extends Effect {
  static baseName: string = 'Delay'
  static id: UUID = 'e3205c20-3409-4b10-8a28-6e80f8f2304b'

  static readonly MAX_DELAY_TIME: number = 179

  private readonly delayNode: DelayNode
  private readonly decayGainNode: GainNode
  private delayTime: number = 1
  private decayAmount: number = 1 / 16

  constructor({
    audioContext,
    id,
    name = Delay.baseName,
    output = audioContext.destination,
  }: {
    audioContext: AudioContext
    id?: UUID
    name?: string
    output?: AudioNode
  }) {
    super({ audioContext, output, id, name })

    this.delayNode = new DelayNode(this.audioContext, {
      delayTime: this.delayTime,
      maxDelayTime: Delay.MAX_DELAY_TIME,
    })
    this.decayGainNode = new GainNode(this.audioContext, {
      gain: this.decayAmount,
    })

    this.destination.connect(this.delayNode)
    this.delayNode.connect(this.wetGainNode)
    this.delayNode.connect(this.decayGainNode)
    this.decayGainNode.connect(this.delayNode)

    this.BPMSync.onBPMChange(this.onBPMChange.bind(this))
    this.BPMSync.onSyncChange(this.onBPMChange.bind(this))

    this.parameters.push(
      new AutomatableParameter<number>({
        name: 'Delay Time',
        getValue: this.getDelayTime.bind(this),
        setValue: this.setDelayTime.bind(this),
      }),
      new AutomatableParameter<number>({
        name: 'Decay Amount',
        getValue: this.getDecayAmount.bind(this),
        setValue: this.setDecayAmount.bind(this),
      }),
    )
  }

  private onBPMChange(): void {
    this.delayNode.delayTime.value =
      (60 * this.delayTime) / this.BPMSync.getUsableBPM()
  }

  public getDelayTime(): number {
    return this.delayTime
  }

  public setDelayTime(delayTime: number): void {
    if (delayTime > Delay.MAX_DELAY_TIME) {
      delayTime = Delay.MAX_DELAY_TIME
    } else if (delayTime < 0) {
      delayTime = 0
    }

    this.delayTime = delayTime
    this.delayNode.delayTime.value =
      (60 * this.delayTime) / this.BPMSync.getUsableBPM()
  }

  public getDecayAmount(): number {
    return this.decayAmount
  }

  public setDecayAmount(decayAmount: number): void {
    this.decayGainNode.gain.value = decayAmount
    this.decayAmount = decayAmount
  }
}
