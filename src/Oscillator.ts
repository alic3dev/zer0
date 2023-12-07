export class Oscillator {
  readonly #audioContext: AudioContext;
  readonly #output: AudioNode;
  readonly #gain: GainNode;
  readonly #oscillator: OscillatorNode;

  #type: OscillatorType;

  constructor(
    audioContext: AudioContext,
    {
      type = "sine",
      volume = 1.0,
      offset = 0.0,
    }: { type: OscillatorType; volume: number; offset: number },
    output: AudioNode = audioContext.destination
  ) {
    this.#audioContext = audioContext;
    this.#type = type;
    this.#output = output;

    this.#gain = this.#audioContext.createGain();
    this.#gain.gain.value = volume;
    this.#gain.connect(this.#output);

    this.#oscillator = this.#audioContext.createOscillator();
    this.#oscillator.type = this.#type;
    this.#oscillator.frequency.value = offset;

    this.#oscillator.connect(this.#gain);
    this.#oscillator.start();
  }

  get type(): OscillatorType {
    return this.#type;
  }

  set type(type: OscillatorType) {
    this.#type = type;

    this.#oscillator.type = this.#type;
  }

  get gain(): GainNode {
    return this.#gain;
  }

  get frequency(): AudioParam {
    return this.#oscillator.frequency;
  }

  stop(when?: number): void {
    return this.#oscillator.stop(when);
  }
}
