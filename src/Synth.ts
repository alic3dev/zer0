import { Oscillator } from './Oscillator'
import { SynthPreset, SynthPresetValues } from './SynthPreset'

const PRESET_LOCAL_STORAGE_PREFIX: string = 'ゼロ：プレセト：'

export class Synth {
  readonly audioContext: AudioContext
  readonly output: AudioNode
  readonly gain: GainNode
  readonly oscillators: Oscillator[] = []
  readonly frequencyConstantSourceNode: ConstantSourceNode

  #status: 'configured' | 'configuring' = 'configuring'

  static readonly defaults: {
    syncBPM: boolean
    bpm: number
    hold: number
    portamento: number
    gainCurve: number[]
    name: string
  } = {
    syncBPM: true,
    bpm: 90,
    hold: 0.9,
    portamento: 0,
    gainCurve: [0, 1, 1, 0.75, 0.25, 0],
    name: 'Basic',
  }

  #syncBPM: boolean = Synth.defaults.syncBPM
  #bpm: number = Synth.defaults.bpm
  #hold: number = Synth.defaults.hold
  #portamento: number = Synth.defaults.portamento
  #gainCurve: number[] = Synth.defaults.gainCurve
  name: string = Synth.defaults.name

  #preset: SynthPreset
  #getDefaultPreset(): SynthPresetValues {
    return {
      name: this.name,
      gain: {
        initial: 0,
        curve: this.#gainCurve,
      },
      bpm: this.#bpm,
      hold: this.#hold,
      portamento: this.#portamento,
      oscillators: [{ type: 'sine' }],
    }
  }

  constructor(
    audioContext: AudioContext,
    name?: string,
    output: AudioNode = audioContext.destination,
  ) {
    this.#status = 'configuring'
    this.name = name ?? this.name
    this.audioContext = audioContext
    this.output = output
    this.gain = audioContext.createGain()
    this.gain.gain.value = 0
    this.gain.connect(this.output)

    // FIXME: Shouldn't load/save presets unless name is explicitly set, something like that
    const savedPreset = window.localStorage.getItem(
      `${PRESET_LOCAL_STORAGE_PREFIX}${this.name}`,
    )

    if (savedPreset) {
      try {
        this.#preset = new SynthPreset(JSON.parse(savedPreset))
      } catch {
        window.localStorage.removeItem(
          `${PRESET_LOCAL_STORAGE_PREFIX}${this.name}`,
        )

        this.#preset = new SynthPreset(this.#getDefaultPreset())
      }
    } else {
      this.#preset = new SynthPreset(this.#getDefaultPreset())
    }

    this.frequencyConstantSourceNode = audioContext.createConstantSource()
    this.frequencyConstantSourceNode.offset.value = 440

    this.#configure()

    this.frequencyConstantSourceNode.start()

    this.#status = 'configured'
  }

  getBPM(): number {
    return this.#bpm
  }

  setBPM(bpm: number = 90): void {
    this.#bpm = bpm

    if (this.#status === 'configured') {
      this.#preset.bpm = this.#bpm
      this.savePreset()
    }
  }

  getBPMSync(): boolean {
    return this.#syncBPM
  }

  setBPMSync(syncBPM: boolean): void {
    this.#syncBPM = syncBPM

    if (this.#status === 'configured') {
      this.#preset.bpm = this.#syncBPM ? this.#bpm || true : false
      this.savePreset()
    }
  }

  getHold(): number {
    return this.#hold
  }

  setHold(hold: number) {
    this.#hold = hold

    if (this.#status === 'configured') {
      this.#preset.hold = this.#hold
      this.savePreset()
    }
  }

  getPortamento(): number {
    return this.#portamento
  }

  setPortamento(portamento: number) {
    this.#portamento = portamento

    if (this.#status === 'configured') {
      this.#preset.portamento = this.#portamento
      this.savePreset()
    }
  }

  getGainCurve(): number[] {
    return this.#gainCurve
  }

  setGainCurve(gainCurve: number[]) {
    this.#gainCurve = gainCurve

    if (this.#status === 'configured') {
      this.#preset.gain.curve = this.#gainCurve
      this.savePreset()
    }
  }

  modifyOscillator(
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
      this.#preset.oscillators[oscillatorIndex].type = action.type
    }

    if (Object.hasOwnProperty.call(action, 'volume')) {
      this.oscillators[oscillatorIndex].gain.gain.value = action.volume!
      this.#preset.oscillators[oscillatorIndex].volume = action.volume
    }

    if (Object.hasOwnProperty.call(action, 'offset')) {
      this.oscillators[oscillatorIndex].frequency.value = action.offset!
      this.#preset.oscillators[oscillatorIndex].offset = action.offset
    }

    this.savePreset()
  }

  removeOscillator(oscillatorOrIndex: Oscillator | number): void {
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

    if (this.#status === 'configured') {
      this.#preset.oscillators.splice(oscillatorToRemoveIndex, 1)
      this.savePreset()
    }
  }

  addOscillator(
    type: OscillatorType = 'sine',
    volume = 1.0,
    offset = 0.0,
  ): void {
    const oscillator = new Oscillator(
      this.audioContext,
      { type, volume, offset },
      this.gain,
    )

    this.frequencyConstantSourceNode.connect(oscillator.frequency)

    this.oscillators.push(oscillator)

    if (this.#status === 'configured') {
      this.#preset.oscillators.push({ type, volume, offset })
      this.savePreset()
    }
  }

  playNote(frequency: number, offset: number = 0, duration: number = 1): void {
    const timeToPlay: number =
      this.audioContext.currentTime + offset * (60 / this.#bpm)

    this.frequencyConstantSourceNode.offset.cancelScheduledValues(timeToPlay)
    this.frequencyConstantSourceNode.offset.setTargetAtTime(
      frequency,
      timeToPlay,
      ((60 * this.#portamento) / this.#bpm) * duration,
    )

    this.gain.gain.cancelScheduledValues(timeToPlay)
    this.gain.gain.setValueCurveAtTime(
      this.#gainCurve,
      timeToPlay,
      ((60 * this.#hold) / this.#bpm) * duration,
    )
  }

  #configure(): void {
    this.#status = 'configuring'

    if (this.#preset.gain.initial) {
      this.gain.gain.value = this.#preset.gain.initial
    }

    if (this.#preset.gain.curve) {
      this.#gainCurve = this.#preset.gain.curve
    }

    if (typeof this.#preset.bpm === 'number') {
      this.setBPM(this.#preset.bpm)
      this.setBPMSync(true)
    } else {
      this.setBPMSync(this.#preset.bpm)
    }

    for (const oscillator of this.#preset.oscillators) {
      this.addOscillator(oscillator.type, oscillator.volume, oscillator.offset)
    }

    this.#hold = this.#preset.hold
    this.#portamento = this.#preset.portamento

    this.#status = 'configured'
  }

  #savePresetDeferHandler?: number
  savePreset(): void {
    if (this.#savePresetDeferHandler) {
      clearTimeout(this.#savePresetDeferHandler)
      this.#savePresetDeferHandler = undefined
    }

    this.#savePresetDeferHandler = window.setTimeout(
      (): void =>
        window.localStorage.setItem(
          `${PRESET_LOCAL_STORAGE_PREFIX}${this.name}`,
          this.#preset.getJSON(),
        ),
      100,
    )
  }

  #loadFromPreset(preset: SynthPreset): void {
    this.#status = 'configuring'

    if (preset === this.#preset) throw new Error('Preset already loaded')

    this.#preset = preset

    this.#configure()

    this.#status = 'configured'
  }
}
