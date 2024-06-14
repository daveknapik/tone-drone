import * as Tone from "tone";
import { useRef } from "react";

export function useFilter() {
  const filter = useRef<Tone.Filter>(
    new Tone.Filter({
      frequency: 300,
      rolloff: -12,
      Q: 1,
      type: "highpass",
    })
  );

  return filter;
}
