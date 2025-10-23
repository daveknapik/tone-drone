import * as Tone from "tone";

/**
 * A PolySynth paired with a Panner for stereo positioning
 * Similar to OscillatorWithChannel and SynthWithPanner
 */
export interface PolySynthWithPanner {
  polysynth: Tone.PolySynth;
  panner: Tone.Panner;
}
