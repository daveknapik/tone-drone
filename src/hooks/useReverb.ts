import * as Tone from "tone";
import { useRef, useEffect, useState } from "react";

export function useReverb() {
  const reverb = useRef<Tone.Reverb>(
    new Tone.Reverb({
      decay: 2.5,
      preDelay: 0.01,
      wet: 0,
    })
  );

  const [isReady, setIsReady] = useState(false);

  // Handle async initialization
  useEffect(() => {
    const initReverb = async () => {
      await reverb.current.ready;
      setIsReady(true);
    };
    initReverb();
  }, []);

  return { reverb, isReady };
}
