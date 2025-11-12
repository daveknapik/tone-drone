/**
 * LFO polarity mode
 */
export type LFOPolarityMode = 'bipolar' | 'unipolar';

/**
 * LFO parameters
 */
export interface LFOParams {
  frequency: number; // Hz
  type: OscillatorType; // waveform type
  amplitude: number; // 0-1
  polarityMode?: LFOPolarityMode; // bipolar (-1 to +1) or unipolar (0 to +1), defaults to bipolar
}

/**
 * Modulation routing entry
 */
export interface ModulationRoute {
  sourceIndex: number; // which LFO (0-3)
  destination: ModulationDestination;
  amount: number; // 0-1 (modulation depth)
  // Per-route range configuration
  rangeMode?: "center" | "minmax"; // center±amount or [min,max]
  center?: number; // center value for bipolar mapping
  rangeAmount?: number; // peak deviation for bipolar mapping
  min?: number; // lower bound for unipolar mapping
  max?: number; // upper bound for unipolar mapping
}

/**
 * Available modulation destinations
 */
export type ModulationDestination =
  | "osc1-volume"
  | "osc2-volume"
  | "osc3-volume"
  | "osc4-volume"
  | "osc5-volume"
  | "osc6-volume"
  | "osc1-frequency"
  | "osc2-frequency"
  | "osc3-frequency"
  | "osc4-frequency"
  | "osc5-frequency"
  | "osc6-frequency"
  | "osc1-pan"
  | "osc2-pan"
  | "osc3-pan"
  | "osc4-pan"
  | "osc5-pan"
  | "osc6-pan"
  | "filter-frequency"
  | "filter-q"
  | "delay-time"
  | "delay-feedback"
  | "micro-time"
  | "micro-feedback"
  | "bitcrusher-bits"
  | "chebyshev-order"
  | "reverb1-wet"
  | "reverb2-wet"
  | "none";

/**
 * Complete modulation matrix state
 */
export interface ModulationMatrixState {
  lfos: LFOParams[];
  routes: ModulationRoute[];
}

/**
 * Handle interface for modulation matrix component
 */
export interface ModulationMatrixHandle {
  getState: () => ModulationMatrixState;
  setState: (state: ModulationMatrixState) => void;
}

/**
 * Destination display information
 */
export interface DestinationInfo {
  value: ModulationDestination;
  label: string;
  category: string;
}

