import type { UUID } from 'crypto'

import { BPMSync } from './BPMSync'
import { AutomatableParameter } from './AutomatableParameter'

export abstract class Effect {
  static baseName: string = 'Effect'

  public id: UUID
  public name: string

  public readonly audioContext: AudioContext
  public readonly destination: AudioNode
  public readonly BPMSync: BPMSync = new BPMSync({})
  public readonly parameters: AutomatableParameter[] = []

  protected output: AudioNode
  protected readonly dryGainNode: GainNode
  protected readonly wetGainNode: GainNode
  protected mix: number = 1 / 3

  constructor({
    audioContext,
    id = crypto.randomUUID(),
    name = 'Effect',
    output = audioContext.destination,
  }: {
    audioContext: AudioContext
    id?: UUID
    name?: string
    output?: AudioNode
  }) {
    this.audioContext = audioContext

    this.id = id
    this.name = name

    this.destination = audioContext.createGain()
    this.output = output

    this.dryGainNode = this.audioContext.createGain()
    this.dryGainNode.gain.value = 1 - this.mix
    this.wetGainNode = this.audioContext.createGain()
    this.wetGainNode.gain.value = this.mix

    this.destination.connect(this.dryGainNode)

    this.dryGainNode.connect(this.output)
    this.wetGainNode.connect(this.output)

    this.parameters.push(
      new AutomatableParameter<boolean>({
        name: 'BPM Sync',
        type: 'boolean',
        getValue: (): boolean => this.BPMSync.getSync(),
        setValue: (sync: boolean): void => {
          this.BPMSync.setSync(sync)
        },
      }),
      new AutomatableParameter<number>({
        name: 'Mix',
        control: 'slider',
        getValue: (): number => this.mix,
        setValue: (mix: number): void => {
          this.mix = mix
          this.dryGainNode.gain.value = 1 - this.mix
          this.wetGainNode.gain.value = this.mix
        },
      }),
    )
  }

  public connect(output: AudioNode | Effect): void {
    this.dryGainNode.disconnect(this.output)
    this.wetGainNode.disconnect(this.output)

    if (output instanceof AudioNode) {
      this.output = output
    } else {
      this.output = output.output
    }

    this.dryGainNode.connect(this.output)
    this.wetGainNode.connect(this.output)
  }
}
