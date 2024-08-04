import type { UUID } from 'crypto'

import type { Channel } from './Channel'
import type { SynthPresetValues } from './SynthPreset'

import { BPMSync } from './BPMSync'
import { EffectChain } from './EffectChain'
import { Oscillator } from './Oscillator'
import { SynthPreset } from './SynthPreset'

export class Synth {
  static baseName: string = 'Basic Synth'
  static readonly defaults: {
    syncBPM: boolean
    bpm: number
    hold: number
    portamento: number
    gainCurve: readonly number[]
    name: string
    polyphony: number
    shouldSave: boolean
  } = Object.freeze({
    syncBPM: true,
    bpm: 270,
    hold: 0.9,
    portamento: 0,
    gainCurve: Object.freeze([0, 1, 1, 0.75, 0.25, 0]),
    name: Synth.baseName,
    polyphony: 1,
    shouldSave: true,
  })
  static readonly localStorageKeyPrefix: string = 'ゼロ：Synth：'

  private readonly audioContext: AudioContext
  private channel?: Channel
  private output: AudioNode
  private status: 'configured' | 'configuring' = 'configuring'

  private hold: number = Synth.defaults.hold
  // TODO: Add Attack Decay Sustain Release (Per OSC?)
  private portamento: number = Synth.defaults.portamento
  private gainCurve: number[] = [...Synth.defaults.gainCurve]
  private polyphony: number = Synth.defaults.polyphony

  private shouldSave: boolean = Synth.defaults.shouldSave
  private readonly preset: SynthPreset

  private readonly frequencyConstantSourceNode: ConstantSourceNode

  public name: string
  public id: UUID

  public readonly effectChain: EffectChain

  public readonly BPMSync: BPMSync = new BPMSync({
    bpm: Synth.defaults.bpm,
    sync: Synth.defaults.syncBPM,

    onBPMChange: this.onBPMChange.bind(this),
    onSyncChange: this.onBPMSyncChange.bind(this),
  })

  public readonly gain: GainNode
  public readonly oscillators: Oscillator[] = []

  constructor({
    audioContext,
    id,
    name,
    channel,
    output,
    savedPreset,
    shouldSave = true,
  }: {
    audioContext: AudioContext
    id?: UUID
    name?: string
    channel?: Channel
    output?: AudioNode
    savedPreset?: SynthPresetValues
    shouldSave?: boolean
  }) {
    this.status = 'configuring'
    this.id = id ?? crypto.randomUUID()
    this.name = name ?? Synth.defaults.name
    this.audioContext = audioContext
    this.channel = channel

    if (output) {
      this.output = output
    } else if (this.channel) {
      this.output = this.channel.destination
    } else {
      this.output = this.audioContext.destination
    }

    this.gain = new GainNode(this.audioContext, { gain: 0 })
    this.gain.connect(this.output)

    this.effectChain = new EffectChain({
      audioContext,
      BPMSync: this.BPMSync,
      output: this.gain,
    })

    this.shouldSave = shouldSave

    if (savedPreset) {
      try {
        this.preset = new SynthPreset(savedPreset)
      } catch {
        this.preset = new SynthPreset(this.getDefaultPreset())
      }
    } else {
      this.preset = new SynthPreset(this.getDefaultPreset())
    }

    this.frequencyConstantSourceNode = new ConstantSourceNode(audioContext, {
      offset: 440,
    })

    this.configure()

    this.frequencyConstantSourceNode.start()

    this.savePreset(false)
  }

  private configure(): void {
    this.status = 'configuring'

    this.id = this.preset.id
    this.name = this.preset.name

    if (this.preset.gain.initial) {
      this.gain.gain.value = this.preset.gain.initial
    }

    if (this.preset.gain.curve) {
      this.gainCurve = this.preset.gain.curve
    }

    this.BPMSync.setBPM(this.preset.bpm)
    this.BPMSync.setSync(this.preset.bpmSync)

    for (const oscillator of this.preset.oscillators) {
      this.addOscillator(oscillator.type, oscillator.volume, oscillator.offset)
    }

    this.hold = this.preset.hold
    this.portamento = this.preset.portamento

    this.status = 'configured'
  }

  private getDefaultPreset(): SynthPresetValues {
    return {
      id: this.id,
      name: this.name,
      gain: {
        initial: 0,
        curve: this.gainCurve,
      },
      bpm: this.BPMSync.getBPM(),
      bpmSync: this.BPMSync.getSync(),
      hold: this.hold,
      portamento: this.portamento,
      oscillators: [{ type: 'sine' }],
      channelId: this.channel?.id,
    }
  }

  private savePresetDeferHandler?: number
  private savePreset(defer: boolean = true): void {
    if (!this.shouldSave) return

    if (this.savePresetDeferHandler) {
      clearTimeout(this.savePresetDeferHandler)
      this.savePresetDeferHandler = undefined
    }

    const save = (): void => {
      window.localStorage.setItem(
        `${Synth.localStorageKeyPrefix}${this.id}`,
        this.preset.getJSON(),
      )
    }

    if (defer) {
      this.savePresetDeferHandler = window.setTimeout(save, 100)
    } else {
      save()
    }
  }

