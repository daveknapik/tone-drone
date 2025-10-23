import { describe, it, expect } from "vitest";
import {
  serializePreset,
  deserializePreset,
  createPreset,
  validatePreset,
} from "./presetSerializer";
import type { Preset, PresetState } from "../types/Preset";

describe("presetSerializer", () => {
  const mockPresetState: PresetState = {
    oscillators: {
      minFreq: 440,
      maxFreq: 454,
      oscillators: [
        { frequency: 440, waveform: "sine", volume: -5, pan: 0, oscillatorType: "basic", fatCount: 3, fatSpread: 12 },
        { frequency: 445, waveform: "square", volume: -10, pan: 0.5, oscillatorType: "basic", fatCount: 3, fatSpread: 22 },
      ],
      sequences: [
        {
          frequency: 440,
          steps: [true, false, false, false, true, false, false, false],
        },
        {
          frequency: 445,
          steps: [false, true, false, false, false, true, false, false],
        },
      ],
    },
    polysynths: {
      polysynths: [
        {
          frequency: 666,
          waveform: "sine",
          volume: -5,
          pan: 0,
          attack: 0.5,
          decay: 0.7,
          sustain: 1,
          release: 3,
        },
        {
          frequency: 999,
          waveform: "sine",
          volume: -5,
          pan: 0,
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
    bpm: 120,
  };

  describe("createPreset", () => {
    it("should create a preset with version and metadata", () => {
      const name = "Test Preset";
      const preset = createPreset(name, mockPresetState);

      expect(preset.version).toBe(5);
      expect(preset.metadata.name).toBe(name);
      expect(preset.metadata.id).toBeTruthy();
      expect(preset.metadata.created).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(preset.state).toEqual(mockPresetState);
    });

    it("should generate unique IDs for different presets", () => {
      const preset1 = createPreset("Preset 1", mockPresetState);
      const preset2 = createPreset("Preset 2", mockPresetState);

      expect(preset1.metadata.id).not.toBe(preset2.metadata.id);
    });
  });

  describe("serializePreset", () => {
    it("should serialize a preset to JSON string", () => {
      const preset = createPreset("Test Preset", mockPresetState);
      const serialized = serializePreset(preset);

      expect(typeof serialized).toBe("string");
      expect(() => JSON.parse(serialized) as Preset).not.toThrow();
    });

    it("should preserve all preset data in serialization", () => {
      const preset = createPreset("Test Preset", mockPresetState);
      const serialized = serializePreset(preset);
      const parsed = JSON.parse(serialized) as Preset;

      expect(parsed.version).toBe(preset.version);
      expect(parsed.metadata).toEqual(preset.metadata);
      expect(parsed.state).toEqual(preset.state);
    });
  });

  describe("deserializePreset", () => {
    it("should deserialize a valid preset JSON string", () => {
      const preset = createPreset("Test Preset", mockPresetState);
      const serialized = serializePreset(preset);
      const deserialized = deserializePreset(serialized);

      expect(deserialized).toEqual(preset);
    });

    it("should deserialize and migrate a v2 preset without BPM", () => {
      // Create a v2 preset without BPM and with only 1 polysynth
      const v2PresetState = {
        oscillators: mockPresetState.oscillators,
        polysynths: {
          polysynths: [mockPresetState.polysynths.polysynths[0]],
        },
        effects: mockPresetState.effects,
        effectsBusSend: mockPresetState.effectsBusSend,
        // No BPM field - should be added by migration
      };

      const v2Preset = {
        version: 2,
        metadata: {
          id: "test-v2",
          name: "Test V2",
          created: "2024-01-01T00:00:00.000Z",
        },
        state: v2PresetState,
      };

      const serialized = JSON.stringify(v2Preset);
      const deserialized = deserializePreset(serialized);

      // Should be migrated to v5
      expect(deserialized.version).toBe(5);
      // Should have BPM added with default value
      expect(deserialized.state.bpm).toBe(120);
      // Should have second polysynth added
      expect(deserialized.state.polysynths.polysynths).toHaveLength(2);
      expect(deserialized.state.polysynths.polysynths[1].frequency).toBe(999);
      // Other state should be preserved
      expect(deserialized.state.oscillators).toEqual(mockPresetState.oscillators);
      expect(deserialized.state.polysynths.polysynths[0]).toEqual(
        mockPresetState.polysynths.polysynths[0]
      );
    });

    it("should throw error for invalid JSON", () => {
      expect(() => deserializePreset("invalid json")).toThrow();
    });

    it("should throw error for missing required fields", () => {
      const invalidPreset = { version: 1 }; // missing metadata and state
      const serialized = JSON.stringify(invalidPreset);

      expect(() => deserializePreset(serialized)).toThrow();
    });

    it("should throw error for invalid version", () => {
      const preset = createPreset("Test Preset", mockPresetState);
      const invalidPreset = { ...preset, version: 999 };
      const serialized = JSON.stringify(invalidPreset);

      expect(() => deserializePreset(serialized)).toThrow(/version/i);
    });
  });

  describe("validatePreset", () => {
    it("should return true for valid preset", () => {
      const preset = createPreset("Test Preset", mockPresetState);
      expect(validatePreset(preset)).toBe(true);
    });

    it("should return false for preset with missing version", () => {
      const preset = createPreset("Test Preset", mockPresetState);
      const invalid = { ...preset, version: undefined } as unknown as Preset;
      expect(validatePreset(invalid)).toBe(false);
    });

    it("should return false for preset with missing metadata", () => {
      const preset = createPreset("Test Preset", mockPresetState);
      const invalid = { ...preset, metadata: undefined } as unknown as Preset;
      expect(validatePreset(invalid)).toBe(false);
    });

    it("should return false for preset with missing state", () => {
      const preset = createPreset("Test Preset", mockPresetState);
      const invalid = { ...preset, state: undefined } as unknown as Preset;
      expect(validatePreset(invalid)).toBe(false);
    });

    it("should return false for preset with invalid oscillators", () => {
      const preset = createPreset("Test Preset", mockPresetState);
      const invalid = {
        ...preset,
        state: { ...preset.state, oscillators: undefined },
      } as unknown as Preset;
      expect(validatePreset(invalid)).toBe(false);
    });

    it("should return false for preset with invalid effects", () => {
      const preset = createPreset("Test Preset", mockPresetState);
      const invalid = {
        ...preset,
        state: { ...preset.state, effects: undefined },
      } as unknown as Preset;
      expect(validatePreset(invalid)).toBe(false);
    });

    it("should return false for preset with missing polysynths", () => {
      const preset = createPreset("Test Preset", mockPresetState);
      const invalid = {
        ...preset,
        state: { ...preset.state, polysynths: undefined },
      } as unknown as Preset;
      expect(validatePreset(invalid)).toBe(false);
    });

    it("should return false for preset with null polysynths", () => {
      const preset = createPreset("Test Preset", mockPresetState);
      const invalid = {
        ...preset,
        state: { ...preset.state, polysynths: null },
      } as unknown as Preset;
      expect(validatePreset(invalid)).toBe(false);
    });

    it("should return false for preset with missing bpm", () => {
      const preset = createPreset("Test Preset", mockPresetState);
      const invalid = {
        ...preset,
        state: { ...preset.state, bpm: undefined },
      } as unknown as Preset;
      expect(validatePreset(invalid)).toBe(false);
    });

    it("should return false for preset with non-number bpm", () => {
      const preset = createPreset("Test Preset", mockPresetState);
      const invalid = {
        ...preset,
        state: { ...preset.state, bpm: "120" },
      } as unknown as Preset;
      expect(validatePreset(invalid)).toBe(false);
    });

    it("should return false for preset with negative bpm", () => {
      const preset = createPreset("Test Preset", mockPresetState);
      const invalid = {
        ...preset,
        state: { ...preset.state, bpm: -10 },
      } as unknown as Preset;
      expect(validatePreset(invalid)).toBe(false);
    });

    it("should return false for preset with bpm > 999", () => {
      const preset = createPreset("Test Preset", mockPresetState);
      const invalid = {
        ...preset,
        state: { ...preset.state, bpm: 1000 },
      } as unknown as Preset;
      expect(validatePreset(invalid)).toBe(false);
    });

    it("should return true for preset with bpm = 0", () => {
      const preset = createPreset("Test Preset", mockPresetState);
      const valid = {
        ...preset,
        state: { ...preset.state, bpm: 0 },
      };
      expect(validatePreset(valid)).toBe(true);
    });

    it("should return true for preset with bpm = 999", () => {
      const preset = createPreset("Test Preset", mockPresetState);
      const valid = {
        ...preset,
        state: { ...preset.state, bpm: 999 },
      };
      expect(validatePreset(valid)).toBe(true);
    });

    it("should return true for preset with valid bpm in middle of range", () => {
      const preset = createPreset("Test Preset", mockPresetState);
      const valid = {
        ...preset,
        state: { ...preset.state, bpm: 140 },
      };
      expect(validatePreset(valid)).toBe(true);
    });
  });
});
