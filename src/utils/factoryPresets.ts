import type { Preset } from "../types/Preset";

// Import factory presets
import initPreset from "../presets/init.json";
import deepSpaceDronePreset from "../presets/deep-space-drone.json";
import gentleWavesPreset from "../presets/gentle-waves.json";
import rhythmicPulsarPreset from "../presets/rhythmic-pulsar.json";

/**
 * All factory presets
 * These are read-only and cannot be deleted by users
 */
export const FACTORY_PRESETS: Preset[] = [
  initPreset as Preset,
  deepSpaceDronePreset as Preset,
  gentleWavesPreset as Preset,
  rhythmicPulsarPreset as Preset,
];

/**
 * Get a factory preset by ID
 */
export function getFactoryPreset(id: string): Preset | undefined {
  return FACTORY_PRESETS.find((preset) => preset.metadata.id === id);
}

/**
 * Check if a preset is a factory preset
 */
export function isFactoryPreset(presetId: string): boolean {
  return presetId.startsWith("factory-");
}

/**
 * Get the default preset (Init)
 */
export function getDefaultPreset(): Preset {
  return initPreset as Preset;
}
