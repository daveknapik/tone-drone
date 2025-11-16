import * as Tone from "tone";
import type { GristleizerEffect } from "../hooks/useGristleizer";

export type AudioEffect =
  | Tone.AutoFilter
  | Tone.AutoPanner
  | Tone.AutoWah
  | Tone.BitCrusher
  | Tone.Chebyshev
  | Tone.Chorus
  | Tone.Compressor
  | Tone.Distortion
  | Tone.FeedbackDelay
  | Tone.Filter
  | Tone.Freeverb
  | Tone.FrequencyShifter
  | Tone.JCReverb
  | Tone.Phaser
  | Tone.PingPongDelay
  | Tone.PitchShift
  | Tone.StereoWidener
  | Tone.Tremolo
  | Tone.Vibrato
  | GristleizerEffect;
