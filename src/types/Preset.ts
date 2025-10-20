import { AutoFilterParams } from "./AutoFilterParams";
import { BitCrusherParams } from "./BitCrusherParams";
import { ChebyshevParams } from "./ChebyshevParams";
import { DelayParams } from "./DelayParams";
import { FilterParams } from "./FilterParams";
import { Sequence } from "./Sequence";
import { PolySynthsState } from "./PolySynthParams";
import { OscillatorParams } from "./OscillatorParams";

/**
 * Global oscillator settings and all oscillator instances
 */
export interface OscillatorsState {
  minFreq: number;
  maxFreq: number;
  oscillators: OscillatorParams[];
  sequences: Sequence[];
}

/**
 * Complete synthesizer state for preset save/load
 */
export interface PresetState {
  // Global oscillator configuration
  oscillators: OscillatorsState;

  // Polysynth configuration
  polysynths: PolySynthsState;

  // Effect parameters
  effects: {
    autoFilter: AutoFilterParams;
    bitCrusher: BitCrusherParams;
    chebyshev: ChebyshevParams;
    microlooper: DelayParams;
    afterFilter: FilterParams;
    delay: DelayParams;
  };

  // Effects bus send level
  effectsBusSend: number;

  // Tempo in beats per minute
  bpm: number;
}

/**
 * Metadata for a saved preset
 */
export interface PresetMetadata {
  id: string;
  name: string;
  description?: string; // Optional description for factory presets
  created: string; // ISO date string
  modified?: string; // ISO date string
}

/**
 * Complete preset with metadata and state
 */
export interface Preset {
  version: number;
  metadata: PresetMetadata;
  state: PresetState;
}

/**
 * Preset with just essential info for listing
 */
export interface PresetListItem {
  id: string;
  name: string;
  created: string;
  modified?: string;
}
