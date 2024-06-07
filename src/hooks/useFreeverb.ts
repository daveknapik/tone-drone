import * as Tone from "tone";
import { useRef } from "react";

export function useFreeverb() {
  const freeverb = useRef<Tone.Freeverb>(
    new Tone.Freeverb({
      dampening: 1000,
      roomSize: 0.95,
      wet: 0,
    })
  );

  return freeverb;
}
