/*
  Creates an audio effects bus (Tone.Channel)
  and chains the audio effects passed in as an array to it, and then to the Tone.Destination.
  This is useful for receivings audio sources (e.g., oscillators) at an effects bus

  The bus is then returned as a ref.
 */

import * as Tone from "tone";
import { useCallback, useEffect, useRef } from "react";
import { AudioEffect } from "../types/AudioEffect";
import type { GristleizerEffect } from "./useGristleizer";

// Type guard to check if an effect is a custom effect with input/output (like Gristleizer)
function isCustomEffect(effect: AudioEffect): effect is GristleizerEffect {
  return (
    effect !== null &&
    typeof effect === "object" &&
    "input" in effect &&
    "output" in effect
  );
}

export function useAudioEffectsBus(audioEffects: AudioEffect[]) {
  const mainAudioEffectsBus = useRef<Tone.Channel>(
    new Tone.Channel({ volume: -15, channelCount: 2 })
  );

  const updateAudioEffects = useCallback(() => {
    // Disconnect all effects first to avoid stacking connections
    mainAudioEffectsBus.current.disconnect();

    for (const effect of audioEffects) {
      if (effect) {
        if (isCustomEffect(effect)) {
          effect.input.disconnect();
          effect.output.disconnect();
        } else if (effect instanceof Tone.ToneAudioNode) {
          effect.disconnect();
        }
      }
    }

    // Manually chain effects to handle custom effects with input/output properties
    let currentNode: Tone.ToneAudioNode = mainAudioEffectsBus.current;

    for (const effect of audioEffects) {
      if (isCustomEffect(effect)) {
        // Custom effect: connect current node to effect's input
        currentNode.connect(effect.input);
        // Set current node to effect's output for next connection
        currentNode = effect.output;
      } else if (effect instanceof Tone.ToneAudioNode) {
        // Standard Tone.js effect: connect directly
        currentNode.connect(effect);
        currentNode = effect;
      }
    }

    // Connect the final node to destination
    currentNode.toDestination();
  }, [audioEffects]);

  useEffect(() => {
    updateAudioEffects();
  }, [updateAudioEffects]);

  return mainAudioEffectsBus;
}
