import * as Tone from "tone";
import { useEffect, useRef, MutableRefObject } from "react";

export function useChebyshev() {
  const chebyshev = useRef<Tone.Chebyshev>(
    null
  ) as MutableRefObject<Tone.Chebyshev>;

  useEffect(() => {
    chebyshev.current = new Tone.Chebyshev({
      order: 1,
      wet: 0,
    });

    return () => {
      chebyshev.current.dispose();
    };
  }, []);

  return chebyshev;
}
