import { Sequence } from "../types/Sequence";

import { Dispatch, SetStateAction, useState } from "react";
import { DEFAULT_SEQUENCE } from "../utils/presetDefaults";

const SEQUENCE_COUNT = 6;

export function useSequences(
  stepCount: number
): [Sequence[], Dispatch<SetStateAction<Sequence[]>>] {
  const [sequences, setSequences] = useState<Sequence[]>(() => {
    const sequences: Sequence[] = [];

    for (let i = 0; i < SEQUENCE_COUNT; i++) {
      const sequence: Sequence = {
        frequency: DEFAULT_SEQUENCE.frequency,
        steps: [],
      };

      for (let j = 0; j < stepCount; j++) {
        sequence.steps.push(false);
      }

      sequences.push(sequence);
    }

    return sequences;
  });

  return [sequences, setSequences];
}
