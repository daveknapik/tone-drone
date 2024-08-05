import * as Tone from "tone";

import { useEffect, useState } from "react";

export function useSynths(synthCount = 6): [Tone.Synth[], Tone.Panner[]] {
  const [synths, setSynths] = useState<Tone.Synth[]>([]);
  const [panners, setPanners] = useState<Tone.Panner[]>([]);

  useEffect(() => {
    const newSynths: Tone.Synth[] = [];
    const newPanners: Tone.Panner[] = [];

    for (let i = 0; i < synthCount; i++) {
      const synth = new Tone.Synth();
      const panner = new Tone.Panner();

      synth.connect(panner);

      newSynths.push(synth);
      newPanners.push(panner);
    }

    setSynths(newSynths);
    setPanners(newPanners);

    return () => {
      newSynths.forEach((synth) => {
        synth.dispose();
      });

      newPanners.forEach((panner) => {
        panner.dispose();
      });

      setSynths([]);
      setPanners([]);
    };
  }, [synthCount]);

  return [synths, panners];
}
