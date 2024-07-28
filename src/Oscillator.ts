export class Oscillator {
  private readonly audioContext: AudioContext
  private readonly output: AudioNode
  private readonly _gain: GainNode
  private readonly oscillator: OscillatorNode

  private _type: OscillatorType

  constructor(
    audioContext: AudioContext,
    {
      type = 'sine',
      volume = 1.0,
      offset = 0.0,
    }: { type: OscillatorType; volume: number; offset: number },
    output: AudioNode = audioContext.destination,
  ) {
    this.audioContext = audioContext
    this._type = type
    this.output = output

    this._gain = this.audioContext.createGain()
    this._gain.gain.value = volume
    this._gain.connect(this.output)

    this.oscillator = this.audioContext.createOscillator()
    this.oscillator.type = this._type
    this.oscillator.frequency.value = offset

    this.oscillator.connect(this._gain)
    this.oscillator.start()
  }

  public get type(): OscillatorType {
    return this._type
  }

  public set type(type: OscillatorType) {
    this._type = type

    this.oscillator.type = this._type
  }

  public get gain(): GainNode {
    return this._gain
  }

  public get frequency(): AudioParam {
    return this.oscillator.frequency
  }

  public stop(when?: number): void {
    return this.oscillator.stop(when)
  }
}
