import { Sample } from 'Sample'

export interface SampleKitPresetValues {
  id: string
  name: string
  samples: Record<string, Sample>
  gain: { initial?: number; curve?: number[] }
}

export interface SampleKitPresetValuesParsed
  extends Omit<SampleKitPresetValues, 'samples'> {
  samples: Record<string, { url?: string }>
}

export class SampleKitPreset implements SampleKitPresetValues {
  id: SampleKitPresetValues['id'] = crypto.randomUUID()
  name: SampleKitPresetValues['name'] = 'Basic Kit'
  samples: SampleKitPresetValues['samples'] = {}
  gain: SampleKitPresetValues['gain'] = {}

  constructor(preset?: Partial<SampleKitPresetValues>) {
    if (!preset) return

    if (preset.id) this.id = preset.id
    if (preset.name) this.name = preset.name
    if (preset.gain) this.gain = preset.gain
    if (preset.samples) this.samples = preset.samples
  }

  asObject(): SampleKitPresetValuesParsed {
    const samples: Record<string, { url: string }> = {}

    for (const key in this.samples) {
      samples[key] = {
        url: this.samples[key].getUrl()?.toString() ?? '',
      }
    }

    return {
      id: this.id,
      name: this.name,
      gain: this.gain,
      samples,
    }
  }

  getJSON(): string {
    return JSON.stringify(this.asObject())
  }
}
