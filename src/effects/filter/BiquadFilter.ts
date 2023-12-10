import { Effect } from '../../Effect'

export class BiquadFilter extends Effect {
  #biquadFilter: BiquadFilterNode

  constructor(
    audioContext: AudioContext,
    output: AudioNode = audioContext.destination,
  ) {
    super(audioContext, output)

    this.#biquadFilter = this.audioContext.createBiquadFilter()

    this.#biquadFilter.connect(this.output)
  }
}
