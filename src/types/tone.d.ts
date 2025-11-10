/**
 * TypeScript declaration merging for Tone.js
 *
 * This file extends Tone.js type definitions to provide better type safety
 * and eliminate the need for type casting throughout the codebase.
 *
 * Uses TypeScript's declaration merging to augment the existing Tone.js types
 * with the properties and methods we actually use in the application.
 */

import * as Tone from 'tone';

/**
 * Helper type for Tone.js audio parameters with scheduling
 */
export interface ToneParam {
  value: number;
  cancelScheduledValues(time: number): ToneParam;
  setTargetAtTime(value: number, startTime: number, timeConstant: number): ToneParam;
  rampTo(value: number, rampTime: number, startTime?: number): ToneParam;
}

declare module 'tone' {
  /**
   * Filter - Biquad filter with frequency, Q, type, and rolloff controls
   */
  interface Filter {
    frequency: ToneParam;
    Q: ToneParam;
    type: BiquadFilterType;
    rolloff: Tone.FilterRollOff;
  }

  /**
   * LFO - Low Frequency Oscillator for modulation
   */
  interface LFO {
    frequency: ToneParam;
    amplitude: ToneParam;
    type: 'sine' | 'square' | 'triangle' | 'sawtooth';
    phase: number;
  }

  /**
   * Tremolo - Amplitude modulation effect
   */
  interface Tremolo {
    frequency: ToneParam;
    depth: ToneParam;
    type: ToneOscillatorType;
    spread: number;
  }

  /**
   * AutoPanner - Stereo panning effect
   */
  interface AutoPanner {
    frequency: ToneParam;
    depth: ToneParam;
    type?: ToneOscillatorType;
  }

  /**
   * BitCrusher - Bit depth reduction effect
   */
  interface BitCrusher {
    bits: ToneParam;
  }

  /**
   * Chebyshev - Waveshaping distortion
   */
  interface Chebyshev {
    order: number; // Note: not an AudioParam, just a number property
  }

  /**
   * FeedbackDelay - Delay effect with feedback control
   */
  interface FeedbackDelay {
    delayTime: ToneParam;
    feedback: ToneParam;
  }

  /**
   * Oscillator - Basic oscillator
   */
  interface Oscillator {
    frequency: ToneParam;
    detune: ToneParam;
    type: ToneOscillatorType;
  }

  /**
   * FatOscillator - Oscillator with multiple detuned voices
   */
  interface FatOscillator {
    frequency: ToneParam;
    detune: ToneParam;
    type: ToneOscillatorType;
    count: number;
    spread: number;
  }
}
