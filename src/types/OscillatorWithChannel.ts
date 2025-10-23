import * as Tone from "tone";
import { OscillatorType } from "./OscillatorParams";

export interface OscillatorWithChannel {
  oscillator: Tone.Oscillator | Tone.FatOscillator;
  channel: Tone.Channel;
  type: OscillatorType;
}
