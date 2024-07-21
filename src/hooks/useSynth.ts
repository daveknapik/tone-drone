import * as Tone from "tone";

import { useRef } from "react";

export function useSynth(): Tone.Synth {
  const synth = useRef<Tone.Synth>(new Tone.Synth().toDestination());

  return synth.current;
}
