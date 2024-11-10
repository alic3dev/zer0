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
  public id: SampleKitPresetValues['id']
  public name: SampleKitPresetValues['name']
  public samples: SampleKitPresetValues['samples']
  public gain: SampleKitPresetValues['gain']
  public channelId: SampleKitPresetValues['channelId']

  static readonly defaultPresetValues: Readonly<SampleKitPresetValues> =
    Object.freeze({
      id: crypto.randomUUID(),
      name: 'Basic Kit',
      samples: {},
      gain: {},
    })

  constructor(preset: Partial<SampleKitPresetValues> = {}) {
    const _preset: SampleKitPresetValues = {
      ...SampleKitPreset.getDefaultPresetValues(),
      ...preset,
    }

    this.id = _preset.id
    this.name = _preset.name
    this.gain = _preset.gain
    this.samples = _preset.samples
    this.channelId = _preset.channelId
  }

  private static getDefaultPresetValues(): SampleKitPresetValues {
    return {
      ...SampleKitPreset.defaultPresetValues,
      id: crypto.randomUUID(),
      samples: { ...SampleKitPreset.defaultPresetValues.samples },
      gain: { ...SampleKitPreset.defaultPresetValues.gain },
    }
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
