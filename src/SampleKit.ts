import { Sample } from './Sample'
import {
  SampleKitPreset,
  SampleKitPresetValues,
  SampleKitPresetValuesParsed,
} from './SampleKitPreset'

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

  #status: 'configured' | 'configuring' = 'configuring'

  #preset: SampleKitPreset
  #getDefaultPreset(): SampleKitPresetValues {
    return {
      id: this.id,
      name: this.name,
      gain: {
        initial: 0,
      },
      samples: this.samples,
    }
  }

  constructor(
    audioContext: AudioContext,
    samples: Record<string, RequestInfo | URL | SampleOptions>,
    output: AudioNode = audioContext.destination,
    savedPreset?: SampleKitPresetValues | SampleKitPresetValuesParsed,
  ) {
    this.#status = 'configuring'

    this.#audioContext = audioContext
    this.#output = output

    this.samples = {}

    if (savedPreset) {
      try {
        for (const sampleKey in savedPreset.samples) {
          if (savedPreset.samples[sampleKey] instanceof Sample) {
            this.samples[sampleKey] = savedPreset.samples[sampleKey] as Sample
          } else {
            this.addSample(
              sampleKey,
              (savedPreset.samples[sampleKey] as { url: string }).url,
            )
          }
        }

        this.#preset = new SampleKitPreset({
          ...savedPreset,
          samples: this.samples,
        })
      } catch {
        this.#preset = new SampleKitPreset(this.#getDefaultPreset())
      }
    } else {
      this.#preset = new SampleKitPreset(this.#getDefaultPreset())
    }

    this.id = this.#preset.id ?? this.id
    this.name = this.#preset.name ?? this.name

    for (const sampleKey in samples) {
      const sample = samples[sampleKey]

      this.addSample(sampleKey, sample)
    }

    this.#status = 'configured'

    this.savePreset()
  }

  async isReady(): Promise<void> {
    const promises: Promise<void>[] = []

    for (const key in this.samples) {
      promises.push(this.samples[key].isReady())
    }

    await Promise.all<void>(promises)
  }

  isReadySync(): boolean {
    for (const key in this.samples) {
      if (!this.samples[key].isReadySync()) return false
    }

    return true
  }

  onReady(onReadyCallback: () => void): void {
    const promises: Promise<void>[] = []

    for (const key in this.samples) {
      if (!this.samples[key].isReady()) {
        promises.push(
          new Promise<void>((resolve: () => void): void => {
            this.samples[key].onReady(resolve)
          }),
        )
      }
    }

    Promise.all<void>(promises).then(onReadyCallback)
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

    if (this.#status === 'configured') {
      this.savePreset()
    }
  }

  // FIXME: These params are weird
  play(
    offset: number = 0,
    ...sampleKeys: (string | { name: string; gain?: number })[]
  ): void {
    for (const sampleKey of sampleKeys) {
      if (typeof sampleKey === 'string') {
        const sample: Sample = this.samples[sampleKey]

        if (!sample) throw new Error('Unknown sample key')

        sample.play(offset)
      } else {
        const sample: Sample = this.samples[sampleKey.name]

        if (!sample) throw new Error('Unknown sample key')

        sample.play(offset, sampleKey.gain)
      }
    }
  }

  getPresetJSON(): string {
    return this.#preset.getJSON()
  }

  #savePresetDeferHandler?: number
  savePreset(): void {
    if (this.#savePresetDeferHandler) {
      clearTimeout(this.#savePresetDeferHandler)
      this.#savePresetDeferHandler = undefined
    }

    this.#savePresetDeferHandler = window.setTimeout(
      (): void =>
        window.localStorage.setItem(
          `ゼロ：Sample＿Kit：${this.id}`,
          this.#preset.getJSON(),
        ),
      100,
    )
  }
}
