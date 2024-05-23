import * as Tone from "tone";
import { useEffect, useRef, MutableRefObject } from "react";

export function useReverb() {
  const reverb = useRef<Tone.Freeverb>(null) as MutableRefObject<Tone.Freeverb>;

  useEffect(() => {
    reverb.current = new Tone.Freeverb({
      dampening: 1000,
      roomSize: 0.95,
      wet: 0,
    });

    return () => {
      reverb.current.dispose();
    };
  }, []);

  return reverb;
}
