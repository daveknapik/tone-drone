import * as Tone from "tone";

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
  | Tone.Freeverb
  | Tone.FrequencyShifter
  | Tone.JCReverb
  | Tone.Phaser
  | Tone.PingPongDelay
  | Tone.PitchShift
  | Tone.Reverb
  | Tone.StereoWidener
  | Tone.Tremolo
  | Tone.Vibrato;
