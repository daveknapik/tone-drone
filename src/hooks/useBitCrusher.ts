import * as Tone from "tone";
import { useRef } from "react";

export function useBitCrusher() {
  const bitCrusher = useRef<Tone.BitCrusher>(
    new Tone.BitCrusher({
      bits: 5,
    })
  );

  return bitCrusher;
}
