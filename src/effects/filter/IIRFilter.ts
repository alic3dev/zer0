import { Effect } from '../../Effect'

export class IIRFilter extends Effect {
  static baseName: string = 'IIR Filter'

  private readonly iirFilter: IIRFilterNode

  constructor({
    audioContext,
    output = audioContext.destination,
  }: {
    audioContext: AudioContext
    output?: AudioNode
  }) {
    super({ audioContext, output })
    this.iirFilter = this.audioContext.createIIRFilter([], [])
    this.iirFilter.connect(this.output)
  }
}
