import * as Tone from "tone";

export interface SynthWithPanner {
  synth: Tone.PolySynth<Tone.Synth>;
  panner: Tone.Panner;
}