  private onBPMChange(): void {
    if (this.status === 'configured') {
      this.preset.bpm = this.BPMSync.getBPM()
      this.savePreset()
    }
  }

  private onBPMSyncChange(): void {
    if (this.status === 'configured') {
      this.preset.bpmSync = this.BPMSync.getSync()
      this.savePreset()
    }
  }

  public setOutput(output: AudioNode) {
    this.gain.disconnect(this.output)
    this.output = output
    this.gain.connect(this.output)
  }

  public getChannel(): Channel | undefined {
    return this.channel
  }

  public setChannel(channel: Channel) {
    this.channel = channel
    this.setOutput(this.channel.destination)

    if (this.status === 'configured') {
      this.preset.channelId = this.channel.id
      this.savePreset()
    }
  }

  public getPolyphony(): number {
    return this.polyphony
  }

  public getHold(): number {
    return this.hold
  }

  public setHold(hold: number) {
    this.hold = hold

    if (this.status === 'configured') {
      this.preset.hold = this.hold
      this.savePreset()
    }
  }

  public getPortamento(): number {
    return this.portamento
  }

  public setPortamento(portamento: number) {
    this.portamento = portamento

    if (this.status === 'configured') {
      this.preset.portamento = this.portamento
      this.savePreset()
    }
  }

  public getGainCurve(): number[] {
    return this.gainCurve
  }

  public setGainCurve(gainCurve: number[]) {
    this.gainCurve = gainCurve

    if (this.status === 'configured') {
      this.preset.gain.curve = this.gainCurve
      this.savePreset()
    }
  }

  public modifyOscillator(
    oscillatorOrIndex: Oscillator | number,
    action: { type?: OscillatorType; volume?: number; offset?: number },
  ): void {
    const oscillatorIndex = this.oscillators.findIndex(
      (oscillator, oscillatorIndex) =>
        oscillator === oscillatorOrIndex ||
        oscillatorIndex === oscillatorOrIndex,
    )

    if (oscillatorIndex === -1) return

    if (action.type) {
      this.oscillators[oscillatorIndex].type = action.type
      this.preset.oscillators[oscillatorIndex].type = action.type
    }

    if (Object.hasOwnProperty.call(action, 'volume')) {
      this.oscillators[oscillatorIndex].gain.gain.value = action.volume!
      this.preset.oscillators[oscillatorIndex].volume = action.volume
    }

    if (Object.hasOwnProperty.call(action, 'offset')) {
      this.oscillators[oscillatorIndex].frequency.value = action.offset!
      this.preset.oscillators[oscillatorIndex].offset = action.offset
    }

    this.savePreset()
  }

  public removeOscillator(oscillatorOrIndex: Oscillator | number): void {
    const oscillatorToRemoveIndex = this.oscillators.findIndex(
      (oscillator, oscillatorIndex) =>
        oscillator === oscillatorOrIndex ||
        oscillatorIndex === oscillatorOrIndex,
    )

    if (oscillatorToRemoveIndex === -1) return

    this.frequencyConstantSourceNode.disconnect(
      this.oscillators[oscillatorToRemoveIndex].frequency,
    )
    this.oscillators[oscillatorToRemoveIndex].stop()

    this.oscillators.splice(oscillatorToRemoveIndex, 1)

    if (this.status === 'configured') {
      this.preset.oscillators.splice(oscillatorToRemoveIndex, 1)
      this.savePreset()
    }
  }

  public addOscillator(
    type: OscillatorType = 'sine',
    volume = 1.0,
    offset = 0.0,
  ): void {
    const oscillator = new Oscillator(
      this.audioContext,
      { type, volume, offset },
      this.effectChain.destination,
    )

    this.frequencyConstantSourceNode.connect(oscillator.frequency)

    this.oscillators.push(oscillator)

    if (this.status === 'configured') {
      this.preset.oscillators.push({ type, volume, offset })
      this.savePreset()
    }
  }

  public playNote(
    frequency: number,
    offset: number = 0,
    duration: number = 1,
  ): void {
    const timeToPlay: number =
      this.audioContext.currentTime +
      offset * (60 / this.BPMSync.getUsableBPM())

    this.frequencyConstantSourceNode.offset.cancelScheduledValues(timeToPlay)
    this.frequencyConstantSourceNode.offset.setTargetAtTime(
      frequency,
      timeToPlay,
      ((60 * this.portamento) / this.BPMSync.getUsableBPM()) * duration,
    )

    this.gain.gain.cancelScheduledValues(timeToPlay)
    this.gain.gain.setValueCurveAtTime(
      this.gainCurve,
      timeToPlay,
      ((60 * this.hold) / this.BPMSync.getUsableBPM()) * duration,
    )
  }

  public getPresetJSON(): string {
    return this.preset.getJSON()
  }
}
