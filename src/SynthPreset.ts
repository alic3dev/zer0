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
  id: SynthPresetValues['id'] = crypto.randomUUID()
  name: SynthPresetValues['name'] = 'Basic'
  oscillators: SynthPresetValues['oscillators'] = []
  gain: SynthPresetValues['gain'] = {}
  bpm: SynthPresetValues['bpm'] = 270
  bpmSync: SynthPresetValues['bpmSync'] = true
  hold: SynthPresetValues['hold'] = 0.9
  portamento: SynthPresetValues['portamento'] = 0.0
  channelId: SynthPresetValues['channelId']

  constructor(preset?: Partial<SynthPresetValues>) {
    if (!preset) return

    if (typeof preset.id !== 'undefined') {
      this.id = preset.id
    }

    if (typeof preset.name !== 'undefined') {
      this.name = preset.name
    }

    if (typeof preset.oscillators !== 'undefined') {
      this.oscillators = preset.oscillators
    }

    if (typeof preset.gain !== 'undefined') {
      this.gain = preset.gain
    }

    if (typeof preset.bpm !== 'undefined') {
      this.bpm = preset.bpm
    }

    if (typeof preset.bpmSync !== 'undefined') {
      this.bpmSync = preset.bpmSync
    }

    if (typeof preset.hold !== 'undefined') {
      this.hold = preset.hold
    }

    if (typeof preset.portamento !== 'undefined') {
      this.portamento = preset.portamento
    }

    if (typeof preset.channelId !== 'undefined') {
      this.channelId = preset.channelId
    }
  }

  asObject(): SynthPresetValues {
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

  getJSON(): string {
    return JSON.stringify(this.asObject())
  }
}
