import * as Tone from "tone";

import { Dispatch, SetStateAction, useEffect, useState } from "react";

import { OscillatorWithChannel } from "../types/OscillatorWithChannel";
import { OscillatorType } from "../types/OscillatorParams";

export function useOscillators(
  oscillatorCount = 6,
  oscillatorTypes?: OscillatorType[]
): [
  OscillatorWithChannel[],
  Dispatch<SetStateAction<OscillatorWithChannel[]>>,
  Dispatch<SetStateAction<OscillatorType[]>>
] {
  const [oscillators, setOscillators] = useState<OscillatorWithChannel[]>([]);
  const [types, setTypes] = useState<OscillatorType[]>(
    oscillatorTypes ?? Array(oscillatorCount).fill("basic")
  );

  useEffect(() => {
    const newOscillators: OscillatorWithChannel[] = [];

    // Create the oscillators and their channels
    for (let i = 0; i < oscillatorCount; i++) {
      const type = types[i] ?? "basic";
      const oscillator =
        type === "fat"
          ? new Tone.FatOscillator(440, "sine")
          : new Tone.Oscillator(440, "sine");
      const channel = new Tone.Channel(-5, 0);
      oscillator.connect(channel);
      newOscillators.push({ oscillator, channel, type });
    }

    setOscillators(newOscillators);

    return () => {
      newOscillators.forEach(({ oscillator, channel }) => {
        oscillator.dispose();
        channel.dispose();
      });
    };
  }, [oscillatorCount, types]);

  return [oscillators, setOscillators, setTypes];
}
