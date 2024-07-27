import { Channel } from './Channel'
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
  private status: 'configured' | 'configuring' = 'configuring'
  private readonly audioContext: AudioContext
  private output: AudioNode
  private preset: SampleKitPreset
  private getDefaultPreset(): SampleKitPresetValues {
    return {
      id: this.id,
      name: this.name,
      gain: {
        initial: 0,
      },
      samples: this.samples,
    }
  }

  id: string = crypto.randomUUID()
  name: string = 'Kit'

  channel?: Channel
  readonly gain: GainNode

  readonly samples: Record<string, Sample>

  constructor({
    audioContext,
    samples = {},
    channel,
    output,
    savedPreset,
  }: {
    audioContext: AudioContext
    samples?: Record<string, RequestInfo | URL | SampleOptions>
    channel?: Channel
    output?: AudioNode
    savedPreset?: SampleKitPresetValues | SampleKitPresetValuesParsed
  }) {
    this.status = 'configuring'

    this.audioContext = audioContext

    this.channel = channel

    if (output) {
      this.output = output
    } else if (channel) {
      this.output = channel.destination
    } else {
      this.output = audioContext.destination
    }

    this.gain = this.audioContext.createGain()
    this.gain.gain.value = 1
    this.gain.connect(this.output)

    this.samples = {}

    if (savedPreset) {
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

      this.preset = new SampleKitPreset({
        ...savedPreset,
        samples: this.samples,
      })
    } else {
      this.preset = new SampleKitPreset(this.getDefaultPreset())
    }

    this.id = this.preset.id ?? this.id
    this.name = this.preset.name ?? this.name

    for (const sampleKey in samples) {
      const sample = samples[sampleKey]

      this.addSample(sampleKey, sample)

      this.preset.samples[sampleKey] = this.samples[sampleKey]
    }

    this.status = 'configured'

    this.savePreset(false)
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

  setOutput(output: AudioNode): void {
    this.gain.disconnect(this.output)
    this.output = output
    this.gain.connect(this.output);
  }

  setChannel(channel: Channel): void {
    this.channel = channel
    console.log(this.channel)
    this.setOutput(this.channel.destination)
  }

  addSample(sampleKey: string, sample: RequestInfo | URL | SampleOptions) {
    let gain: number = 1
    let output: AudioNode | undefined = this.gain
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

    const sampleGain: GainNode = this.audioContext.createGain()
    sampleGain.gain.value = gain
    sampleGain.connect(output)

    this.samples[sampleKey] = new Sample(this.audioContext, input, sampleGain)

    if (this.preset) {
      this.preset.samples[sampleKey] = this.samples[sampleKey]
    }

    if (this.status === 'configured') {
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
    return this.preset.getJSON()
  }

  private savePresetDeferHandler?: number
  savePreset(defer: boolean = true): void {
    if (this.savePresetDeferHandler) {
      clearTimeout(this.savePresetDeferHandler)
      this.savePresetDeferHandler = undefined
    }

    const save = (): void => {
      window.localStorage.setItem(
        `ゼロ：Sample＿Kit：${this.id}`,
        this.preset.getJSON(),
      )
    }

    if (defer) {
      this.savePresetDeferHandler = window.setTimeout(save, 100)
    } else {
      save()
    }
  }
}
