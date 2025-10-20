import { describe, it, expect } from "vitest";
import {
  encodePresetToUrl,
  decodePresetFromUrl,
  extractPresetFromUrl,
  isValidPresetUrl,
} from "./presetUrl";
import { createPreset } from "./presetSerializer";
import type { PresetState } from "../types/Preset";

describe("presetUrl", () => {
  const mockPresetState: PresetState = {
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
    bpm: 120,
  };

  describe("encodePresetToUrl", () => {
    it("should encode a preset to URL-safe base64 string", () => {
      const preset = createPreset("Test Preset", mockPresetState);
      const encoded = encodePresetToUrl(preset);

      expect(typeof encoded).toBe("string");
      expect(encoded.length).toBeGreaterThan(0);
      // Should not contain characters that need URL encoding
      expect(encoded).not.toMatch(/[+/=]/);
    });

    it("should produce consistent output for same preset", () => {
      const preset = createPreset("Test Preset", mockPresetState);
      const encoded1 = encodePresetToUrl(preset);
      const encoded2 = encodePresetToUrl(preset);

      expect(encoded1).toBe(encoded2);
    });

    it("should produce different output for different presets", () => {
      const preset1 = createPreset("Test Preset 1", mockPresetState);
      const preset2 = createPreset("Test Preset 2", mockPresetState);

      const encoded1 = encodePresetToUrl(preset1);
      const encoded2 = encodePresetToUrl(preset2);

      expect(encoded1).not.toBe(encoded2);
    });
  });

  describe("decodePresetFromUrl", () => {
    it("should decode a URL-encoded preset", () => {
      const preset = createPreset("Test Preset", mockPresetState);
      const encoded = encodePresetToUrl(preset);
      const decoded = decodePresetFromUrl(encoded);

      expect(decoded).toEqual(preset);
    });

    it("should throw error for invalid base64", () => {
      expect(() => decodePresetFromUrl("invalid!!!")).toThrow();
    });

    it("should throw error for valid base64 but invalid preset JSON", () => {
      const invalidJson = btoa("invalid json");
      const urlSafe = invalidJson
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");

      expect(() => decodePresetFromUrl(urlSafe)).toThrow();
    });

    it("should handle round-trip encoding/decoding", () => {
      const original = createPreset("Test Preset", mockPresetState);
      const encoded = encodePresetToUrl(original);
      const decoded = decodePresetFromUrl(encoded);

      expect(decoded).toEqual(original);
    });
  });

  describe("extractPresetFromUrl", () => {
    it("should extract preset from URL with preset parameter", () => {
      const preset = createPreset("Test Preset", mockPresetState);
      const encoded = encodePresetToUrl(preset);
      const url = `https://example.com/tone-drone/?preset=${encoded}`;

      const extracted = extractPresetFromUrl(url);
      expect(extracted).toEqual(preset);
    });

    it("should extract preset from URL with other parameters", () => {
      const preset = createPreset("Test Preset", mockPresetState);
      const encoded = encodePresetToUrl(preset);
      const url = `https://example.com/tone-drone/?foo=bar&preset=${encoded}&baz=qux`;

      const extracted = extractPresetFromUrl(url);
      expect(extracted).toEqual(preset);
    });

    it("should return null if URL has no preset parameter", () => {
      const url = "https://example.com/tone-drone/?foo=bar";
      const extracted = extractPresetFromUrl(url);
      expect(extracted).toBeNull();
    });

    it("should return null if preset parameter is invalid", () => {
      const url = "https://example.com/tone-drone/?preset=invalid";
      const extracted = extractPresetFromUrl(url);
      expect(extracted).toBeNull();
    });

    it("should handle URL without query string", () => {
      const url = "https://example.com/tone-drone/";
      const extracted = extractPresetFromUrl(url);
      expect(extracted).toBeNull();
    });

    it("should extract preset from current window location", () => {
      const preset = createPreset("Test Preset", mockPresetState);
      const encoded = encodePresetToUrl(preset);

      // Mock window.location
      const originalLocation = window.location;
      delete (window as { location?: Location }).location;
      (window as { location: Location }).location = {
        ...originalLocation,
        href: `https://example.com/tone-drone/?preset=${encoded}`,
      } as Location;

      const extracted = extractPresetFromUrl();
      expect(extracted).toEqual(preset);

      // Restore window.location
      (window as { location: Location }).location = originalLocation;
    });
  });

  describe("isValidPresetUrl", () => {
    it("should return true for valid preset URL", () => {
      const preset = createPreset("Test Preset", mockPresetState);
      const encoded = encodePresetToUrl(preset);
      const url = `https://example.com/?preset=${encoded}`;

      expect(isValidPresetUrl(url)).toBe(true);
    });

    it("should return false for URL without preset parameter", () => {
      const url = "https://example.com/?foo=bar";
      expect(isValidPresetUrl(url)).toBe(false);
    });

    it("should return false for URL with invalid preset", () => {
      const url = "https://example.com/?preset=invalid";
      expect(isValidPresetUrl(url)).toBe(false);
    });

    it("should return false for malformed URL", () => {
      expect(isValidPresetUrl("not a url")).toBe(false);
    });
  });
});
