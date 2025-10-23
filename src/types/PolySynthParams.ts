/**
 * Parameters for a single PolySynth instance
 */
export interface PolySynthParams {
  frequency: number;
  waveform: OscillatorType;
  volume: number;
  pan: number;
  attack: number;
  decay: number;
  sustain: number;
  release: number;
}

/**
 * Handle interface for PolySynth component
 */
export interface PolySynthHandle {
  getParams: () => PolySynthParams;
  setParams: (params: PolySynthParams) => void;
}

/**
 * State for all polysynths
 */
export interface PolySynthsState {
  polysynths: PolySynthParams[];
}
