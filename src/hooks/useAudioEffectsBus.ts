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
  const mainAudioEffectsBus = useRef<Tone.Channel | null>(null);

  // Lazy initialization: create bus only when needed (handles StrictMode remounting)
  mainAudioEffectsBus.current ??= new Tone.Channel({ volume: -15, channelCount: 2 });

  const updateAudioEffects = useCallback(() => {
    const bus = mainAudioEffectsBus.current;

    // Check if main bus is disposed before proceeding
    if (!bus || bus.disposed) {
      return;
    }

    // Disconnect all effects first to avoid stacking connections
    bus.disconnect();

    for (const effect of audioEffects) {
      if (effect) {
        if (isCustomEffect(effect)) {
          // Only disconnect if not disposed
          if (!effect.input.disposed) effect.input.disconnect();
          if (!effect.output.disposed) effect.output.disconnect();
        } else if (effect instanceof Tone.ToneAudioNode) {
          // Only disconnect if not disposed
          if (!effect.disposed) effect.disconnect();
        }
      }
    }

    // Manually chain effects to handle custom effects with input/output properties
    let currentNode: Tone.ToneAudioNode = bus;

    for (const effect of audioEffects) {
      if (isCustomEffect(effect)) {
        // Skip if either input or output is disposed
        if (effect.input.disposed || effect.output.disposed) continue;
        if (currentNode.disposed) continue;

        // Custom effect: connect current node to effect's input
        currentNode.connect(effect.input);
        // Set current node to effect's output for next connection
        currentNode = effect.output;
      } else if (effect instanceof Tone.ToneAudioNode) {
        // Skip if effect or current node is disposed
        if (effect.disposed || currentNode.disposed) continue;

        // Standard Tone.js effect: connect directly
        currentNode.connect(effect);
        currentNode = effect;
      }
    }

    // Connect the final node to destination only if not disposed
    if (!currentNode.disposed) {
      currentNode.connect(Tone.getDestination());
    }
  }, [audioEffects]);

  useEffect(() => {
    updateAudioEffects();

    // Cleanup: dispose the bus on unmount
    return () => {
      if (mainAudioEffectsBus.current && !mainAudioEffectsBus.current.disposed) {
        mainAudioEffectsBus.current.dispose();
        mainAudioEffectsBus.current = null;
      }
    };
  }, [updateAudioEffects]);

  // Type assertion is safe because we always initialize the bus before use
  return mainAudioEffectsBus as React.MutableRefObject<Tone.Channel>;
}
