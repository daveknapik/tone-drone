import * as Tone from "tone";

import { Step } from "../types/Step";

import { useRef, useState } from "react";

export function useLoop(sequence: Step[], synth: Tone.Synth) {
  const [beat, setBeat] = useState(0);
  const loop = useRef<Tone.Loop>(
    new Tone.Loop((time) => {
      // Update the current beat
      setBeat((currentBeat) => (currentBeat + 1) % sequence.length);

      // Play the active step
      const step = sequence[beat];
      if (step.isActive) {
        // Play the sound or perform an action for the active step
        console.log(
          `Playing active step at index ${step.index} with frequency ${step.frequency}`
        );
        console.log(sequence);

        // Example: Tone.js synth play
        synth.triggerAttackRelease(step.frequency, "8n", time);
      }
    }, "8n")
  );

  return [loop, beat];
}
