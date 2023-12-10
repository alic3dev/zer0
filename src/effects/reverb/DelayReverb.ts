import { Effect } from '../../Effect'

export class DelayReverb extends Effect {
  audioContext: AudioContext
  output: AudioNode
  input: AudioNode
  delayNode: DelayNode
  decayGainNode: GainNode
  dryGainNode: GainNode
  wetGainNode: GainNode
  delayTime: number = 60 / 270
  decayAmount: number = 1 / 16
  mix: number = 1 / 3

  constructor(
    audioContext: AudioContext,
    output: AudioNode = audioContext.destination,
  ) {
    super(audioContext, output)

    this.audioContext = audioContext
    this.output = output
    this.input = this.audioContext.createGain()

    this.delayNode = this.audioContext.createDelay()
    this.delayNode.delayTime.value = this.delayTime

    this.decayGainNode = this.audioContext.createGain()
    this.decayGainNode.gain.value = this.decayAmount

    this.dryGainNode = this.audioContext.createGain()
    this.dryGainNode.gain.value = 1 - this.mix
    this.wetGainNode = this.audioContext.createGain()
    this.wetGainNode.gain.value = this.mix

    this.dryGainNode.connect(this.output)
    this.input.connect(this.dryGainNode)

    this.input.connect(this.delayNode)
    this.delayNode.connect(this.wetGainNode)
    this.delayNode.connect(this.decayGainNode)
    this.decayGainNode.connect(this.delayNode)

    this.wetGainNode.connect(this.output)
  }
}
