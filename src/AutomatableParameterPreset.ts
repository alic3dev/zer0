import type { UUID } from 'crypto'

export interface AutomatableParameterPresetValues {
  id: UUID
  name: string
}

export class AutomatableParameterPreset
  implements AutomatableParameterPresetValues
{
  public id: AutomatableParameterPresetValues['id']
  public name: AutomatableParameterPresetValues['name']

  static readonly defaultPresetValues: Readonly<AutomatableParameterPresetValues> =
    Object.freeze({
      id: crypto.randomUUID(),
      name: 'Automatable Parameter',
    })

  constructor(preset: Partial<AutomatableParameterPresetValues> = {}) {
    const _preset: AutomatableParameterPresetValues = {
      ...AutomatableParameterPreset.getDefaultPresetValues(),
      ...preset,
    }

    this.id = _preset.id
    this.name = _preset.name
  }

  private static getDefaultPresetValues(): AutomatableParameterPresetValues {
    return {
      ...AutomatableParameterPreset.defaultPresetValues,
      id: crypto.randomUUID(),
    }
  }
}
