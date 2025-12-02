/**
 * Oscillator type: basic (Tone.Oscillator) or fat (Tone.FatOscillator)
 */
export type OscillatorType = "basic" | "fat";

/**
 * Waveform shape for oscillators, LFOs, and other audio sources
 * Note: This is distinct from the global DOM OscillatorType which includes "custom"
 */
export type WaveformType = "sine" | "triangle" | "square" | "sawtooth";

/**
 * Parameters for a single Oscillator component that should be persisted in presets
 */
export interface OscillatorParams {
  frequency: number;
  waveform: WaveformType;
  volume: number;
  pan: number;
  oscillatorType: OscillatorType;
  fatCount: number; // 2-10 voices (only applies when oscillatorType is "fat")
  fatSpread: number; // 0-100 cents detune spread (only applies when oscillatorType is "fat")
}

/**
 * Handle interface for Oscillator component
 * Allows parent components to read and write Oscillator state imperatively
 */
export interface OscillatorHandle {
  getParams: () => OscillatorParams;
  setParams: (params: OscillatorParams) => void;
}
