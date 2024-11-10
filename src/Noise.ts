export class Noise {
  private readonly audioContext: AudioContext
  private readonly output: AudioNode

  constructor(
    audioContext: AudioContext,
    output: AudioNode = audioContext.destination,
  ) {
    this.audioContext = audioContext
    this.output = output

    const myArrayBuffer: AudioBuffer = this.audioContext.createBuffer(
      2,
      this.audioContext.sampleRate * 3,
      this.audioContext.sampleRate,
    )

    for (
      let channel: number = 0;
      channel < myArrayBuffer.numberOfChannels;
      channel++
    ) {
      const nowBuffering: Float32Array = myArrayBuffer.getChannelData(channel)

      for (let i: number = 0; i < nowBuffering.length; i++) {
        nowBuffering[i] = Math.sin((i + 1) * 0.6527772545814514)
      }
    }

    const source: AudioBufferSourceNode = new AudioBufferSourceNode(
      this.audioContext,
      { buffer: myArrayBuffer, loop: true, playbackRate: 0.00669 },
    )
    source.connect(this.output)
    source.start()
  }
}
