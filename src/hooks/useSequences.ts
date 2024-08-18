import { Sequence } from "../types/Sequence";

import { Dispatch, SetStateAction, useState } from "react";

export function useSequences(
  sequenceCount = 6,
  stepCount = 8
): [Sequence[], Dispatch<SetStateAction<Sequence[]>>] {
  const [sequences, setSequences] = useState<Sequence[]>(() => {
    const sequences: Sequence[] = [];

    for (let i = 0; i < sequenceCount; i++) {
      const sequence: Sequence = {
        frequency: 440,
        steps: [],
      };

      for (let j = 0; j < stepCount; j++) {
        sequence.steps.push({
          isActive: false,
        });
      }

      sequences.push(sequence);
    }

    return sequences;
  });

  return [sequences, setSequences];
}
