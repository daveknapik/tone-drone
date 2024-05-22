import * as Tone from "tone";
import { useCallback, useEffect, useRef } from "react";
import { AudioEffect } from "../types/AudioEffect";

export function useAudioEffectsBus(
  busName: string,
  audioEffects: AudioEffect[]
) {
  const mainAudioEffectsBus = useRef<Tone.Channel>(
    new Tone.Channel({ volume: -10, channelCount: 2 })
  );

  const updateAudioEffects = useCallback(() => {
    mainAudioEffectsBus.current.receive(busName);
    mainAudioEffectsBus.current.chain(...audioEffects, Tone.getDestination());
  }, [audioEffects, busName]);

  useEffect(() => {
    updateAudioEffects();
  }, [updateAudioEffects]);

  return mainAudioEffectsBus;
}
