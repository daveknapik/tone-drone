import * as Tone from "tone";
import { useEffect, useRef } from "react";
import { AudioEffect } from "../types/AudioEffect";

export function useAudioEffectsBus(audioEffects: AudioEffect[]) {
  const mainAudioEffectsBus = useRef<Tone.Channel>(
    new Tone.Channel({ volume: -20, channelCount: 2 })
  );

  useEffect(() => {
    mainAudioEffectsBus.current.receive("mainAudioEffectsBus");
  }, []);

  mainAudioEffectsBus.current.chain(...audioEffects, Tone.getDestination());

  return mainAudioEffectsBus;
}
