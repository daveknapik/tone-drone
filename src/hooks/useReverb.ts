import * as Tone from "tone";
import { useRef, useState, useEffect } from "react";
import type { ReverbParams } from "../types/ReverbParams";

interface UseReverbOptions {
  /**
   * Initial reverb parameters. Defaults optimize for fast page load:
   * - decay: 0.1s (minimal IR generation time)
   * - preDelay: 0.01s
   * - wet: 0 (inaudible during initialization)
   * Component will apply actual values after mount.
   */
  initialParams?: Partial<ReverbParams>;
}

export function useReverb(options: UseReverbOptions = {}) {
  const { initialParams } = options;

  // Create reverb immediately on mount with fast initialization defaults
  const reverb = useRef<Tone.Reverb>(
    new Tone.Reverb({
      decay: initialParams?.decay ?? 0.1, // Fast IR generation
      preDelay: initialParams?.preDelay ?? 0.01,
      wet: initialParams?.wet ?? 0, // Inaudible during init
    })
  );

  const [isReady, setIsReady] = useState(false);

  // Track IR readiness in background
  useEffect(() => {
    reverb.current.ready
      .then(() => setIsReady(true))
      .catch(() => {
        /* best-effort only */
      });

    // NOTE: No cleanup/disposal here - following pattern of other effect hooks
    // The parent component manages lifecycle of all audio effects
  }, []);

  return { reverb, isReady };
}
