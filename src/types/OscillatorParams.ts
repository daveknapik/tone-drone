/**
 * Parameters for a single Oscillator component that should be persisted in presets
 */
export interface OscillatorParams {
  frequency: number;
  waveform: string; // "sine" | "square" | "triangle" | "sawtooth"
  volume: number;
  pan: number;
}

/**
 * Handle interface for Oscillator component
 * Allows parent components to read and write Oscillator state imperatively
 */
export interface OscillatorHandle {
  getParams: () => OscillatorParams;
  setParams: (params: OscillatorParams) => void;
}
