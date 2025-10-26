import { describe, it, expect } from "vitest";
import {
  midiToFrequency,
  frequencyToMidi,
  midiToNoteName,
  randomizeToScale,
  SCALE_PATTERNS,
  type ScaleType,
} from "./musicTheory";

describe("musicTheory", () => {
  describe("midiToFrequency", () => {
    it("should convert A4 (MIDI 69) to 440 Hz", () => {
      expect(midiToFrequency(69)).toBeCloseTo(440, 1);
    });

    it("should convert middle C (MIDI 60) to ~261.63 Hz", () => {
      expect(midiToFrequency(60)).toBeCloseTo(261.63, 2);
    });

    it("should convert C5 (MIDI 72) to ~523.25 Hz", () => {
      expect(midiToFrequency(72)).toBeCloseTo(523.25, 2);
    });

    it("should handle octave doubling correctly", () => {
      const c4 = midiToFrequency(60);
      const c5 = midiToFrequency(72);
      expect(c5 / c4).toBeCloseTo(2, 3);
    });

    it("should handle low frequencies", () => {
      const c1 = midiToFrequency(24);
      expect(c1).toBeCloseTo(32.7, 1);
    });

    it("should handle high frequencies", () => {
      const c8 = midiToFrequency(108);
      expect(c8).toBeCloseTo(4186.01, 1);
    });
  });

  describe("frequencyToMidi", () => {
    it("should convert 440 Hz to MIDI 69 (A4)", () => {
      expect(frequencyToMidi(440)).toBe(69);
    });

    it("should convert 261.63 Hz to MIDI 60 (middle C)", () => {
      expect(frequencyToMidi(261.63)).toBe(60);
    });

    it("should round to nearest MIDI note", () => {
      expect(frequencyToMidi(442)).toBe(69); // Close to A4
      expect(frequencyToMidi(466)).toBe(70); // A#4 is ~466.16 Hz
    });

    it("should be inverse of midiToFrequency", () => {
      const midiNote = 72; // C5
      const freq = midiToFrequency(midiNote);
      const backToMidi = frequencyToMidi(freq);
      expect(backToMidi).toBe(midiNote);
    });
  });

  describe("midiToNoteName", () => {
    it("should convert MIDI 60 to C4", () => {
      expect(midiToNoteName(60)).toBe("C4");
    });

    it("should convert MIDI 69 to A4", () => {
      expect(midiToNoteName(69)).toBe("A4");
    });

    it("should convert MIDI 61 to C#4", () => {
      expect(midiToNoteName(61)).toBe("C#4");
    });

    it("should handle octave changes correctly", () => {
      expect(midiToNoteName(48)).toBe("C3");
      expect(midiToNoteName(60)).toBe("C4");
      expect(midiToNoteName(72)).toBe("C5");
    });

    it("should handle all chromatic notes", () => {
      const octave4Notes = [
        "C4", "C#4", "D4", "D#4", "E4", "F4",
        "F#4", "G4", "G#4", "A4", "A#4", "B4"
      ];
      octave4Notes.forEach((noteName, index) => {
        expect(midiToNoteName(60 + index)).toBe(noteName);
      });
    });

    it("should handle low octaves", () => {
      expect(midiToNoteName(12)).toBe("C0");
      expect(midiToNoteName(0)).toBe("C-1");
    });

    it("should handle high octaves", () => {
      expect(midiToNoteName(108)).toBe("C8");
      expect(midiToNoteName(120)).toBe("C9");
    });
  });

  describe("SCALE_PATTERNS", () => {
    it("should have all expected scale types", () => {
      const expectedScales: ScaleType[] = [
        "Major",
        "Natural Minor",
        "Harmonic Minor",
        "Melodic Minor",
        "Pentatonic Major",
        "Pentatonic Minor",
        "Blues",
        "Dorian",
        "Phrygian",
        "Lydian",
        "Mixolydian",
        "Locrian",
        "Whole Tone",
        "Chromatic",
      ];

      expectedScales.forEach(scale => {
        expect(SCALE_PATTERNS[scale]).toBeDefined();
        expect(Array.isArray(SCALE_PATTERNS[scale])).toBe(true);
      });
    });

    it("should have all scales start with 0", () => {
      Object.values(SCALE_PATTERNS).forEach(pattern => {
        expect(pattern[0]).toBe(0);
      });
    });

    it("should have major scale pattern with 7 notes", () => {
      expect(SCALE_PATTERNS.Major).toEqual([0, 2, 4, 5, 7, 9, 11]);
    });

    it("should have pentatonic major pattern with 5 notes", () => {
      expect(SCALE_PATTERNS["Pentatonic Major"]).toEqual([0, 2, 4, 7, 9]);
    });

    it("should have chromatic scale with 12 notes", () => {
      expect(SCALE_PATTERNS.Chromatic.length).toBe(12);
      expect(SCALE_PATTERNS.Chromatic).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    });
  });

  describe("randomizeToScale", () => {
    it("should return correct number of frequencies", () => {
      const result = randomizeToScale(100, 500, 6);
      expect(result.frequencies).toHaveLength(6);
    });

    it("should return frequencies within specified bounds", () => {
      const minFreq = 200;
      const maxFreq = 400;
      const result = randomizeToScale(minFreq, maxFreq, 6);

      result.frequencies.forEach(freq => {
        expect(freq).toBeGreaterThanOrEqual(minFreq);
        expect(freq).toBeLessThanOrEqual(maxFreq);
      });
    });

    it("should return valid scale metadata", () => {
      const result = randomizeToScale(100, 500, 6);

      expect(result.scaleName).toMatch(/^[A-G]#?\s+/); // Starts with note name
      expect(result.rootNote).toMatch(/^[A-G]#?$/); // Valid note name
      expect(Object.keys(SCALE_PATTERNS)).toContain(result.scaleType);
    });

    it("should handle different count values", () => {
      const result3 = randomizeToScale(100, 500, 3);
      expect(result3.frequencies).toHaveLength(3);

      const result10 = randomizeToScale(100, 500, 10);
      expect(result10.frequencies).toHaveLength(10);
    });

    it("should use default count of 6 when not specified", () => {
      const result = randomizeToScale(100, 500);
      expect(result.frequencies).toHaveLength(6);
    });

    it("should handle narrow frequency ranges", () => {
      const result = randomizeToScale(440, 450, 6);

      result.frequencies.forEach(freq => {
        expect(freq).toBeGreaterThanOrEqual(440);
        expect(freq).toBeLessThanOrEqual(450);
      });
    });

    it("should handle wide frequency ranges", () => {
      const result = randomizeToScale(30, 1000, 6);

      result.frequencies.forEach(freq => {
        expect(freq).toBeGreaterThanOrEqual(30);
        expect(freq).toBeLessThanOrEqual(1000);
      });
    });

    it("should generate different results on multiple calls", () => {
      const result1 = randomizeToScale(100, 500, 6);
      const result2 = randomizeToScale(100, 500, 6);

      // Extremely unlikely to be identical (but possible, so we check multiple properties)
      const identical =
        JSON.stringify(result1.frequencies) === JSON.stringify(result2.frequencies) &&
        result1.scaleName === result2.scaleName;

      // This test might occasionally fail due to randomness, but it's very unlikely
      // If it fails frequently, the randomization might not be working
      expect(identical).toBe(false);
    });

    it("should handle edge case of very small range", () => {
      const result = randomizeToScale(440, 441, 6);

      // All frequencies should be very close
      result.frequencies.forEach(freq => {
        expect(freq).toBeGreaterThanOrEqual(440);
        expect(freq).toBeLessThanOrEqual(441);
      });
    });

    it("should return frequencies that match the selected scale", () => {
      const result = randomizeToScale(200, 800, 6);

      // Convert frequencies to MIDI notes
      const midiNotes = result.frequencies.map(frequencyToMidi);
      const scalePattern = SCALE_PATTERNS[result.scaleType];
      const rootNoteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
      const rootIndex = rootNoteNames.indexOf(result.rootNote);

      // Each MIDI note modulo 12 should match (rootIndex + scaleInterval) modulo 12
      midiNotes.forEach(midi => {
        const noteInOctave = midi % 12;
        const offsetFromRoot = (noteInOctave - rootIndex + 12) % 12;
        expect(scalePattern).toContain(offsetFromRoot);
      });
    });

    it("should handle very low frequency ranges", () => {
      // Even extremely low frequencies should generate valid scale notes
      const result = randomizeToScale(20, 25, 6);

      expect(result.frequencies).toHaveLength(6);
      result.frequencies.forEach(freq => {
        expect(freq).toBeGreaterThanOrEqual(20);
        expect(freq).toBeLessThanOrEqual(25);
      });
    });
  });
});
