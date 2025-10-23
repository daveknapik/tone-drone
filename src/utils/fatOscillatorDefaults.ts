/**
 * Waveform-specific defaults for FatOscillator parameters
 * Based on audio characteristics and drone/ambient music best practices
 */

interface FatDefaults {
  count: number; // Number of detuned voices (2-10)
  spread: number; // Detune spread in cents (0-100)
}

/**
 * Get recommended FatOscillator defaults for a given waveform
 *
 * Rationale:
 * - Sine: Pure tone, subtle spread creates gentle phasing (3 voices, 12¢)
 * - Sawtooth: Rich harmonics benefit from wider spread for "supersaw" effect (5 voices, 30¢)
 * - Square: Hollow character needs moderate detuning to add warmth (3 voices, 22¢)
 * - Triangle: Soft harmonics, keep close to sine values (3 voices, 15¢)
 */
export const FAT_OSCILLATOR_DEFAULTS: Record<string, FatDefaults> = {
  sine: {
    count: 3,
    spread: 12,
  },
  sawtooth: {
    count: 5,
    spread: 30,
  },
  square: {
    count: 3,
    spread: 22,
  },
  triangle: {
    count: 3,
    spread: 15,
  },
};

/**
 * Get Fat defaults for a specific waveform
 * Falls back to sine defaults if waveform not found
 */
export function getFatDefaults(waveform: string): FatDefaults {
  return FAT_OSCILLATOR_DEFAULTS[waveform] ?? FAT_OSCILLATOR_DEFAULTS.sine;
}
