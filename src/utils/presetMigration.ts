import type { Preset } from "../types/Preset";
import { DEFAULT_POLYSYNTHS_STATE, DEFAULT_BPM } from "./presetDefaults";

/**
 * Current preset version
 */
export const CURRENT_PRESET_VERSION = 5;

/**
 * Migrate a preset from an older version to the current version
 * @param preset The preset to migrate
 * @returns The migrated preset at the current version
 */
export function migratePreset(preset: Preset): Preset {
  let migrated = { ...preset };

  // Run migrations sequentially from preset version to current
  for (
    let version = preset.version;
    version < CURRENT_PRESET_VERSION;
    version++
  ) {
    migrated = runMigration(migrated, version);
  }

  return migrated;
}

/**
 * Run a specific migration from one version to the next
 */
function runMigration(preset: Preset, fromVersion: number): Preset {
  switch (fromVersion) {
    case 1:
      return migrateV1ToV2(preset);

    case 2:
      return migrateV2ToV3(preset);

    case 3:
      return migrateV3ToV4(preset);

    case 4:
      return migrateV4ToV5(preset);

    default:
      // No migration needed for this version
      return preset;
  }
}

/**
 * Migration from version 1 to version 2
 * Adds polysynths support to presets that were created before this feature existed
 */
function migrateV1ToV2(preset: Preset): Preset {
  return {
    ...preset,
    version: 2,
    state: {
      ...preset.state,
      // Add polysynths with default values if missing
      polysynths: preset.state.polysynths ?? DEFAULT_POLYSYNTHS_STATE,
    },
  };
}

/**
 * Migration from version 2 to version 3
 * Adds BPM support to presets that were created before this feature existed
 */
function migrateV2ToV3(preset: Preset): Preset {
  return {
    ...preset,
    version: 3,
    state: {
      ...preset.state,
      // Add BPM with default value if missing
      bpm: preset.state.bpm ?? DEFAULT_BPM,
    },
  };
}

/**
 * Migration from version 3 to version 4
 * Adds second polysynth to presets that only had one
 */
function migrateV3ToV4(preset: Preset): Preset {
  const currentPolysynths = preset.state.polysynths?.polysynths ?? [];

  // If there's only 1 polysynth, add a second one
  const updatedPolysynths =
    currentPolysynths.length === 1
      ? [...currentPolysynths, DEFAULT_POLYSYNTHS_STATE.polysynths[1]]
      : currentPolysynths;

  return {
    ...preset,
    version: 4,
    state: {
      ...preset.state,
      polysynths: {
        polysynths: updatedPolysynths,
      },
    },
  };
}

/**
 * Migration from version 4 to version 5
 * Adds pan control to all polysynths (centered by default)
 */
function migrateV4ToV5(preset: Preset): Preset {
  const currentPolysynths = preset.state.polysynths?.polysynths ?? [];

  // Add pan: 0 to each polysynth that doesn't have it
  const updatedPolysynths = currentPolysynths.map((ps) => ({
    ...ps,
    pan: ps.pan ?? 0, // Centered panning for existing presets
  }));

  return {
    ...preset,
    version: 5,
    state: {
      ...preset.state,
      polysynths: {
        polysynths: updatedPolysynths,
      },
    },
  };
}

/**
 * Check if a preset needs migration
 */
export function needsMigration(preset: Preset): boolean {
  return preset.version < CURRENT_PRESET_VERSION;
}

/**
 * Get a list of all migrations that will be applied to a preset
 */
export function getMigrationPath(fromVersion: number): number[] {
  const path: number[] = [];
  for (let v = fromVersion; v < CURRENT_PRESET_VERSION; v++) {
    path.push(v);
  }
  return path;
}
