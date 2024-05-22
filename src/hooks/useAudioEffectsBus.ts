/* 
  Creates an audio effects bus (Tone.Channel)
  and chains the audio effects passed in as an array to it, and then to the Tone.Destination.
  This is useful for receivings audio sources (e.g., oscillators) at an effects bus

  The bus is then returned as a ref.
 */

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
