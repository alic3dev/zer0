import type { UUID } from 'crypto'

export interface SynthPresetValues {
  id: UUID
  name: string
  oscillators: { type: OscillatorType; volume?: number; offset?: number }[]
  gain: { initial?: number; curve?: number[] }
  bpm: number
  bpmSync: boolean
  hold: number
  portamento: number
  channelId?: string
}

export class SynthPreset implements SynthPresetValues {
  public id: SynthPresetValues['id']
  public name: SynthPresetValues['name']
  public oscillators: SynthPresetValues['oscillators']
  public gain: SynthPresetValues['gain']
  public bpm: SynthPresetValues['bpm']
  public bpmSync: SynthPresetValues['bpmSync']
  public hold: SynthPresetValues['hold']
  public portamento: SynthPresetValues['portamento']
  public channelId: SynthPresetValues['channelId']

  static readonly defaultPresetValues: Readonly<SynthPresetValues> =
    Object.freeze({
      id: crypto.randomUUID(),
      name: 'Basic',
      oscillators: [],
      gain: {},
      bpm: 270,
      bpmSync: true,
      hold: 0.9,
      portamento: 0,
    })

  constructor(preset: Partial<SynthPresetValues> = {}) {
    const _preset: SynthPresetValues = {
      ...SynthPreset.getDefaultPresetValues(),
      ...preset,
    }

    this.id = _preset.id ?? crypto.randomUUID()
    this.name = _preset.name
    this.oscillators = _preset.oscillators
    this.gain = _preset.gain
    this.bpm = _preset.bpm
    this.bpmSync = _preset.bpmSync
    this.hold = _preset.hold
    this.portamento = _preset.portamento
    this.channelId = _preset.channelId
  }

  private static getDefaultPresetValues(): SynthPresetValues {
    return {
      ...SynthPreset.defaultPresetValues,
      id: crypto.randomUUID(),
      oscillators: [...SynthPreset.defaultPresetValues.oscillators],
      gain: { ...SynthPreset.defaultPresetValues.gain },
    }
  }

  public asObject(): SynthPresetValues {
    const res: SynthPresetValues = {
      id: this.id,
      name: this.name,
      oscillators: this.oscillators,
      gain: this.gain,
      bpm: this.bpm,
      bpmSync: this.bpmSync,
      hold: this.hold,
      portamento: this.portamento,
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
