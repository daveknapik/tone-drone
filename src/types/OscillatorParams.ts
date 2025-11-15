/**
 * Oscillator type: basic (Tone.Oscillator) or fat (Tone.FatOscillator)
 */
export type OscillatorType = "basic" | "fat";

/**
 * Standard waveform shapes supported by Tone.js oscillators
 */
export type StandardWaveformType = "sine" | "triangle" | "square" | "sawtooth";

/**
 * All waveform shapes including custom implementations (sample-and-hold)
 */
export type WaveformType = StandardWaveformType | "sampleandhold";

/**
 * Parameters for a single Oscillator component that should be persisted in presets
 */
export interface OscillatorParams {
  frequency: number;
  waveform: string; // "sine" | "square" | "triangle" | "sawtooth"
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
