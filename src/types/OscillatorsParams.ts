import { Sequence } from "./Sequence";
import { OscillatorParams } from "./OscillatorParams";
import { SynthEnvelopeParams } from "./SynthParams";

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
}
