export class Sample {
  readonly #audioContext: AudioContext
  readonly #output: AudioNode
  readonly #gain: GainNode

  #url?: RequestInfo | URL

  #ready?: boolean = false
  #onReadyCallbacks: (() => void)[] = []
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

    for (const cb of this.#onReadyCallbacks) {
      cb()
    }

    this.#onReadyCallbacks.splice(0)
  }

  async isReady(): Promise<void> {
    await new Promise<void>((resolve) => this.#onReadyCallbacks.push(resolve))
  }

  isReadySync(): boolean {
    return this.#ready ?? false
  }

  onReady(onReadyCallback: () => void) {
    this.#onReadyCallbacks.push(onReadyCallback)
  }

  play(offset: number = 0, gain: number = 1.0): void {
    if (!this.#sampleAudioBuffer) {
      throw new Error('Sample not buffered')
    }

    const playAtTime = this.#audioContext.currentTime + offset

    this.#gain.gain.setValueAtTime(gain, playAtTime)

    const source = this.#audioContext.createBufferSource()
    source.buffer = this.#sampleAudioBuffer
    source.connect(this.#gain)
    source.start(playAtTime)
  }
}
