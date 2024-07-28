import type { UUID } from 'crypto'

import { Effect } from '../../Effect'

export class IIRFilter extends Effect {
  static baseName: string = 'IIR Filter'

  private readonly iirFilter: IIRFilterNode

  constructor({
    audioContext,
    id,
    name = IIRFilter.baseName,
    output = audioContext.destination,
  }: {
    audioContext: AudioContext
    id?: UUID
    name?: string
    output?: AudioNode
  }) {
    super({ audioContext, output, id, name })

    this.iirFilter = new IIRFilterNode(this.audioContext, {
      feedback: [],
      feedforward: [],
    })
    this.iirFilter.connect(this.output)
  }
}
