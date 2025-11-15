import type { AutoFilterParams } from "../types/AutoFilterParams";
import type { BitCrusherParams } from "../types/BitCrusherParams";
import type { ChebyshevParams } from "../types/ChebyshevParams";
import type { DelayParams } from "../types/DelayParams";
import type { FilterParams } from "../types/FilterParams";
import type {
  PolySynthParams,
  PolySynthsState,
} from "../types/PolySynthParams";
import type { OscillatorParams } from "../types/OscillatorParams";
import type { OscillatorsState } from "../types/OscillatorsParams";
import type { Sequence } from "../types/Sequence";
import type { PresetState } from "../types/Preset";
import type { SynthEnvelopeParams } from "../types/SynthParams";
import type { ModulationMatrixState } from "../types/ModulationMatrixParams";

/**
 * Centralized default values for all preset components
 * These defaults are used for:
 * - Component initialization
 * - Preset migration
 * - Fallback values
 * - Testing
 */

// ============================================================================
// Oscillator Defaults
// ============================================================================

export const DEFAULT_OSCILLATOR_PARAMS: OscillatorParams = {
  frequency: 440,
  waveform: "sine",
  volume: -5,
  pan: 0,
  oscillatorType: "basic",
  fatCount: 1,
  fatSpread: 0,
};

export const DEFAULT_SEQUENCE: Sequence = {
  frequency: 440,
  steps: Array(16).fill(false) as boolean[],
};

export const DEFAULT_OSCILLATORS_STATE: OscillatorsState = {
  minFreq: 30,
  maxFreq: 1000,
  oscillators: Array.from({ length: 6 }, () => ({
    ...DEFAULT_OSCILLATOR_PARAMS,
  })),
  sequences: Array.from({ length: 6 }, () => ({
    ...DEFAULT_SEQUENCE,
    steps: [...DEFAULT_SEQUENCE.steps],
  })),
  mutedSequences: Array(6).fill(false) as boolean[],
  synthEnvelope: {
    attack: 0.01,
    decay: 0.1,
    sustain: 0.25,
    release: 0.5,
  },
};

// ============================================================================
// Synth (Step Sequencer) Defaults
// ============================================================================

export const DEFAULT_SYNTH_ENVELOPE_PARAMS: SynthEnvelopeParams = {
  attack: 0.01, // Fast attack for percussive sequencer notes
  decay: 0.1,
  sustain: 0.25, // Lower sustain to prevent voice accumulation
  release: 0.5, // Shorter release to prevent voice accumulation
};

// ============================================================================
// PolySynth Defaults
// ============================================================================

export const DEFAULT_POLYSYNTH_PARAMS: PolySynthParams = {
  frequency: 666,
  waveform: "sine",
  volume: -5,
  pan: 0,
  attack: 0.5,
  decay: 0.7,
  sustain: 1,
  release: 3,
};

export const DEFAULT_POLYSYNTHS_STATE: PolySynthsState = {
  polysynths: [
    { ...DEFAULT_POLYSYNTH_PARAMS },
    { ...DEFAULT_POLYSYNTH_PARAMS, frequency: 999 }, // Perfect fifth up from 666 Hz
  ],
};

// ============================================================================
// Effect Defaults
// ============================================================================

export const DEFAULT_AUTO_FILTER_PARAMS: AutoFilterParams = {
  baseFrequency: 200,
  depth: 1000,
  frequency: 1,
  rolloff: -12,
  Q: 1,
  wet: 0.5,
  type: "lowpass",
  oscillatorType: "sine",
};

export const DEFAULT_BIT_CRUSHER_PARAMS: BitCrusherParams = {
  bits: 4,
  wet: 0.5,
};

export const DEFAULT_CHEBYSHEV_PARAMS: ChebyshevParams = {
  order: 50,
  wet: 0.5,
};

export const DEFAULT_MICROLOOPER_PARAMS: DelayParams = {
  time: 0.25,
  feedback: 0.5,
  wet: 0.5,
};

export const DEFAULT_AFTER_FILTER_PARAMS: FilterParams = {
  frequency: 1000,
  rolloff: -12,
  Q: 1,
  type: "lowpass",
};

export const DEFAULT_DELAY_PARAMS: DelayParams = {
  time: 0.5,
  feedback: 0.5,
  wet: 0.5,
};

// Reverb removed from app - kept for backward compatibility in old presets only

export const DEFAULT_EFFECTS_BUS_SEND = -15;

// ============================================================================
// Modulation Matrix Defaults
// ============================================================================

export const DEFAULT_MODULATION_MATRIX_STATE: ModulationMatrixState = {
  lfos: [
    { frequency: 0.5, type: "sine", amplitude: 1 },
    { frequency: 1, type: "triangle", amplitude: 1 },
    { frequency: 2, type: "square", amplitude: 1 },
    { frequency: 4, type: "sawtooth", amplitude: 1 },
  ],
  routes: [],
};

// ============================================================================
// Transport Defaults
// ============================================================================

export const DEFAULT_BPM = 120;

// ============================================================================
// Complete Preset State Default
// ============================================================================

export const DEFAULT_PRESET_STATE: PresetState = {
  oscillators: DEFAULT_OSCILLATORS_STATE,
  polysynths: DEFAULT_POLYSYNTHS_STATE,
  effects: {
    autoFilter: DEFAULT_AUTO_FILTER_PARAMS,
    bitCrusher: DEFAULT_BIT_CRUSHER_PARAMS,
    chebyshev: DEFAULT_CHEBYSHEV_PARAMS,
    microlooper: DEFAULT_MICROLOOPER_PARAMS,
    afterFilter: DEFAULT_AFTER_FILTER_PARAMS,
    delay: DEFAULT_DELAY_PARAMS,
  },
  effectsBusSend: DEFAULT_EFFECTS_BUS_SEND,
  modulationMatrix: DEFAULT_MODULATION_MATRIX_STATE,
  bpm: DEFAULT_BPM,
};
