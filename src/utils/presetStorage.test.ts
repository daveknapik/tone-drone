import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  savePreset,
  loadPreset,
  deletePreset,
  listPresets,
  presetExists,
} from "./presetStorage";
import { createPreset } from "./presetSerializer";
import type { Preset, PresetState, PresetListItem } from "../types/Preset";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// Replace global localStorage
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  writable: true,
});

describe("presetStorage", () => {
  const mockPresetState: PresetState = {
    oscillators: {
      minFreq: 440,
      maxFreq: 454,
      oscillators: [
        { frequency: 440, waveform: "sine", volume: -5, pan: 0, oscillatorType: "basic", fatCount: 3, fatSpread: 12 },
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

  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe("savePreset", () => {
    it("should save a preset to localStorage", () => {
      const preset = createPreset("Test Preset", mockPresetState);
      savePreset(preset);

      const stored = localStorage.getItem(`preset_${preset.metadata.id}`);
      expect(stored).toBeTruthy();
      expect(JSON.parse(stored!) as Preset).toEqual(preset);
    });

    it("should overwrite existing preset with same ID", () => {
      const preset = createPreset("Test Preset", mockPresetState);
      savePreset(preset);

      const modified = {
        ...preset,
        metadata: { ...preset.metadata, name: "Modified Name" },
      };
      savePreset(modified);

      const stored = localStorage.getItem(`preset_${preset.metadata.id}`);
      const parsed = JSON.parse(stored!) as Preset;
      expect(parsed.metadata.name).toBe("Modified Name");
    });

    it("should save preset metadata to index", () => {
      const preset = createPreset("Test Preset", mockPresetState);
      savePreset(preset);

      const index = localStorage.getItem("preset_index");
      expect(index).toBeTruthy();

      const parsedIndex = JSON.parse(index!) as PresetListItem[];
      expect(parsedIndex).toHaveLength(1);
      expect(parsedIndex[0]).toEqual({
        id: preset.metadata.id,
        name: preset.metadata.name,
        created: preset.metadata.created,
      });
    });
  });

  describe("loadPreset", () => {
    it("should load a preset from localStorage", () => {
      const preset = createPreset("Test Preset", mockPresetState);
      savePreset(preset);

      const loaded = loadPreset(preset.metadata.id);
      expect(loaded).toEqual(preset);
    });

    it("should return null if preset does not exist", () => {
      const loaded = loadPreset("nonexistent-id");
      expect(loaded).toBeNull();
    });

    it("should return null if stored data is invalid JSON", () => {
      localStorage.setItem("preset_invalid", "invalid json");
      const loaded = loadPreset("invalid");
      expect(loaded).toBeNull();
    });
  });

  describe("deletePreset", () => {
    it("should delete a preset from localStorage", () => {
      const preset = createPreset("Test Preset", mockPresetState);
      savePreset(preset);

      deletePreset(preset.metadata.id);

      const stored = localStorage.getItem(`preset_${preset.metadata.id}`);
      expect(stored).toBeNull();
    });

    it("should remove preset from index", () => {
      const preset = createPreset("Test Preset", mockPresetState);
      savePreset(preset);

      deletePreset(preset.metadata.id);

      const index = localStorage.getItem("preset_index");
      const parsedIndex = JSON.parse(index!) as PresetListItem[];
      expect(parsedIndex).toHaveLength(0);
    });

    it("should not throw if preset does not exist", () => {
      expect(() => deletePreset("nonexistent-id")).not.toThrow();
    });
  });

  describe("listPresets", () => {
    it("should return empty array if no presets exist", () => {
      const list = listPresets();
      expect(list).toEqual([]);
    });

    it("should return list of preset metadata", () => {
      const preset1 = createPreset("Preset 1", mockPresetState);
      const preset2 = createPreset("Preset 2", mockPresetState);

      savePreset(preset1);
      savePreset(preset2);

      const list = listPresets();
      expect(list).toHaveLength(2);
      expect(list).toContainEqual({
        id: preset1.metadata.id,
        name: preset1.metadata.name,
        created: preset1.metadata.created,
      });
      expect(list).toContainEqual({
        id: preset2.metadata.id,
        name: preset2.metadata.name,
        created: preset2.metadata.created,
      });
    });

    it("should return sorted list by creation date (newest first)", () => {
      // Create presets with specific timestamps
      const preset1 = createPreset("Preset 1", mockPresetState);
      const preset2 = createPreset("Preset 2", mockPresetState);
      const preset3 = createPreset("Preset 3", mockPresetState);

      // Manually set different created dates
      preset1.metadata.created = "2024-01-01T00:00:00.000Z";
      preset2.metadata.created = "2024-01-03T00:00:00.000Z";
      preset3.metadata.created = "2024-01-02T00:00:00.000Z";

      savePreset(preset1);
      savePreset(preset2);
      savePreset(preset3);

      const list = listPresets();
      expect(list).toHaveLength(3);
      expect(list[0].id).toBe(preset2.metadata.id); // newest
      expect(list[1].id).toBe(preset3.metadata.id); // middle
      expect(list[2].id).toBe(preset1.metadata.id); // oldest
    });
  });

  describe("presetExists", () => {
    it("should return true if preset exists", () => {
      const preset = createPreset("Test Preset", mockPresetState);
      savePreset(preset);

      expect(presetExists(preset.metadata.id)).toBe(true);
    });

    it("should return false if preset does not exist", () => {
      expect(presetExists("nonexistent-id")).toBe(false);
    });
  });
});
