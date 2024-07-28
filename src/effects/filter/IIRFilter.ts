import { Effect } from '../../Effect'

export class IIRFilter extends Effect {
  private readonly iirFilter: IIRFilterNode

  constructor(
    audioContext: AudioContext,
    output: AudioNode = audioContext.destination,
  ) {
    super({ audioContext, output })
    this.iirFilter = this.audioContext.createIIRFilter([], [])
    this.iirFilter.connect(this.output)
  }
}
