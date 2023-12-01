export class Channel {
  audioContext: AudioContext;
  output: AudioNode;
  gain: GainNode;

  constructor(
    audioContext: AudioContext,
    output: AudioNode = audioContext.destination
  ) {
    this.audioContext = audioContext;
    this.output = output;
    this.gain = this.audioContext.createGain();
    this.gain.connect(this.output);
  }
}
