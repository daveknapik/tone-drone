import { describe, it, expect } from "vitest";
import {
  migratePreset,
  needsMigration,
  getMigrationPath,
  CURRENT_PRESET_VERSION,
} from "./presetMigration";
import type { Preset, PresetState } from "../types/Preset";
import { DEFAULT_BPM } from "./presetDefaults";

describe("presetMigration", () => {
  const createV1Preset = (): Preset => ({
    version: 1,
    metadata: {
      id: "test-v1",
      name: "Test V1 Preset",
      created: "2024-01-01T00:00:00.000Z",
    },
    state: {
      oscillators: {
        minFreq: 440,
        maxFreq: 454,
        oscillators: [
          { frequency: 440, waveform: "sine", volume: -5, pan: 0 },
        ],
        sequences: [
          {
            frequency: 440,
            steps: [true, false, false, false, true, false, false, false],
          },
        ],
      },
      effects: {
        autoFilter: {
          baseFrequency: 200,
          depth: 1000,
          frequency: 1,
          rolloff: -12,
          Q: 1,
          wet: 0.5,
          type: "lowpass",
          oscillatorType: "sine",
        },
        bitCrusher: {
          bits: 4,
          wet: 0.5,
        },
        chebyshev: {
          order: 50,
          wet: 0.5,
        },
        microlooper: {
          time: 0.25,
          feedback: 0.5,
          wet: 0.5,
        },
        afterFilter: {
          frequency: 1000,
          rolloff: -12,
          Q: 1,
          type: "lowpass",
        },
        delay: {
          time: 0.5,
          feedback: 0.5,
          wet: 0.5,
        },
      },
      effectsBusSend: 0.5,
      // V1 presets don't have BPM - migration will add it
    } as PresetState,
  });

  const createV2Preset = (): Preset => ({
    version: 2,
    metadata: {
      id: "test-v2",
      name: "Test V2 Preset",
      created: "2024-01-01T00:00:00.000Z",
    },
    state: {
      oscillators: {
        minFreq: 440,
        maxFreq: 454,
        oscillators: [
          { frequency: 440, waveform: "sine", volume: -5, pan: 0 },
        ],
        sequences: [
          {
            frequency: 440,
            steps: [true, false, false, false, true, false, false, false],
          },
        ],
      },
      polysynths: {
        polysynths: [
          {
            frequency: 666,
            waveform: "sine",
            volume: -5,
            attack: 0.5,
            decay: 0.7,
            sustain: 1,
            release: 3,
          },
        ],
      },
      effects: {
        autoFilter: {
          baseFrequency: 200,
          depth: 1000,
          frequency: 1,
          rolloff: -12,
          Q: 1,
          wet: 0.5,
          type: "lowpass",
          oscillatorType: "sine",
        },
        bitCrusher: {
          bits: 4,
          wet: 0.5,
        },
        chebyshev: {
          order: 50,
          wet: 0.5,
        },
        microlooper: {
          time: 0.25,
          feedback: 0.5,
          wet: 0.5,
        },
        afterFilter: {
          frequency: 1000,
          rolloff: -12,
          Q: 1,
          type: "lowpass",
        },
        delay: {
          time: 0.5,
          feedback: 0.5,
          wet: 0.5,
        },
      },
      effectsBusSend: 0.5,
      // V2 presets don't have BPM - migration will add it
    } as PresetState,
  });

  describe("needsMigration", () => {
    it("should return true for presets with version < current", () => {
      const v1Preset = createV1Preset();
      expect(needsMigration(v1Preset)).toBe(true);

      const v2Preset = createV2Preset();
      expect(needsMigration(v2Preset)).toBe(true);
    });

    it("should return false for presets at current version", () => {
      const preset = createV2Preset();
      preset.version = CURRENT_PRESET_VERSION;
      expect(needsMigration(preset)).toBe(false);
    });
  });

  describe("getMigrationPath", () => {
    it("should return correct migration path from v1", () => {
      const path = getMigrationPath(1);
      expect(path).toContain(1);
      expect(path).toContain(2);
    });

    it("should return correct migration path from v2", () => {
      const path = getMigrationPath(2);
      expect(path).toEqual([2, 3]); // v2→v3, v3→v4
    });

    it("should return empty array for current version", () => {
      const path = getMigrationPath(CURRENT_PRESET_VERSION);
      expect(path).toEqual([]);
    });
  });

  describe("migratePreset", () => {
    describe("v1 to v2 migration", () => {
      it("should add polysynths with default values", () => {
        const v1Preset = createV1Preset();
        const migrated = migratePreset(v1Preset);

        expect(migrated.version).toBe(CURRENT_PRESET_VERSION);
        expect(migrated.state.polysynths).toBeDefined();
        expect(migrated.state.polysynths.polysynths).toBeInstanceOf(Array);
      });

      it("should preserve existing preset data", () => {
        const v1Preset = createV1Preset();
        const migrated = migratePreset(v1Preset);

        expect(migrated.metadata).toEqual(v1Preset.metadata);
        expect(migrated.state.oscillators).toEqual(v1Preset.state.oscillators);
        expect(migrated.state.effects).toEqual(v1Preset.state.effects);
        expect(migrated.state.effectsBusSend).toBe(
          v1Preset.state.effectsBusSend
        );
      });
    });

    describe("v2 to v3 migration", () => {
      it("should add bpm with default value when missing", () => {
        const v2Preset = createV2Preset();
        const migrated = migratePreset(v2Preset);

        expect(migrated.version).toBe(CURRENT_PRESET_VERSION);
        expect(migrated.state.bpm).toBe(DEFAULT_BPM);
      });

      it("should preserve existing bpm value if present", () => {
        const v2Preset = createV2Preset();
        // Manually add BPM to simulate a preset that somehow already has it
        (v2Preset.state as PresetState & { bpm?: number }).bpm = 140;

        const migrated = migratePreset(v2Preset);

        expect(migrated.version).toBe(CURRENT_PRESET_VERSION);
        expect(migrated.state.bpm).toBe(140);
      });

      it("should preserve all existing v2 data", () => {
        const v2Preset = createV2Preset();
        const migrated = migratePreset(v2Preset);

        expect(migrated.metadata).toEqual(v2Preset.metadata);
        expect(migrated.state.oscillators).toEqual(v2Preset.state.oscillators);
        // First polysynth should be preserved from v2
        expect(migrated.state.polysynths.polysynths[0]).toEqual(
          v2Preset.state.polysynths.polysynths[0]
        );
        // Second polysynth should be added during v3→v4 migration
        expect(migrated.state.polysynths.polysynths).toHaveLength(2);
        expect(migrated.state.effects).toEqual(v2Preset.state.effects);
        expect(migrated.state.effectsBusSend).toBe(
          v2Preset.state.effectsBusSend
        );
      });
    });

    describe("v1 to v3 migration chain", () => {
      it("should migrate through all versions sequentially", () => {
        const v1Preset = createV1Preset();
        const migrated = migratePreset(v1Preset);

        // Should have both v1→v2 and v2→v3 changes
        expect(migrated.version).toBe(CURRENT_PRESET_VERSION);
        expect(migrated.state.polysynths).toBeDefined(); // v1→v2
        expect(migrated.state.bpm).toBe(DEFAULT_BPM); // v2→v3
      });

      it("should preserve original data through migration chain", () => {
        const v1Preset = createV1Preset();
        const migrated = migratePreset(v1Preset);

        expect(migrated.metadata).toEqual(v1Preset.metadata);
        expect(migrated.state.oscillators).toEqual(v1Preset.state.oscillators);
        expect(migrated.state.effects).toEqual(v1Preset.state.effects);
      });
    });

    describe("no migration needed", () => {
      it("should return preset unchanged if already at current version", () => {
        const currentPreset = createV2Preset();
        currentPreset.version = CURRENT_PRESET_VERSION;
        currentPreset.state.bpm = 140;

        const migrated = migratePreset(currentPreset);

        expect(migrated).toEqual(currentPreset);
      });
    });
  });
});
