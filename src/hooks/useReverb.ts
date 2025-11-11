import * as Tone from "tone";
import { useRef, useEffect, useState } from "react";

export function useReverb() {
  // Initialize with minimal decay (0.1s) for fast IR generation during page load.
  // The Reverb component will set actual values (decay: 2.5) shortly after.
  const reverb = useRef<Tone.Reverb>(
    new Tone.Reverb({
      decay: 0.1,
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
