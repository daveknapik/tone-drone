import * as Tone from "tone";

/**
 * Parameters for the AutoFilter effect that should be persisted in presets
 */
export interface AutoFilterParams {
  baseFrequency: number;
  depth: number;
  frequency: number;
  rolloff: Tone.FilterRollOff;
  Q: number;
  wet: number;
  type: BiquadFilterType;
  oscillatorType: OscillatorType;
}

/**
 * Handle interface for AutoFilter component
 * Allows parent components to read and write AutoFilter state imperatively
 */
export interface AutoFilterHandle {
  getParams: () => AutoFilterParams;
  setParams: (params: AutoFilterParams) => void;
}
