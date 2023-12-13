import { Sample } from './Sample'

export interface SampleOptions {
  input: RequestInfo | URL
  gain?: number
  output?: AudioNode
}

export class SampleKit {
  readonly #audioContext: AudioContext
  readonly #output: AudioNode

  readonly samples: Record<string, Sample>

  id: string = crypto.randomUUID()
  name: string = 'Kit #1'

  constructor(
    audioContext: AudioContext,
    samples: Record<string, RequestInfo | URL | SampleOptions>,
    output: AudioNode = audioContext.destination,
  ) {
    this.#audioContext = audioContext
    this.#output = output

    this.samples = {}

    for (const sampleKey in samples) {
      const sample = samples[sampleKey]

      this.addSample(sampleKey, sample)
    }
  }

  addSample(sampleKey: string, sample: RequestInfo | URL | SampleOptions) {
    let gain: number = 1
    let output: AudioNode = this.#output
    let input: RequestInfo | URL = sample as RequestInfo | URL

    if (
      typeof sample !== 'string' &&
      !(sample instanceof Request) &&
      !(sample instanceof URL)
    ) {
      gain = sample.gain ?? gain
      output = sample.output ?? output
      input = sample.input ?? input
    }

    const sampleGain: GainNode = this.#audioContext.createGain()
    sampleGain.gain.value = gain
    sampleGain.connect(output)

    this.samples[sampleKey] = new Sample(this.#audioContext, input, sampleGain)
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
