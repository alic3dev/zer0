export class Sample {
  private readonly audioContext: AudioContext
  private readonly gain: GainNode
  private output: AudioNode

  private url?: RequestInfo | URL

  private ready?: boolean = false
  private onReadyCallbacks: (() => void)[] = []
  private sampleAudioBuffer?: AudioBuffer

  constructor({
    audioContext,
    input,
    output = audioContext.destination,
  }: {
    audioContext: AudioContext
    input?: RequestInfo | URL
    output?: AudioNode
  }) {
    this.audioContext = audioContext
    this.output = output

    this.gain = new GainNode(this.audioContext, { gain: 1 })
    this.gain.connect(this.output)

    if (input) {
      this.fetchSample(input)
    }
  }

  public getOutput(): AudioNode {
    return this.output
  }

  public setOutput(output: AudioNode): void {
    this.gain.disconnect(this.output)
    this.output = output
    this.gain.connect(this.output)
  }

  public getUrl(): RequestInfo | URL | undefined {
    return this.url
  }

  public async setUrl(url: RequestInfo | URL): Promise<void> {
    return await this.fetchSample(url)
  }

  public async isReady(): Promise<void> {
    await new Promise<void>((resolve: () => void): void => {
      this.onReadyCallbacks.push(resolve)
    })
  }

  public isReadySync(): boolean {
    return this.ready ?? false
  }

  public onReady(onReadyCallback: () => void): void {
    this.onReadyCallbacks.push(onReadyCallback)
  }

  public play(offset: number = 0, gain: number = 1.0): void {
    if (!this.sampleAudioBuffer) {
      throw new Error('Sample not buffered')
    }

    const playAtTime: number = this.audioContext.currentTime + offset

    this.gain.gain.setValueAtTime(gain, playAtTime)

    const source: AudioBufferSourceNode = new AudioBufferSourceNode(
      this.audioContext,
      { buffer: this.sampleAudioBuffer },
    )
    source.connect(this.gain)
    source.start(playAtTime)
  }

  private async fetchSample(input: RequestInfo | URL): Promise<void> {
    this.url = input

    const res: Response = await fetch(input)
    const arrayBuffer: ArrayBuffer = await res.arrayBuffer()

    this.sampleAudioBuffer = await this.audioContext.decodeAudioData(
      arrayBuffer,
    )

    this.ready = true

    for (const cb of this.onReadyCallbacks) {
      cb()
    }

    this.onReadyCallbacks.splice(0)
  }
}
