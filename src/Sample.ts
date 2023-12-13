export class Sample {
  readonly #audioContext: AudioContext
  readonly #output: AudioNode
  readonly #gain: GainNode

  #url?: RequestInfo | URL

  #ready?: boolean = false
  #onReadyCallback?: () => void
  #sampleAudioBuffer?: AudioBuffer

  constructor(
    audioContext: AudioContext,
    sampleInput?: RequestInfo | URL,
    output: AudioNode = audioContext.destination,
  ) {
    this.#audioContext = audioContext
    this.#output = output

    this.#gain = this.#audioContext.createGain()
    this.#gain.gain.value = 1
    this.#gain.connect(this.#output)

    if (sampleInput) this.#fetchSample(sampleInput)
  }

  getUrl(): RequestInfo | URL | undefined {
    return this.#url
  }

  async setUrl(url: RequestInfo | URL): Promise<void> {
    return await this.#fetchSample(url)
  }

  async #fetchSample(input: RequestInfo | URL): Promise<void> {
    const res = await fetch(input)
    const arrayBuffer = await res.arrayBuffer()

    this.#sampleAudioBuffer = await this.#audioContext.decodeAudioData(
      arrayBuffer,
    )

    this.#url = input
    this.#ready = true

    if (this.#onReadyCallback) this.#onReadyCallback()
  }

  isReady() {
    return this.#ready
  }

  onReady(onReadyCallback: () => void) {
    this.#onReadyCallback = onReadyCallback
  }

  play(gain = 1.0) {
    if (!this.#sampleAudioBuffer) {
      throw new Error('Sample not buffered')
    }

    this.#gain.gain.value = gain

    const source = this.#audioContext.createBufferSource()
    source.buffer = this.#sampleAudioBuffer
    source.connect(this.#gain)
    source.start()
  }
}
