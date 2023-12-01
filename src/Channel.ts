export class Channel {
  audioContext: AudioContext;
  output: AudioNode;
  gain: GainNode;
  analyser: AnalyserNode;
  // TODO: Add Effect Chain
  destination: AudioNode;

  #FFT_SIZE: number = 2048;
  #ANALYSER_BUFFER_LENGTH: number;
  #ANALYSER_DATA_ARRAY: Uint8Array;

  constructor(
    audioContext: AudioContext,
    output: AudioNode = audioContext.destination,
    withAnalyser: boolean = true
  ) {
    this.audioContext = audioContext;
    this.output = output;

    this.gain = this.audioContext.createGain();

    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = this.#FFT_SIZE;

    if (withAnalyser) {
      this.#ANALYSER_BUFFER_LENGTH = this.analyser.frequencyBinCount;
      this.#ANALYSER_DATA_ARRAY = new Uint8Array(this.#ANALYSER_BUFFER_LENGTH);

      this.analyser.connect(this.output);
      this.gain.connect(this.analyser);
    } else {
      this.#ANALYSER_BUFFER_LENGTH = 0;
      this.#ANALYSER_DATA_ARRAY = new Uint8Array(0);

      this.gain.connect(this.output);

      this.pollAnalyser = (): Uint8Array => this.#ANALYSER_DATA_ARRAY;
    }

    this.destination = this.gain;
  }

  pollAnalyser(): Uint8Array {
    this.analyser.getByteTimeDomainData(this.#ANALYSER_DATA_ARRAY);

    return this.#ANALYSER_DATA_ARRAY;
  }
}
