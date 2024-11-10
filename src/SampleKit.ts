import type { UUID } from 'crypto'

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
  static localStorageKeyPrefix: string = 'ゼロ：Sample＿Kit：'
  static baseName: string = 'Kit'

  private status: 'configured' | 'configuring' = 'configuring'
  private readonly audioContext: AudioContext
  private channel?: Channel
  private output: AudioNode
  private readonly preset: SampleKitPreset

  public id: UUID
  public name: string

  public readonly gain: GainNode

  public readonly samples: Record<string, Sample>

  constructor({
    audioContext,
    id,
    name,
    samples = {},
    channel,
    output,
    savedPreset,
  }: {
    audioContext: AudioContext
    id?: UUID
    name?: string
    samples?: Record<string, RequestInfo | URL | SampleOptions>
    channel?: Channel
    output?: AudioNode
    savedPreset?: SampleKitPresetValues | SampleKitPresetValuesParsed
  }) {
    this.status = 'configuring'

    this.id = id ?? crypto.randomUUID()
    this.name = name ?? SampleKit.baseName

    this.audioContext = audioContext

    this.channel = channel

    if (output) {
      this.output = output
    } else if (channel) {
      this.output = channel.destination
    } else {
      this.output = audioContext.destination
    }

    this.gain = new GainNode(this.audioContext, { gain: 1 })
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
      const sample: RequestInfo | URL | SampleOptions = samples[sampleKey]

      this.addSample(sampleKey, sample)

      this.preset.samples[sampleKey] = this.samples[sampleKey]
    }

    this.status = 'configured'

    this.savePreset(false)
  }

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

  private savePresetDeferHandler?: number
  public savePreset(defer: boolean = true): void {
    if (this.savePresetDeferHandler) {
      clearTimeout(this.savePresetDeferHandler)
      this.savePresetDeferHandler = undefined
    }

    const save = (): void => {
      window.localStorage.setItem(
        `${SampleKit.localStorageKeyPrefix}${this.id}`,
        this.preset.getJSON(),
      )
    }

    if (defer) {
      this.savePresetDeferHandler = window.setTimeout(save, 100)
    } else {
      save()
    }
  }

  public async isReady(): Promise<void> {
    const promises: Promise<void>[] = []

    for (const key in this.samples) {
      promises.push(this.samples[key].isReady())
    }

    await Promise.all<void>(promises)
  }

  public isReadySync(): boolean {
    for (const key in this.samples) {
      if (!this.samples[key].isReadySync()) return false
    }

    return true
  }

  public onReady(onReadyCallback: () => void): void {
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

  public setOutput(output: AudioNode): void {
    this.gain.disconnect(this.output)
    this.output = output
    this.gain.connect(this.output)
  }

  public getChannel(): Channel | undefined {
    return this.channel
  }

  public setChannel(channel: Channel): void {
    this.channel = channel
    this.setOutput(this.channel.destination)

    if (this.status === 'configured') {
      this.preset.channelId = this.channel.id
      this.savePreset()
    }
  }

  public addSample(
    sampleKey: string,
    sample: RequestInfo | URL | SampleOptions,
  ) {
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

    const sampleGain: GainNode = new GainNode(this.audioContext, { gain })
    sampleGain.connect(output)

    this.samples[sampleKey] = new Sample({
      audioContext: this.audioContext,
      input,
      output: sampleGain,
    })

    if (this.preset) {
      this.preset.samples[sampleKey] = this.samples[sampleKey]
    }

    if (this.status === 'configured') {
      this.savePreset()
    }
  }

  // FIXME: These params are weird
  public play(
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

  public getPresetJSON(): string {
    return this.preset.getJSON()
  }
}
