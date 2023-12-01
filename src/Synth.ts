export class Synth {
  audioContext: AudioContext;
  output: AudioNode;
  gain: GainNode;
  oscilators: OscillatorNode[] = [];
  frequencyConstantSourceNode: ConstantSourceNode;
  name: string = "Basic";

  constructor(
    audioContext: AudioContext,
    output: AudioNode = audioContext.destination
  ) {
    this.audioContext = audioContext;
    this.output = output;
    this.gain = audioContext.createGain();
    this.gain.gain.value = 0;
    this.gain.connect(this.output);

    // Synth -> E1 -> E2 -> E3 -> Gain -> Output

    // for (let i = this.effects.length - 1; i >= 0; i--) {
    //   if (i === effects.length - 1) {
    //     this.effects[i].connect(this.gain);
    //   } else {
    //     this.effects[i].connect(this.effects[i + 1].input);
    //   }
    // }

    this.frequencyConstantSourceNode = audioContext.createConstantSource();
    this.frequencyConstantSourceNode.offset.value = 440;

    this.addOscillator("sine");

    // this.addOscillator("sine", 1.0, 6.666);
    // this.addOscillator("triangle", 0.66);
    // this.addOscillator("square", 0.4);

    // this.addOscillator("sine", 0.82, 0.04);
    // this.addOscillator("square", 0.1, -0.3);
    // this.addOscillator("sine", 0.8, 0.125);

    this.frequencyConstantSourceNode.start();
  }

  addOscillator(type: OscillatorType = "sine", volume = 1.0, offset = 0.0) {
    // const oscillator = new Oscilator(this.audioContext, type, this.output);
    // oscillator.connect(this.effects.length ? this.effects[0] : this.gain);
    const oscillator = this.audioContext.createOscillator();
    oscillator.type = type;

    if (volume === 1.0) {
      oscillator.connect(this.gain);
    } else {
      const oscillatorGain = this.audioContext.createGain();
      oscillatorGain.gain.value = volume;
      oscillatorGain.connect(this.gain);
      oscillator.connect(oscillatorGain);
    }

    oscillator.frequency.value = offset;

    this.frequencyConstantSourceNode.connect(oscillator.frequency);

    oscillator.start();

    this.oscilators.push(oscillator);
  }

  playNote(frequency: number) {
    // this.frequencyConstantSourceNode.offset.value = frequency;
    this.frequencyConstantSourceNode.offset.cancelScheduledValues(
      this.audioContext.currentTime
    );
    this.frequencyConstantSourceNode.offset.exponentialRampToValueAtTime(
      frequency,
      this.audioContext.currentTime + 0.01
    );

    this.gain.gain.cancelScheduledValues(this.audioContext.currentTime);
    this.gain.gain.setValueCurveAtTime(
      [0.5, 1, 1, 0.75, 0.5],
      this.audioContext.currentTime,
      0.1
    );
    // this.gain.gain.value = 1;
    // this.gain.gain.linearRampToValueAtTime(
    //   0,
    //   this.audioContext.currentTime + 1
    // );
  }
}
