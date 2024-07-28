import type { UUID } from 'crypto'

type AutomatableParameterTypes = 'number' | 'boolean'
type AutomatableParameterControl = 'default' | 'slider'

type AutomatableParameterGetValue<T = unknown> = () => T
type AutomatableParameterSetValue<T = unknown> = (value: T) => void

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class AutomatableParameter<T = any> {
  public id: UUID
  public name: string

  public readonly type: AutomatableParameterTypes
  public readonly control: AutomatableParameterControl

  public readonly getValue: AutomatableParameterGetValue<T>
  public readonly setValue: AutomatableParameterSetValue<T>

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
    getValue: AutomatableParameterGetValue<T>
    setValue: AutomatableParameterSetValue<T>
  }) {
    this.id = id
    this.name = name
    this.type = type
    this.control = control

    this.getValue = getValue
    this.setValue = setValue
  }
}
