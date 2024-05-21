import * as Tone from "tone";

import { useEffect, useState } from "react";

import { OscillatorWithChannel } from "../types/OscillatorWithChannel";

import { Dispatch, SetStateAction } from "react";

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

      // if we send the channel .toDestination(),
      // later when we connect to the effects bus we will effectively create a parallel chain
      // of the oscillator to the bus, alongside the osc to the main mix
      // without sending to destination, the channel only passes through effects
      const channel = new Tone.Channel(-15, 0);
      oscillator.connect(channel);
      newOscillators.push({ oscillator, channel });
    }

    setOscillators(newOscillators);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [oscillators, setOscillators];
}
