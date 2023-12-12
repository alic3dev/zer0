import { Sample } from './Sample'

export interface SampleOptions {
  input: RequestInfo | URL
  gain?: number
  output?: AudioNode
}

export class SampleKit {
  readonly #audioContext: AudioContext
  readonly #output: AudioNode
  readonly #samples: Record<string, Sample>

  id: string = crypto.randomUUID()
  name: string = 'Kit #1'

  constructor(
    audioContext: AudioContext,
    samples: Record<string, RequestInfo | URL | SampleOptions>,
    output: AudioNode = audioContext.destination,
  ) {
    this.#audioContext = audioContext
    this.#output = output

    this.#samples = {}

    for (const sampleKey in samples) {
      const sample = samples[sampleKey]

      if (
        typeof sample === 'string' ||
        sample instanceof Request ||
        sample instanceof URL
      ) {
        this.#samples[sampleKey] = new Sample(
          this.#audioContext,
          sample,
          this.#output,
        )
      } else if (typeof sample.gain === 'number' && sample.gain !== 1.0) {
        const sampleGain = audioContext.createGain()
        sampleGain.gain.value = sample.gain
        sampleGain.connect(sample.output ?? this.#output)

        this.#samples[sampleKey] = new Sample(
          this.#audioContext,
          sample.input,
          sampleGain,
        )
      } else {
        this.#samples[sampleKey] = new Sample(
          this.#audioContext,
          sample.input,
          sample.output ?? this.#output,
        )
      }
    }
  }

  // FIXME: These params are weird
  play(...sampleKeys: (string | { name: string; gain?: number })[]): void {
    for (const sampleKey of sampleKeys) {
      if (typeof sampleKey === 'string') {
        const sample: Sample = this.#samples[sampleKey]

        if (!sample) throw new Error('Unknown sample key')

        sample.play()
      } else {
        const sample: Sample = this.#samples[sampleKey.name]

        if (!sample) throw new Error('Unknown sample key')

        sample.play(sampleKey.gain)
      }
    }
  }
}
