import * as Tone from "tone";
import { useRef } from "react";

export function useReverb() {
  const reverb = useRef<Tone.Freeverb>(
    new Tone.Freeverb({
      dampening: 1000,
      roomSize: 0.5,
      wet: 1,
    })
  );

  return reverb;
}
