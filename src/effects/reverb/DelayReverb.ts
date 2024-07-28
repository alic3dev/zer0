import type { UUID } from 'crypto'

import { AutomatableParameter } from '../../AutomatableParameter'
import { Effect } from '../../Effect'

export class DelayReverb extends Effect {
  audioContext: AudioContext
  delayNode: DelayNode
  decayGainNode: GainNode
  delayTime: number = 1
  decayAmount: number = 1 / 16

  constructor({
    audioContext,
    id,
    name = 'Delay Reverb',
    output = audioContext.destination,
  }: {
    audioContext: AudioContext
    id?: UUID
    name?: string
    output?: AudioNode
  }) {
    super({ audioContext, output, id, name })

    this.audioContext = audioContext
    this.output = output

    this.delayNode = this.audioContext.createDelay(179)
    this.setDelayTime()

    this.decayGainNode = this.audioContext.createGain()
    this.decayGainNode.gain.value = this.decayAmount

    this.destination.connect(this.delayNode)
    this.delayNode.connect(this.wetGainNode)
    this.delayNode.connect(this.decayGainNode)
    this.decayGainNode.connect(this.delayNode)

    this.BPMSync.onBPMChange((): void => {
      this.delayNode.delayTime.value =
        (60 * this.delayTime) / this.BPMSync.getUsableBPM()
    })

    this.BPMSync.onSyncChange((): void => {
      this.delayNode.delayTime.value =
        (60 * this.delayTime) / this.BPMSync.getUsableBPM()
    })

    this.parameters.push(
      new AutomatableParameter<number>({
        name: 'Delay Time',
        getValue: (): number => this.delayTime,
        setValue: (delayTime: number): void => {
          this.setDelayTime(delayTime)
        },
      }),
      new AutomatableParameter<number>({
        name: 'Decay Amount',
        getValue: (): number => this.decayAmount,
        setValue: (decayAmount: number): void => {
          this.decayGainNode.gain.value = decayAmount
          this.decayAmount = decayAmount
        },
      }),
    )
  }

  private setDelayTime(delayTime: number = this.delayTime): void {
    this.delayTime = delayTime
    this.delayNode.delayTime.value =
      (60 * this.delayTime) / this.BPMSync.getUsableBPM()
  }
}
