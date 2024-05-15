import * as Tone from "tone";
import { useEffect, useRef } from "react";

export function useAudioEffectsBus() {
  const mainAudioEffectsBus = useRef<Tone.Channel>(
    new Tone.Channel({ volume: -5 })
  );

  useEffect(() => {
    mainAudioEffectsBus.current.receive("mainAudioEffectsBus");
  }, []);

  return mainAudioEffectsBus;
}
