import * as Tone from "tone";
import { useRef } from "react";

export function useChebyshev() {
  const chebyshev = useRef<Tone.Chebyshev>(
    new Tone.Chebyshev({
      order: 1,
      wet: 0,
    })
  );

  return chebyshev;
}
