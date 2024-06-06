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
  recorder: Tone.Recorder,
  audioEffects: (AudioEffect | null)[]
) {
  const mainAudioEffectsBus = useRef<Tone.Channel>(
    new Tone.Channel({ volume: -10, channelCount: 2 })
  );

  const updateAudioEffects = useCallback(() => {
    if (!audioEffects.includes(null)) {
      mainAudioEffectsBus.current.chain(
        ...(audioEffects as AudioEffect[]),
        Tone.getDestination(),
        recorder
      );
    }
  }, [audioEffects, recorder]);

  useEffect(() => {
    updateAudioEffects();
  }, [updateAudioEffects]);

  return mainAudioEffectsBus;
}
