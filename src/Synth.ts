import { SynthPreset, SynthPresetValues } from "./SynthPreset";

const PRESET_LOCAL_STORAGE_PREFIX: string = "ゼロ：プレセト：";

export class Synth {
  audioContext: AudioContext;
  output: AudioNode;
  gain: GainNode;
  oscillators: OscillatorNode[] = [];
  frequencyConstantSourceNode: ConstantSourceNode;
  #syncBPM: boolean = true;
  #bpm: number = 90;
  #hold: number = 0.9;
  #portamento: number = 0;
  #gainCurve: number[] = [0, 1, 1, 0.75, 0.25, 0];
  name: string = "Basic";

  #status: "configured" | "configuring" = "configuring";

  #preset: SynthPreset;
  #getDefaultPreset(): SynthPresetValues {
    return {
      name: this.name,
      gain: {
        initial: 0,
        curve: this.#gainCurve,
      },
      bpm: this.#bpm,
      hold: this.#hold,
      portamento: this.#portamento,
      oscillators: [{ type: "sine" }],
    };
  }

  constructor(
    audioContext: AudioContext,
    name?: string,
    output: AudioNode = audioContext.destination
  ) {
    this.#status = "configuring";
    this.name = name ?? this.name;
    this.audioContext = audioContext;
    this.output = output;
    this.gain = audioContext.createGain();
    this.gain.gain.value = 0;
    this.gain.connect(this.output);

    // FIXME: Shouldn't load/save presets unless name is explicitly set, something like that
    const savedPreset = window.localStorage.getItem(
      `${PRESET_LOCAL_STORAGE_PREFIX}${this.name}`
    );

    if (savedPreset) {
      try {
        this.#preset = new SynthPreset(JSON.parse(savedPreset));
      } catch {
        window.localStorage.removeItem(
          `${PRESET_LOCAL_STORAGE_PREFIX}${this.name}`
        );

        this.#preset = new SynthPreset(this.#getDefaultPreset());
      }
    } else {
      this.#preset = new SynthPreset(this.#getDefaultPreset());
    }

    this.frequencyConstantSourceNode = audioContext.createConstantSource();
    this.frequencyConstantSourceNode.offset.value = 440;

    this.#configure();

    this.frequencyConstantSourceNode.start();

    this.#status = "configured";
  }

  getBPM(): number {
    return this.#bpm;
  }

  setBPM(bpm: number = 90): void {
    this.#bpm = bpm;

    if (this.#status === "configured") {
      this.#preset.bpm = this.#bpm;
      this.savePreset();
    }
  }

  getBPMSync(): boolean {
    return this.#syncBPM;
  }

  setBPMSync(syncBPM: boolean): void {
    this.#syncBPM = syncBPM;

    if (this.#status === "configured") {
      this.#preset.bpm = this.#syncBPM ? this.#bpm || true : false;
      this.savePreset();
    }
  }

  getHold(): number {
    return this.#hold;
  }

  setHold(hold: number) {
    this.#hold = hold;

    if (this.#status === "configured") {
      this.#preset.hold = this.#hold;
      this.savePreset();
    }
  }

  getPortamento(): number {
    return this.#portamento;
  }

  setPortamento(portamento: number) {
    this.#portamento = portamento;

    if (this.#status === "configured") {
      this.#preset.portamento = this.#portamento;
      this.savePreset();
    }
  }

  getGainCurve(): number[] {
    return this.#gainCurve;
  }

  setGainCurve(gainCurve: number[]) {
    this.#gainCurve = gainCurve;

    if (this.#status === "configured") {
      this.#preset.gain.curve = this.#gainCurve;
      this.savePreset();
    }
  }

  addOscillator(
    type: OscillatorType = "sine",
    volume = 1.0,
    offset = 0.0
  ): void {
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

    this.oscillators.push(oscillator);

    if (this.#status === "configured") {
      this.#preset.oscillators.push({ type, volume, offset });
      this.savePreset();
    }
  }

  playNote(frequency: number): void {
    // this.frequencyConstantSourceNode.offset.value = frequency;
    this.frequencyConstantSourceNode.offset.cancelScheduledValues(
      this.audioContext.currentTime
    );
    this.frequencyConstantSourceNode.offset.exponentialRampToValueAtTime(
      frequency,
      this.audioContext.currentTime + 0.01 + this.#portamento
    );

    this.gain.gain.cancelScheduledValues(this.audioContext.currentTime);
    this.gain.gain.setValueCurveAtTime(
      this.#gainCurve,
      this.audioContext.currentTime,
      (60 * this.#hold) / this.#bpm
    );
    // this.gain.gain.value = 1;
    // this.gain.gain.linearRampToValueAtTime(
    //   0,
    //   this.audioContext.currentTime + 1
    // );
  }

  #configure(): void {
    this.#status = "configuring";

    if (this.#preset.gain.initial) {
      this.gain.gain.value = this.#preset.gain.initial;
    }

    if (this.#preset.gain.curve) {
      this.#gainCurve = this.#preset.gain.curve;
    }

    if (typeof this.#preset.bpm === "number") {
      this.setBPM(this.#preset.bpm);
      this.setBPMSync(true);
    } else {
      this.setBPMSync(this.#preset.bpm);
    }

    for (const oscillator of this.#preset.oscillators) {
      this.addOscillator(oscillator.type, oscillator.volume, oscillator.offset);
    }

    this.#hold = this.#preset.hold;
    this.#portamento = this.#preset.portamento;

    this.#status = "configured";
  }

  #savePresetDeferHandler?: number;
  savePreset(): void {
    if (this.#savePresetDeferHandler) {
      clearTimeout(this.#savePresetDeferHandler);
      this.#savePresetDeferHandler = undefined;
    }

    this.#savePresetDeferHandler = window.setTimeout(
      (): void =>
        window.localStorage.setItem(
          `${PRESET_LOCAL_STORAGE_PREFIX}${this.name}`,
          this.#preset.getJSON()
        ),
      100
    );
  }

  #loadFromPreset(preset: SynthPreset): void {
    this.#status = "configuring";

    if (preset === this.#preset) throw new Error("Preset already loaded");

    this.#preset = preset;

    this.#configure();

    this.#status = "configured";
  }
}
