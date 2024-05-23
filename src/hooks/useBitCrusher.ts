import * as Tone from "tone";
import { useEffect, useRef, MutableRefObject } from "react";

export function useBitCrusher() {
  const bitCrusher = useRef<Tone.BitCrusher>(
    null
  ) as MutableRefObject<Tone.BitCrusher>;

  useEffect(() => {
    bitCrusher.current = new Tone.BitCrusher({
      bits: 5,
    });

    return () => {
      bitCrusher.current.dispose();
    };
  }, []);

  return bitCrusher;
}
