/**
 * Music theory utilities for frequency and scale calculations
 */

/**
 * Scale definitions as semitone intervals from root note
 * Each array represents the semitone offsets within one octave
 */
export const SCALE_PATTERNS = {
  // Western Classical Scales
  "Major": [0, 2, 4, 5, 7, 9, 11],
  "Natural Minor": [0, 2, 3, 5, 7, 8, 10],
  "Harmonic Minor": [0, 2, 3, 5, 7, 8, 11],
  "Melodic Minor": [0, 2, 3, 5, 7, 9, 11],
  "Harmonic Major": [0, 2, 4, 5, 7, 8, 11],

  // Western Pentatonic Scales
  "Pentatonic Major": [0, 2, 4, 7, 9],
  "Pentatonic Minor": [0, 3, 5, 7, 10],
  "Blues": [0, 3, 5, 6, 7, 10],

  // Church Modes
  "Dorian": [0, 2, 3, 5, 7, 9, 10],
  "Phrygian": [0, 1, 3, 5, 7, 8, 10],
  "Lydian": [0, 2, 4, 6, 7, 9, 11],
  "Mixolydian": [0, 2, 4, 5, 7, 9, 10],
  "Locrian": [0, 1, 3, 5, 6, 8, 10],

  // Melodic Minor Modes
  "Lydian Dominant": [0, 2, 4, 6, 7, 9, 10],
  "Lydian Augmented": [0, 2, 4, 6, 8, 9, 11],
  "Dorian ♯4": [0, 2, 3, 6, 7, 9, 10],

  // Jazz & Advanced Harmony Scales
  "Altered Scale": [0, 1, 3, 4, 6, 8, 10],
  "Diminished (W-H)": [0, 2, 3, 5, 6, 8, 9, 11],
  "Diminished (H-W)": [0, 1, 3, 4, 6, 7, 9, 10],
  "Augmented": [0, 3, 4, 7, 8, 11],

  // Exotic/World Scales
  "Phrygian Dominant": [0, 1, 4, 5, 7, 8, 10],
  "Hungarian Minor": [0, 2, 3, 6, 7, 8, 11],
  "Double Harmonic": [0, 1, 4, 5, 7, 8, 11],
  "Enigmatic": [0, 1, 4, 6, 8, 10, 11],
  "Spanish 8-Tone": [0, 1, 3, 4, 5, 7, 8, 10],

  // Japanese Pentatonic Scales
  "Hirajoshi": [0, 2, 3, 7, 8],
  "In Sen": [0, 1, 5, 7, 10],
  "Iwato": [0, 1, 5, 6, 10],
  "Kumoi": [0, 2, 3, 7, 9],
  "Yo": [0, 2, 5, 7, 9],

  // Other World Scales
  "Balinese": [0, 1, 3, 7, 8],
  "Egyptian": [0, 2, 5, 7, 10],

  // Symmetric Scales
  "Whole Tone": [0, 2, 4, 6, 8, 10],
  "Chromatic": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
} as const;

export type ScaleType = keyof typeof SCALE_PATTERNS;

/**
 * Scale categories for organizing scales in UI
 */
export const SCALE_CATEGORIES = {
  "Western Classical": [
    "Major",
    "Natural Minor",
    "Harmonic Minor",
    "Melodic Minor",
    "Harmonic Major",
  ],
  "Western Pentatonic": ["Pentatonic Major", "Pentatonic Minor", "Blues"],
  "Church Modes": ["Dorian", "Phrygian", "Lydian", "Mixolydian", "Locrian"],
  "Melodic Minor Modes": ["Lydian Dominant", "Lydian Augmented", "Dorian ♯4"],
  "Jazz & Advanced Harmony": [
    "Altered Scale",
    "Diminished (W-H)",
    "Diminished (H-W)",
    "Augmented",
  ],
  "Exotic/World": [
    "Phrygian Dominant",
    "Hungarian Minor",
    "Double Harmonic",
    "Enigmatic",
    "Spanish 8-Tone",
  ],
  "Japanese Pentatonic": ["Hirajoshi", "In Sen", "Iwato", "Kumoi", "Yo"],
  "Other World": ["Balinese", "Egyptian"],
  "Symmetric": ["Whole Tone", "Chromatic"],
} as const satisfies Record<string, readonly ScaleType[]>;

export type ScaleCategory = keyof typeof SCALE_CATEGORIES;

/**
 * Note names for chromatic scale
 */
const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;

