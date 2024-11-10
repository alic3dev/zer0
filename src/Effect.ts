import type { UUID } from 'crypto'

import type { EffectParameter, EffectPresetValues } from 'EffectPreset'

import { AutomatableParameter } from './AutomatableParameter'
import { BPMSync } from './BPMSync'
import { EffectPreset } from './EffectPreset'

export abstract class Effect {
  static baseName: string = 'Effect'
  static id: UUID = 'b4587775-fe5b-454e-9fc8-7f958e1d481b'
  static readonly localStorageKeyPrefix: string = 'ゼロ：Effect：'

  public id: UUID
  public name: string

  public readonly audioContext: AudioContext
  public readonly destination: AudioNode
  public readonly BPMSync: BPMSync = new BPMSync({})
  public readonly parameters: AutomatableParameter[] = []

  protected output: AudioNode
  protected readonly dryGainNode: GainNode
  protected readonly wetGainNode: GainNode
  protected mix: number = 1 / 3

  protected shouldSave: boolean = true
  protected readonly preset: EffectPreset

  constructor({
    audioContext,
    id = crypto.randomUUID(),
    name = 'Effect',
    output = audioContext.destination,
    shouldSave = true,
    savedPreset,
  }: {
    audioContext: AudioContext
    id?: UUID
    name?: string
    output?: AudioNode
    shouldSave?: boolean
    savedPreset?: EffectPreset
  }) {
    this.audioContext = audioContext

    this.id = id
    this.name = name

    this.destination = new GainNode(audioContext)
    this.output = output

    this.dryGainNode = new GainNode(this.audioContext, { gain: 1 - this.mix })
    this.wetGainNode = new GainNode(this.audioContext, { gain: this.mix })

    this.destination.connect(this.dryGainNode)
    this.dryGainNode.connect(this.output)
    this.wetGainNode.connect(this.output)

    this.parameters.push(
      new AutomatableParameter<boolean>({
        name: 'BPM Sync',
        type: 'boolean',
        getValue: (): boolean => this.BPMSync.getSync(),
        setValue: (sync: boolean): void => {
          this.BPMSync.setSync(sync)

          this.savePreset()
        },
      }),
      new AutomatableParameter<number>({
        name: 'Mix',
        control: 'slider',
        getValue: (): number => this.mix,
        setValue: (mix: number): void => {
          this.mix = mix

          this.dryGainNode.gain.value = 1 - this.mix
          this.wetGainNode.gain.value = this.mix

          this.savePreset()
        },
      }),
    )

    this.shouldSave = shouldSave

    if (savedPreset) {
      try {
        this.preset = new EffectPreset(savedPreset)
      } catch {
        this.preset = new EffectPreset(this.getDefaultPreset())
      }
    } else {
      this.preset = new EffectPreset(this.getDefaultPreset())
    }
  }

  public connect(output: AudioNode | Effect): void {
    this.dryGainNode.disconnect(this.output)
    this.wetGainNode.disconnect(this.output)

    if (output instanceof AudioNode) {
      this.output = output
    } else {
      this.output = output.destination
    }

    this.dryGainNode.connect(this.output)
    this.wetGainNode.connect(this.output)
  }

  public getPresetJSON(): string {
    return this.preset.getJSON()
  }

  private savePresetDeferHandler?: number
  private savePreset(defer = true): void {
    if (!this.shouldSave) return

    if (this.savePresetDeferHandler) {
      clearTimeout(this.savePresetDeferHandler)
      this.savePresetDeferHandler = undefined
    }

    const save = (): void => {
      window.localStorage.setItem(
        `${Effect.localStorageKeyPrefix}${this.id}`,
        this.preset.getJSON(),
      )
    }

    if (defer) {
      this.savePresetDeferHandler = window.setTimeout(save, 100)
    } else {
      save()
    }
  }

  private getDefaultPreset(): EffectPresetValues {
    return {
      id: this.id,
      name: this.name,
      bpmSync: this.BPMSync.getSync(),
      mix: this.mix,
      parameters: this.parameters.map(
        (parameter: AutomatableParameter): EffectParameter => {
          return {
            name: parameter.name,
            value: parameter.getValue(),
          }
        },
      ),
    }
  }
}
