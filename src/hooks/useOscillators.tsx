import * as Tone from "tone";

import { useEffect, useState } from "react";

import { OscillatorWithChannel } from "../interfaces/OscillatorWithChannel";

import { Dispatch, SetStateAction } from "react";

export function useOscillators(
  oscillatorCount = 6,
  bus: Tone.Channel,
  delay: Tone.FeedbackDelay,
  reverb: Tone.Freeverb
): [
  OscillatorWithChannel[],
  Dispatch<SetStateAction<OscillatorWithChannel[]>>
] {
  const [oscillators, setOscillators] = useState<OscillatorWithChannel[]>([]);

  useEffect(() => {
    const newOscillators: OscillatorWithChannel[] = [];
    bus.chain(delay, reverb, Tone.getDestination());

    // Create the oscillators and their channels
    for (let i = 0; i < oscillatorCount; i++) {
      const oscillator = new Tone.Oscillator(440, "sine");
      const channel = new Tone.Channel(-15, 0).toDestination();
      oscillator.connect(channel);
      newOscillators.push({ oscillator, channel });
    }

    setOscillators(newOscillators);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [oscillators, setOscillators];
}
