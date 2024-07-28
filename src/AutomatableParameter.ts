import type { UUID } from 'crypto'

type AutomatableParameterTypes = 'number' | 'boolean'
type AutomatableParameterControl = 'default' | 'slider'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class AutomatableParameter<T = any> {
  public id: UUID
  public name: string

  public readonly type: AutomatableParameterTypes
  public readonly control: AutomatableParameterControl

  public readonly getValue: () => T
  public readonly setValue: (value: T) => void

  constructor({
    id = crypto.randomUUID(),
    name,
    type = 'number',
    control = 'default',

    getValue,
    setValue,
  }: {
    id?: UUID
    name: string
    type?: AutomatableParameterTypes
    control?: AutomatableParameterControl
    getValue: () => T
    setValue: (value: T) => void
  }) {
    this.id = id
    this.name = name
    this.type = type
    this.control = control

    this.getValue = getValue
    this.setValue = setValue
  }
}
