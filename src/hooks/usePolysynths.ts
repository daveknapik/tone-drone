import * as Tone from "tone";

import { useEffect, useState } from "react";

export function usePolysynths(polysynthCount = 2): Tone.PolySynth[] {
  const [polysynths, setPolysynths] = useState<Tone.PolySynth[]>([]);

  useEffect(() => {
    const newPolysynths: Tone.PolySynth[] = [];

    // Create the synths
    for (let i = 0; i < polysynthCount; i++) {
      const polysynth = new Tone.PolySynth();
      newPolysynths.push(polysynth);
    }

    setPolysynths(newPolysynths);

    return () => {
      newPolysynths.forEach((polysynth) => {
        polysynth.dispose();
      });

      setPolysynths([]);
    };
  }, [polysynthCount]);

  return polysynths;
}
