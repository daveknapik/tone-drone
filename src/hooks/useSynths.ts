import * as Tone from "tone";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { SynthWithPanner } from "../types/SynthWithPanner";

export function useSynths(
  synthCount = 6
): [SynthWithPanner[], Dispatch<SetStateAction<SynthWithPanner[]>>] {
  const [synths, setSynths] = useState<SynthWithPanner[]>([]);

  useEffect(() => {
    const newSynths: SynthWithPanner[] = [];

    for (let i = 0; i < synthCount; i++) {
      const synth = new Tone.Synth();
      const panner = new Tone.Panner();

      synth.connect(panner);

      newSynths.push({ synth, panner });
    }

    setSynths(newSynths);

    return () => {
      newSynths.forEach(({ synth, panner }) => {
        synth.dispose();
        panner.dispose();
      });

      setSynths([]);
    };
  }, [synthCount]);

  return [synths, setSynths];
}
