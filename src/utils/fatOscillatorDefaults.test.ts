import { describe, it, expect } from "vitest";
import { getFatDefaults, FAT_OSCILLATOR_DEFAULTS } from "./fatOscillatorDefaults";

describe("fatOscillatorDefaults", () => {
  describe("FAT_OSCILLATOR_DEFAULTS", () => {
    it("should have defaults for all 4 waveforms", () => {
      expect(FAT_OSCILLATOR_DEFAULTS).toHaveProperty("sine");
      expect(FAT_OSCILLATOR_DEFAULTS).toHaveProperty("square");
      expect(FAT_OSCILLATOR_DEFAULTS).toHaveProperty("triangle");
      expect(FAT_OSCILLATOR_DEFAULTS).toHaveProperty("sawtooth");
    });

    it("should have valid count values (2-10)", () => {
      Object.values(FAT_OSCILLATOR_DEFAULTS).forEach((defaults) => {
        expect(defaults.count).toBeGreaterThanOrEqual(2);
        expect(defaults.count).toBeLessThanOrEqual(10);
      });
    });

    it("should have valid spread values (0-100)", () => {
      Object.values(FAT_OSCILLATOR_DEFAULTS).forEach((defaults) => {
        expect(defaults.spread).toBeGreaterThanOrEqual(0);
        expect(defaults.spread).toBeLessThanOrEqual(100);
      });
    });

    it("should have sawtooth with highest spread for supersaw effect", () => {
      const spreads = Object.entries(FAT_OSCILLATOR_DEFAULTS).map(([waveform, defaults]) => ({
        waveform,
        spread: defaults.spread,
      }));
      const maxSpread = Math.max(...spreads.map((s) => s.spread));
      const sawtoothSpread = FAT_OSCILLATOR_DEFAULTS.sawtooth.spread;
      expect(sawtoothSpread).toBe(maxSpread);
    });
  });

  describe("getFatDefaults", () => {
    it("should return sine defaults for sine waveform", () => {
      const defaults = getFatDefaults("sine");
      expect(defaults).toEqual(FAT_OSCILLATOR_DEFAULTS.sine);
    });

    it("should return sawtooth defaults for sawtooth waveform", () => {
      const defaults = getFatDefaults("sawtooth");
      expect(defaults).toEqual(FAT_OSCILLATOR_DEFAULTS.sawtooth);
    });

    it("should return square defaults for square waveform", () => {
      const defaults = getFatDefaults("square");
      expect(defaults).toEqual(FAT_OSCILLATOR_DEFAULTS.square);
    });

    it("should return triangle defaults for triangle waveform", () => {
      const defaults = getFatDefaults("triangle");
      expect(defaults).toEqual(FAT_OSCILLATOR_DEFAULTS.triangle);
    });

    it("should fall back to sine defaults for unknown waveform", () => {
      const defaults = getFatDefaults("unknown");
      expect(defaults).toEqual(FAT_OSCILLATOR_DEFAULTS.sine);
    });

    it("should fall back to sine defaults for empty string", () => {
      const defaults = getFatDefaults("");
      expect(defaults).toEqual(FAT_OSCILLATOR_DEFAULTS.sine);
    });
  });
});
