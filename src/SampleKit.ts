import { Sample } from "./Sample";

export interface SampleOptions {
  input: RequestInfo | URL;
  gain?: number;
  output?: AudioNode;
}

export class SampleKit {
  #audioContext: AudioContext;
  #output: AudioNode;
  #samples: Record<any, Sample>;

  constructor(
    audioContext: AudioContext,
    samples: Record<any, RequestInfo | URL | SampleOptions>,
    output: AudioNode = audioContext.destination
  ) {
    this.#audioContext = audioContext;
    this.#output = output;

    this.#samples = {};

    for (let sampleKey in samples) {
      const sample = samples[sampleKey];

      if (
        typeof sample === "string" ||
        sample instanceof Request ||
        sample instanceof URL
      ) {
        this.#samples[sampleKey] = new Sample(
          this.#audioContext,
          sample,
          this.#output
        );
      } else if (typeof sample.gain === "number" && sample.gain !== 1.0) {
        const sampleGain = audioContext.createGain();
        sampleGain.gain.value = sample.gain;
        sampleGain.connect(sample.output ?? this.#output);

        this.#samples[sampleKey] = new Sample(
          this.#audioContext,
          sample.input,
          sampleGain
        );
      } else {
        this.#samples[sampleKey] = new Sample(
          this.#audioContext,
          sample.input,
          sample.output ?? this.#output
        );
      }
    }
  }

  play(...sampleKeys: any): void {
    for (let sampleKey of sampleKeys) {
      const sample: Sample =
        this.#samples[sampleKey.name] ?? this.#samples[sampleKey];

      if (!sample) throw new Error("Unknown sample key");

      sample.play(sampleKey.gain);
    }
  }
}
