import type { UUID } from 'crypto'

import { Effect } from '../../Effect'

export class BiquadFilter extends Effect {
  static baseName: string = 'Biquad Filter'
  static id: UUID = 'fb1891e9-51b4-49ed-9edb-7398dd893179'

  private readonly biquadFilter: BiquadFilterNode

  constructor({
    audioContext,
    id,
    name = BiquadFilter.baseName,
    output = audioContext.destination,
  }: {
    audioContext: AudioContext
    id?: UUID
    name?: string
    output?: AudioNode
  }) {
    super({ audioContext, output, id, name })

    this.biquadFilter = new BiquadFilterNode(this.audioContext)

    this.biquadFilter.connect(this.output)
  }
}
