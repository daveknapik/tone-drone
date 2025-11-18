/**
 * Gristleizer mode type - VCA (tremolo/amplitude modulation) or VCF (filter modulation)
 */
export type GristleizerMode = "vca" | "vcf";

/**
 * Gristleizer LFO waveform type
 */
export type GristleizerWaveform = "sine" | "triangle" | "square" | "sawtooth";

/**
 * Parameters for the Gristleizer effect that should be persisted in presets
 * Based on the legendary Throbbing Gristle VCA/VCF effect
 */
export interface GristleizerParams {
  /** Effect mode - VCA (tremolo) or VCF (filter modulation) */
  mode: GristleizerMode;
  /** LFO waveform shape */
  waveform: GristleizerWaveform;
  /** LFO frequency in Hz (0.1-20) */
  freq: number;
  /** Modulation depth (0-1) */
  depth: number;
  /** Filter frequency for VCF mode (20-5000 Hz) */
  filterFreq: number;
  /** Filter Q/resonance for VCF mode (0.5-10) */
  filterQ: number;
  /** Overall dry/wet mix (0-1) */
  wet: number;
}

/**
 * Handle interface for Gristleizer component
 * Allows parent components to read and write Gristleizer state imperatively
 */
export interface GristleizerHandle {
  getParams: () => GristleizerParams;
  setParams: (params: GristleizerParams) => void;
}
