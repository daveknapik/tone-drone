import * as Tone from "tone";
import { useEffect, useRef } from "react";

export function useAutoFilter() {
  const filter = useRef<Tone.AutoFilter>(
    new Tone.AutoFilter({
      baseFrequency: 300,
      octaves: 1,
      frequency: 4,
      type: "sine",
      depth: 1,
      wet: 1,
    }).start()
  );

  useEffect(() => {
    filter.current.set({ filter: { type: "highpass" } });
  }, []);

  return filter;
}