/**
 * Converts MIDI note number to frequency in Hz
 * Formula: f = 440 × 2^((n-69)/12)
 * Where n is MIDI note number, 69 = A4 = 440 Hz
 *
 * @param midiNote - MIDI note number (0-127, where 60 = middle C)
 * @returns Frequency in Hz
 */
export function midiToFrequency(midiNote: number): number {
  return 440 * Math.pow(2, (midiNote - 69) / 12);
}

/**
 * Converts frequency to nearest MIDI note number
 * Inverse of midiToFrequency
 *
 * @param frequency - Frequency in Hz
 * @returns MIDI note number
 */
export function frequencyToMidi(frequency: number): number {
  return Math.round(69 + 12 * Math.log2(frequency / 440));
}

/**
 * Gets note name from MIDI note number
 *
 * @param midiNote - MIDI note number
 * @returns Note name with octave (e.g., "C4", "A#5")
 */
export function midiToNoteName(midiNote: number): string {
  const octave = Math.floor(midiNote / 12) - 1;
  const noteIndex = midiNote % 12;
  return `${NOTE_NAMES[noteIndex]}${octave}`;
}

/**
 * Generates all possible MIDI notes for a given scale and root within a frequency range
 *
 * @param rootNote - Root note as MIDI note number modulo 12 (0 = C, 1 = C#, etc.)
 * @param scalePattern - Array of semitone intervals defining the scale
 * @param minFreq - Minimum frequency in Hz
 * @param maxFreq - Maximum frequency in Hz
 * @returns Array of MIDI note numbers within the frequency range
 */
function getScaleNotesInRange(
  rootNote: number,
  scalePattern: readonly number[],
  minFreq: number,
  maxFreq: number
): number[] {
  const notes: number[] = [];

  // Convert frequency bounds to MIDI notes
  const minMidi = frequencyToMidi(minFreq);
  const maxMidi = frequencyToMidi(maxFreq);

  // Start from octave that contains minMidi
  const startOctave = Math.floor(minMidi / 12);
  const endOctave = Math.floor(maxMidi / 12);

  // Generate notes across all octaves in range
  for (let octave = startOctave; octave <= endOctave + 1; octave++) {
    for (const interval of scalePattern) {
      const midiNote = octave * 12 + rootNote + interval;
      const freq = midiToFrequency(midiNote);

      if (freq >= minFreq && freq <= maxFreq) {
        notes.push(midiNote);
      }
    }
  }

  return notes.sort((a, b) => a - b);
}

/**
 * Result of randomizing oscillator frequencies to a musical scale
 */
export interface RandomizeToScaleResult {
  frequencies: number[];
  scaleName: string;
  rootNote: string;
  scaleType: ScaleType;
}

/**
 * Randomly assigns frequencies from a musical scale
 *
 * @param minFreq - Minimum frequency bound in Hz
 * @param maxFreq - Maximum frequency bound in Hz
 * @param count - Number of frequencies to generate (default: 6)
 * @returns Object containing frequency array and scale metadata
 */
export function randomizeToScale(
  minFreq: number,
  maxFreq: number,
  count = 6
): RandomizeToScaleResult {
  // Pick random scale type
  const scaleTypes = Object.keys(SCALE_PATTERNS) as ScaleType[];
  const scaleType = scaleTypes[Math.floor(Math.random() * scaleTypes.length)];
  const scalePattern = SCALE_PATTERNS[scaleType];

  // Pick random root note (0-11)
  const rootNoteIndex = Math.floor(Math.random() * 12);
  const rootNote = NOTE_NAMES[rootNoteIndex];

  // Generate all available notes in the frequency range
  const availableNotes = getScaleNotesInRange(
    rootNoteIndex,
    scalePattern,
    minFreq,
    maxFreq
  );

  // If we don't have enough notes, fall back to repeating available notes
  if (availableNotes.length === 0) {
    // Fallback: use the middle of the range
    const middleFreq = (minFreq + maxFreq) / 2;
    return {
      frequencies: Array(count).fill(middleFreq) as number[],
      scaleName: `${rootNote} ${scaleType}`,
      rootNote,
      scaleType,
    };
  }

  // Randomly select 'count' notes (allowing duplicates)
  const selectedNotes: number[] = [];
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * availableNotes.length);
    selectedNotes.push(availableNotes[randomIndex]);
  }

  // Convert to frequencies
  const frequencies = selectedNotes.map(midiToFrequency);

  return {
    frequencies,
    scaleName: `${rootNote} ${scaleType}`,
    rootNote,
    scaleType,
  };
}
