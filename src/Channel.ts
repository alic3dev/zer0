import { Effect } from './Effect'

export class Channel {
  readonly audioContext: AudioContext
  readonly output: AudioNode
  readonly gain: GainNode
  readonly analyser: AnalyserNode
  readonly destination: AudioNode

  #effectChain: Effect[] = []

  readonly #FFT_SIZE: number = 2048
  readonly #ANALYSER_BUFFER_LENGTH: number
  readonly #ANALYSER_DATA_ARRAY: Uint8Array

  public id: string = crypto.randomUUID()
  public name: string = 'Channel'

  constructor({
    id,
    name,
    audioContext,
    output = audioContext.destination,
    withAnalyser = true,
  }: {
    id?: string
    name?: string
    audioContext: AudioContext
    output?: AudioNode
    withAnalyser?: boolean
  }) {
    if (id) {
      this.id = id
    }

    if (name) {
      this.name = name
    }

    this.audioContext = audioContext
    this.output = output

    this.gain = this.audioContext.createGain()

    this.analyser = this.audioContext.createAnalyser()
    this.analyser.fftSize = this.#FFT_SIZE

    if (withAnalyser) {
      this.#ANALYSER_BUFFER_LENGTH = this.analyser.frequencyBinCount
      this.#ANALYSER_DATA_ARRAY = new Uint8Array(this.#ANALYSER_BUFFER_LENGTH)

      this.analyser.connect(this.output)
      this.gain.connect(this.analyser)
    } else {
      this.#ANALYSER_BUFFER_LENGTH = 0
      this.#ANALYSER_DATA_ARRAY = new Uint8Array(0)

      this.gain.connect(this.output)

      this.pollAnalyser = (): Uint8Array => this.#ANALYSER_DATA_ARRAY
    }

    this.destination = this.gain
  }

  getEffectChain(): readonly Effect[] {
    return Object.freeze([...this.#effectChain])
  }

  addEffect(effect: Effect | typeof Effect) {
    if (effect instanceof Effect) this.#effectChain.push(effect)
    // else this.#effectChain.push(new effect(this.audioContext))
  }

  // moveEffect(effect: Effect, position: number | 'up' | 'down') {
  //   const effectIndex = this.#effectChain.findIndex(chainedEffect => chainedEffect === effect);
  //   this.#effectChain = []
  // }

  removeEffect(effect: Effect) {
    const effectIndex = this.#effectChain.findIndex(
      (chainedEffect) => chainedEffect === effect,
    )

    if (effectIndex === -1) throw new Error("Can't find effect to remove")

    this.#effectChain.splice(effectIndex, 1)
  }

  pollAnalyser(): Uint8Array {
    this.analyser.getByteTimeDomainData(this.#ANALYSER_DATA_ARRAY)

    return this.#ANALYSER_DATA_ARRAY
  }
}
