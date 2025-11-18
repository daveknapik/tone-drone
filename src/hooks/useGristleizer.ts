import * as Tone from "tone";
import { useRef } from "react";

/**
 * Custom Gristleizer effect inspired by the legendary Throbbing Gristle VCA/VCF
 *
 * Simple implementation using Tone.AutoFilter which can handle both:
 * - VCA mode: Low depth, fast modulation (tremolo-like)
 * - VCF mode: High depth, filter sweep (wah-like)
 */
export function useGristleizer() {
  const gristleizer = useRef<Tone.AutoFilter>(
    new Tone.AutoFilter({
      frequency: 4,
      depth: 0,
      type: "sine",
      baseFrequency: 200,
      octaves: 2.6,
      wet: 0,
      filter: {
        type: "bandpass",
        rolloff: -12,
        Q: 1,
      },
    }).start()
  );

  return gristleizer;
}
