export class Effect {
  readonly audioContext: AudioContext
  input: AudioNode

  output: AudioNode

  constructor(
    audioContext: AudioContext,
    input: AudioNode,
    output: AudioNode = audioContext.destination,
  ) {
    this.audioContext = audioContext
    this.input = input
    this.output = output
  }

  connect(output: AudioNode) {
    this.output = output
  }
}
