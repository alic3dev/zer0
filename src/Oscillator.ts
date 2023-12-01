export class Oscillator {
  audioContext: AudioContext;
  output: AudioNode;
  gain: GainNode;
  type: OscillatorType;
  oscillator: OscillatorNode;

  constructor(
    audioContext: AudioContext,
    type: OscillatorType = "sine",
    output: AudioNode = audioContext.destination
  ) {
    this.audioContext = audioContext;
    this.type = type;
    this.output = output;
    this.gain = this.audioContext.createGain();
    this.gain.gain.value = 0;
    this.gain.connect(this.output);
    this.oscillator = this.audioContext.createOscillator();
    this.oscillator.type = this.type;
    this.oscillator.connect(this.gain);
    this.oscillator.start();
  }
}
