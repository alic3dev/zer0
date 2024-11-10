import type { UUID } from 'crypto'

export interface EffectParameter<T = unknown> {
  name: string
  value: T
}

export interface EffectPresetValues {
  id: UUID
  name: string
  mix: number
  bpmSync: boolean
  parameters: EffectParameter[]
}

export class EffectPreset implements EffectPresetValues {
  public id: EffectPresetValues['id']
  public name: EffectPresetValues['name']
  public mix: EffectPresetValues['mix']
  public bpmSync: EffectPresetValues['bpmSync']
  public parameters: EffectPresetValues['parameters']

  static readonly defaultPresetValues: Readonly<EffectPresetValues> =
    Object.freeze({
      id: crypto.randomUUID(),
      name: 'Effect',
      mix: 1 / 3,
      bpmSync: true,
      parameters: [],
    })

  constructor(preset: Partial<EffectPresetValues> = {}) {
    const _preset: EffectPresetValues = {
      ...EffectPreset.getDefaultPresetValues(),
      ...preset,
    }

    this.id = _preset.id
    this.name = _preset.name
    this.mix = _preset.mix
    this.bpmSync = _preset.bpmSync
    this.parameters = _preset.parameters
  }

  private static getDefaultPresetValues(): EffectPresetValues {
    return {
      ...EffectPreset.defaultPresetValues,
      id: crypto.randomUUID(),
    }
  }

  public asObject(): EffectPresetValues {
    const res: EffectPresetValues = {
      id: this.id,
      name: this.name,
      bpmSync: this.bpmSync,
      mix: this.mix,
      parameters: [...this.parameters],
    }

    return res
  }

  public getJSON(): string {
    return JSON.stringify(this.asObject())
  }
}
