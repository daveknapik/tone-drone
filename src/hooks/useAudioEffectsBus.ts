/* 
  Creates an audio effects bus (Tone.Channel)
  and chains the audio effects passed in as an array to it, and then to the Tone.Destination.
  This is useful for receivings audio sources (e.g., oscillators) at an effects bus

  The bus is then returned as a ref.
 */

import * as Tone from "tone";
import { useCallback, useEffect, useRef } from "react";
import { AudioEffect } from "../types/AudioEffect";

export function useAudioEffectsBus(audioEffects: AudioEffect[]) {
  const mainAudioEffectsBus = useRef<Tone.Channel>(
    new Tone.Channel({ volume: -10, channelCount: 2 })
  );

  const updateAudioEffects = useCallback(() => {
    // mainAudioEffectsBus.current.disconnect();

    for (let i = 0; i < audioEffects.length; i++) {
      if (i === 0) {
        mainAudioEffectsBus.current.connect(audioEffects[i]);
      } else {
        audioEffects[i - 1]?.connect(audioEffects[i]);
      }
    }
    audioEffects[audioEffects.length - 1]?.connect(Tone.getDestination());

    // mainAudioEffectsBus.current.chain(
    //   ...(audioEffects as AudioEffect[]),
    //   Tone.getDestination(),
    //   recorder
    // );
  }, [audioEffects]);

  useEffect(() => {
    updateAudioEffects();
  }, [updateAudioEffects]);

  return mainAudioEffectsBus;
}
