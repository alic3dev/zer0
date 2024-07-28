import { Effect } from '../../Effect'

export class BiquadFilter extends Effect {
  static baseName: string = 'Biquad Filter'

  private readonly biquadFilter: BiquadFilterNode

  constructor({
    audioContext,
    output = audioContext.destination,
  }: {
    audioContext: AudioContext
    output?: AudioNode
  }) {
    super({ audioContext, output })

    this.biquadFilter = this.audioContext.createBiquadFilter()
    this.biquadFilter.connect(this.output)
  }
}
