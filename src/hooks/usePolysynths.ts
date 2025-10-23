import * as Tone from "tone";

import { useEffect, useState } from "react";
import { PolySynthWithPanner } from "../types/PolySynthWithPanner";

export function usePolysynths(polysynthCount = 2): PolySynthWithPanner[] {
  const [polysynths, setPolysynths] = useState<PolySynthWithPanner[]>([]);

  useEffect(() => {
    const newPolysynths: PolySynthWithPanner[] = [];

    // Create the synths with panners
    for (let i = 0; i < polysynthCount; i++) {
      const polysynth = new Tone.PolySynth();
      const panner = new Tone.Panner();

      // Connect polysynth to panner
      polysynth.connect(panner);

      newPolysynths.push({ polysynth, panner });
    }

    setPolysynths(newPolysynths);

    return () => {
      newPolysynths.forEach(({ polysynth, panner }) => {
        polysynth.dispose();
        panner.dispose();
      });

      setPolysynths([]);
    };
  }, [polysynthCount]);

  return polysynths;
}
