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
  public id: SynthPresetValues['id'] = crypto.randomUUID()
  public name: SynthPresetValues['name'] = 'Basic'
  public oscillators: SynthPresetValues['oscillators'] = []
  public gain: SynthPresetValues['gain'] = {}
  public bpm: SynthPresetValues['bpm'] = 270
  public bpmSync: SynthPresetValues['bpmSync'] = true
  public hold: SynthPresetValues['hold'] = 0.9
  public portamento: SynthPresetValues['portamento'] = 0.0
  public channelId: SynthPresetValues['channelId']

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
