import * as Tone from "tone";
import { useRef, useState, useCallback } from "react";

export function useReverb() {
  // Gate creation to first actual use (manual control or modulation).
  const reverb = useRef<Tone.Reverb | null>(null);

  const [isReady, setIsReady] = useState(false);

  // Create immediately if missing; returns the instance without awaiting IR readiness.
  const ensureCreated = useCallback((): Tone.Reverb => {
    if (reverb.current) return reverb.current;
    reverb.current = new Tone.Reverb({
      // Extremely small defaults to minimize initial IR cost; UI applies real values later.
      decay: 0.01,
      preDelay: 0.01,
      wet: 0,
    });
    // Kick off readiness in background; not blocking the caller.
    reverb.current.ready
      .then(() => setIsReady(true))
      .catch(() => {
        /* best-effort only */
      });
    return reverb.current;
  }, []);

  return { reverb, isReady, ensureCreated };
}
