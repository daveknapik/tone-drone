import * as Tone from "tone";

export interface OscillatorWithChannel {
  oscillator: Tone.Oscillator;
  channel: Tone.Channel;
}
