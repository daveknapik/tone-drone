/**
 * Gristleizer mode type - VCA (amplitude modulation + distortion) or VCF (filter modulation)
 */
export type GristleizerMode = "vca" | "vcf";

/**
 * Gristleizer LFO waveform type
 */
export type GristleizerWaveform = "triangle" | "sawtooth" | "square";

/**
 * Parameters for the Gristleizer effect that should be persisted in presets
 * Based on the legendary Throbbing Gristle VCA/VCF effect
 */
export interface GristleizerParams {
  /** In VCA mode: modulation intensity/shape, distortion amount. In VCF mode: filter center frequency (0-1) */
  bias: number;
  /** Signal drive in the first gain stage (0-1) */
  gain: number;
  /** Amount of dry signal added to filtered signal in VCF mode (0-1) */
  filterMix: number;
  /** Internal LFO frequency in Hz (0.01-20) */
  freq: number;
  /** Amount of LFO modulation applied to signal (0-1) */
  depth: number;
  /** Output level (0-1) */
  level: number;
  /** Effect mode - VCA (tremolo/distortion) or VCF (filter modulation) */
  mode: GristleizerMode;
  /** LFO waveform shape */
  waveform: GristleizerWaveform;
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
