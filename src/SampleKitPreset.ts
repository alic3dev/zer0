import type { UUID } from 'crypto'

import { Sample } from './Sample'

export interface SampleKitPresetValues {
  id: UUID
  name: string
  samples: Record<string, Sample>
  gain: { initial?: number; curve?: number[] }
  channelId?: string
}

export interface SampleKitPresetValuesParsed
  extends Omit<SampleKitPresetValues, 'samples'> {
  samples: Record<string, { url?: string }>
}

export class SampleKitPreset implements SampleKitPresetValues {
  public id: SampleKitPresetValues['id'] = crypto.randomUUID()
  public name: SampleKitPresetValues['name'] = 'Basic Kit'
  public samples: SampleKitPresetValues['samples'] = {}
  public gain: SampleKitPresetValues['gain'] = {}
  public channelId: SampleKitPresetValues['channelId']

  constructor(preset?: Partial<SampleKitPresetValues>) {
    if (!preset) return

    if (preset.id) this.id = preset.id
    if (preset.name) this.name = preset.name
    if (preset.gain) this.gain = preset.gain
    if (preset.samples) this.samples = preset.samples
    if (preset.channelId) this.channelId = preset.channelId
  }

  public asObject(): SampleKitPresetValuesParsed {
    const res: SampleKitPresetValuesParsed = {
      id: this.id,
      name: this.name,
      gain: this.gain,
      samples: {},
    }

    for (const key in this.samples) {
      res.samples[key] = {
        url: this.samples[key].getUrl()?.toString() ?? '',
      }
    }

    if (this.channelId) {
      res.channelId = this.channelId
    }

    return res
  }

  public getJSON(): string {
    return JSON.stringify(this.asObject())
  }
}
