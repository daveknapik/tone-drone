import type { Preset } from "../types/Preset";

/**
 * Current preset version
 */
export const CURRENT_PRESET_VERSION = 1;

/**
 * Migrate a preset from an older version to the current version
 * @param preset The preset to migrate
 * @returns The migrated preset at the current version
 */
export function migratePreset(preset: Preset): Preset {
  let migrated = { ...preset };

  // Run migrations sequentially from preset version to current
  for (let version = preset.version; version < CURRENT_PRESET_VERSION; version++) {
    migrated = runMigration(migrated, version);
  }

  return migrated;
}

/**
 * Run a specific migration from one version to the next
 */
function runMigration(preset: Preset, fromVersion: number): Preset {
  switch (fromVersion) {
    // Example: migration from version 1 to version 2
    // case 1:
    //   return migrateV1ToV2(preset);

    // Example: migration from version 2 to version 3
    // case 2:
    //   return migrateV2ToV3(preset);

    default:
      // No migration needed for this version
      return preset;
  }
}

/**
 * Example migration function from v1 to v2
 * Uncomment and modify when version 2 is created
 */
// function migrateV1ToV2(preset: Preset): Preset {
//   return {
//     ...preset,
//     version: 2,
//     // Add new fields or transform existing ones
//     state: {
//       ...preset.state,
//       // Example: add new effect
//       effects: {
//         ...preset.state.effects,
//         newEffect: {
//           // default parameters
//         },
//       },
//     },
//   };
// }

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
