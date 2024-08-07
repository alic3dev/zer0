export interface SynthPresetValues {
  id: string
  name: string
  oscillators: { type: OscillatorType; volume?: number; offset?: number }[]
  gain: { initial?: number; curve?: number[] }
  bpm: boolean | number
  hold: number
  portamento: number
  channelId?: string
}

export class SynthPreset implements SynthPresetValues {
  id: SynthPresetValues['id'] = crypto.randomUUID()
  name: SynthPresetValues['name'] = 'Basic'
  oscillators: SynthPresetValues['oscillators'] = []
  gain: SynthPresetValues['gain'] = {}
  bpm: SynthPresetValues['bpm'] = true
  hold: SynthPresetValues['hold'] = 0.9
  portamento: SynthPresetValues['portamento'] = 0.0
  channelId: SynthPresetValues['channelId']

  constructor(preset?: Partial<SynthPresetValues>) {
    if (!preset) return

    if (preset.id) this.id = preset.id
    if (preset.name) this.name = preset.name
    if (preset.oscillators) this.oscillators = preset.oscillators
    if (preset.gain) this.gain = preset.gain
    if (preset.bpm) this.bpm = preset.bpm
    if (preset.hold) this.hold = preset.hold
    if (preset.portamento) this.portamento = preset.portamento
    if (preset.channelId) this.channelId = preset.channelId
  }

  asObject(): SynthPresetValues {
    const res: SynthPresetValues = {
      id: this.id,
      name: this.name,
      oscillators: this.oscillators,
      gain: this.gain,
      bpm: this.bpm,
      hold: this.hold,
      portamento: this.portamento,
    }

    if (this.channelId) {
      res.channelId = this.channelId
    }

    return res
  }

  getJSON(): string {
    return JSON.stringify(this.asObject())
  }
}
