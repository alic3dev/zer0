import type { UUID } from 'crypto'

import { BPMSync } from './BPMSync'
import { EffectChain } from './EffectChain'

export class Channel {
  private readonly audioContext: AudioContext

  public id: UUID = crypto.randomUUID()
  public name: string = 'Channel'

  public readonly output: AudioNode
  public readonly gain: GainNode
  public readonly analyser?: AnalyserNode
  public readonly destination: AudioNode

  public readonly effectChain: EffectChain
  public readonly BPMSync: BPMSync = new BPMSync({})
  public readonly ANALYSER_BUFFER_LENGTH?: number
  public readonly ANALYSER_DATA_ARRAY?: Uint8Array

  static readonly FFT_SIZE: number = 2048

  constructor({
    id,
    name,
    audioContext,
    output = audioContext.destination,
    withAnalyser = true,
  }: {
    id?: UUID
    name?: string
    audioContext: AudioContext
    output?: AudioNode
    withAnalyser?: boolean
  }) {
    if (id) {
      this.id = id
    }

    if (name) {
      this.name = name
    }

    this.audioContext = audioContext
    this.output = output

    this.gain = new GainNode(this.audioContext)

    this.analyser = new AnalyserNode(this.audioContext, {
      fftSize: Channel.FFT_SIZE,
    })

    if (withAnalyser) {
      this.ANALYSER_BUFFER_LENGTH = this.analyser.frequencyBinCount
      this.ANALYSER_DATA_ARRAY = new Uint8Array(this.ANALYSER_BUFFER_LENGTH)

      this.analyser.connect(this.output)
      this.gain.connect(this.analyser)
    } else {
      this.gain.connect(this.output)
    }

    this.effectChain = new EffectChain({
      audioContext,
      BPMSync: this.BPMSync,
      output: this.gain,
    })

    this.destination = this.effectChain.destination
  }

  public pollAnalyser(): Uint8Array | undefined {
    if (this.analyser && this.ANALYSER_DATA_ARRAY) {
      this.analyser?.getByteTimeDomainData(this.ANALYSER_DATA_ARRAY)
    }

    return this.ANALYSER_DATA_ARRAY
  }
}
