import * as Tone from "tone";

import { Dispatch, SetStateAction, useEffect, useState } from "react";

import { OscillatorWithChannel } from "../types/OscillatorWithChannel";

export function useOscillators(
  oscillatorCount = 6
): [
  OscillatorWithChannel[],
  Dispatch<SetStateAction<OscillatorWithChannel[]>>
] {
  const [oscillators, setOscillators] = useState<OscillatorWithChannel[]>([]);

  useEffect(() => {
    const newOscillators: OscillatorWithChannel[] = [];

    // Create the oscillators and their channels
    for (let i = 0; i < oscillatorCount; i++) {
      const oscillator = new Tone.Oscillator(440, "sine");
      const channel = new Tone.Channel(-5, 0);
      oscillator.connect(channel);
      newOscillators.push({ oscillator, channel });
    }

    setOscillators(newOscillators);

    return () => {
      newOscillators.forEach(({ oscillator, channel }) => {
        oscillator.dispose();
        channel.dispose();
      });

      setOscillators([]);
    };
  }, [oscillatorCount]);

  return [oscillators, setOscillators];
}
