import * as Tone from "tone";
import { useRef } from "react";

export function useReverb() {
  const reverb = useRef<Tone.Reverb>(
    new Tone.Reverb({
      decay: 1.5,
      preDelay: 0.01,
      wet: 0,
    })
  );

  return reverb;
}
