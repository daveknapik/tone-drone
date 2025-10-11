import * as Tone from "tone";

/**
 * Parameters for the Filter effect that should be persisted in presets
 */
export interface FilterParams {
  frequency: number;
  rolloff: Tone.FilterRollOff;
  Q: number;
  type: BiquadFilterType;
}

/**
 * Handle interface for Filter component
 * Allows parent components to read and write Filter state imperatively
 */
export interface FilterHandle {
  getParams: () => FilterParams;
  setParams: (params: FilterParams) => void;
}
