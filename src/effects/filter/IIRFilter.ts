import type { UUID } from 'crypto'

import { Effect } from '../../Effect'

export class IIRFilter extends Effect {
  static baseName: string = 'IIR Filter'
  static id: UUID = '059c48cc-5c96-4747-b788-0b886a6fc81a'

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
