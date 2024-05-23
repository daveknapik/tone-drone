import * as Tone from "tone";
import { useEffect, useRef, MutableRefObject } from "react";

export function useAutoFilter() {
  const filter = useRef<Tone.AutoFilter>(
    null
  ) as MutableRefObject<Tone.AutoFilter>;

  useEffect(() => {
    filter.current = new Tone.AutoFilter({
      baseFrequency: 300,
      octaves: 1,
      frequency: 4,
      type: "sine",
      depth: 1,
      wet: 1,
    }).start();

    filter.current.set({ filter: { type: "highpass" } });

    return () => {
      filter.current.dispose();
    };
  }, []);

  return filter;
}
