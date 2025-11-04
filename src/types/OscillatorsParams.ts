import { Sequence } from "./Sequence";
import { OscillatorParams } from "./OscillatorParams";
import { SynthEnvelopeParams } from "./SynthParams";
import { OscillatorWithChannel } from "./OscillatorWithChannel";

/**
 * State for the Oscillators component (global settings + all oscillators)
 */
export interface OscillatorsState {
  minFreq: number;
  maxFreq: number;
  oscillators: OscillatorParams[];
  sequences: Sequence[];
  mutedSequences?: boolean[];
  synthEnvelope: SynthEnvelopeParams;
}

/**
 * Handle interface for Oscillators component
 * Allows parent components to read and write all oscillator state imperatively
 */
export interface OscillatorsHandle {
  getState: () => OscillatorsState;
  setState: (state: OscillatorsState) => void;
  getOscillators: () => OscillatorWithChannel[]; // Get Tone.js oscillator objects for modulation
}
