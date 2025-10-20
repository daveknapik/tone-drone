import type { Preset, PresetState, PresetMetadata } from "../types/Preset";
import { migratePreset, needsMigration } from "./presetMigration";

/**
 * Current preset format version
 * Increment this when making breaking changes to preset structure
 */
const CURRENT_VERSION = 3;

/**
 * Generate a unique ID for a preset
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Create a new preset with metadata
 */
export function createPreset(name: string, state: PresetState): Preset {
  const now = new Date().toISOString();

  const metadata: PresetMetadata = {
    id: generateId(),
    name,
    created: now,
  };

  return {
    version: CURRENT_VERSION,
    metadata,
    state,
  };
}

/**
 * Serialize a preset to JSON string
 */
export function serializePreset(preset: Preset): string {
  return JSON.stringify(preset);
}

/**
 * Deserialize a preset from JSON string
 * @throws Error if JSON is invalid or preset structure is invalid
 */
export function deserializePreset(json: string): Preset {
  let parsed: unknown;

  try {
    parsed = JSON.parse(json);
  } catch (error) {
    throw new Error(
      `Invalid preset JSON: ${error instanceof Error ? error.message : "unknown error"}`
    );
  }

  let preset = parsed as Preset;

  // Basic validation before migration (just check structure exists)
  if (
    typeof preset !== "object" ||
    preset === null ||
    typeof preset.version !== "number" ||
    typeof preset.metadata !== "object" ||
    typeof preset.state !== "object"
  ) {
    throw new Error("Invalid preset structure");
  }

  // Check version compatibility
  if (preset.version > CURRENT_VERSION) {
    throw new Error(
      `Preset version ${preset.version} is not supported. Current version: ${CURRENT_VERSION}`
    );
  }

  // Apply migrations if needed
  if (needsMigration(preset)) {
    preset = migratePreset(preset);
  }

  // Full validation after migration
  if (!validatePreset(preset)) {
    throw new Error("Invalid preset structure after migration");
  }

  return preset;
}

/**
 * Validate that an object conforms to the Preset interface
 */
export function validatePreset(preset: Preset): boolean {
  // Check top-level structure
  if (typeof preset !== "object" || preset === null) {
    return false;
  }

  if (typeof preset.version !== "number") {
    return false;
  }

  // Validate metadata
  if (
    typeof preset.metadata !== "object" ||
    preset.metadata === null ||
    typeof preset.metadata.id !== "string" ||
    typeof preset.metadata.name !== "string" ||
    typeof preset.metadata.created !== "string"
  ) {
    return false;
  }

  // Validate state exists
  if (typeof preset.state !== "object" || preset.state === null) {
    return false;
  }

  // Validate oscillators
  if (
    typeof preset.state.oscillators !== "object" ||
    preset.state.oscillators === null ||
    typeof preset.state.oscillators.minFreq !== "number" ||
    typeof preset.state.oscillators.maxFreq !== "number" ||
    !Array.isArray(preset.state.oscillators.oscillators) ||
    !Array.isArray(preset.state.oscillators.sequences)
  ) {
    return false;
  }

  // Validate effects
  if (
    typeof preset.state.effects !== "object" ||
    preset.state.effects === null ||
    typeof preset.state.effects.autoFilter !== "object" ||
    typeof preset.state.effects.bitCrusher !== "object" ||
    typeof preset.state.effects.chebyshev !== "object" ||
    typeof preset.state.effects.microlooper !== "object" ||
    typeof preset.state.effects.afterFilter !== "object" ||
    typeof preset.state.effects.delay !== "object"
  ) {
    return false;
  }

  // Validate polysynths
  if (
    typeof preset.state.polysynths !== "object" ||
    preset.state.polysynths === null
  ) {
    return false;
  }

  // Validate effectsBusSend
  if (typeof preset.state.effectsBusSend !== "number") {
    return false;
  }

  // Validate BPM
  if (
    typeof preset.state.bpm !== "number" ||
    preset.state.bpm < 0 ||
    preset.state.bpm > 999
  ) {
    return false;
  }

  return true;
}

/**
 * Update a preset's modified timestamp
 */
export function updatePresetTimestamp(preset: Preset): Preset {
  return {
    ...preset,
    metadata: {
      ...preset.metadata,
      modified: new Date().toISOString(),
    },
  };
}
