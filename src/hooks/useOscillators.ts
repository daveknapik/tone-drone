import * as Tone from "tone";

import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

import { OscillatorWithChannel } from "../types/OscillatorWithChannel";
import { OscillatorType } from "../types/OscillatorParams";
import { DEFAULT_OSCILLATOR_PARAMS } from "../utils/presetDefaults";

const OSCILLATOR_COUNT = 6;

export function useOscillators(
  oscillatorTypes?: OscillatorType[],
  bus?: Tone.Channel
): [
  OscillatorWithChannel[],
  Dispatch<SetStateAction<OscillatorWithChannel[]>>,
  Dispatch<SetStateAction<OscillatorType[]>>,
] {
  const [oscillators, setOscillators] = useState<OscillatorWithChannel[]>([]);
  const [types, setTypes] = useState<OscillatorType[]>(
    oscillatorTypes ?? Array(OSCILLATOR_COUNT).fill("basic")
  );
  const oscillatorsRef = useRef<OscillatorWithChannel[]>([]);
  const initializedRef = useRef<boolean>(false);

  const createOscillator = (type: OscillatorType): OscillatorWithChannel => {
    const oscillator =
      type === "fat"
        ? new Tone.FatOscillator(DEFAULT_OSCILLATOR_PARAMS.frequency, "sine")
        : new Tone.Oscillator(DEFAULT_OSCILLATOR_PARAMS.frequency, "sine");
    const channel = new Tone.Channel(0, 0);
    // Pre-create effects for smooth, click-free modulation routing
    const tremolo = new Tone.Tremolo({
      frequency: 2,
      depth: 0,
      type: "sine",
    }).start();
    const autoPanner = new Tone.AutoPanner({ frequency: 2, depth: 0 }).start();
    // Ensure tremolo modulates both channels in-phase for audible AM
    tremolo.spread = 0;
    tremolo.wet.value = 1;
    autoPanner.wet.value = 1;
    // Chain: oscillator → channel → tremolo (AM) → autoPanner (stereo pan) → bus
    oscillator.connect(channel);
    channel.connect(tremolo);
    tremolo.connect(autoPanner);
    if (bus) {
      autoPanner.connect(bus);
    }
    return { oscillator, channel, tremolo, autoPanner, type };
  };

  // Mount/unmount: create initial set and dispose everything on unmount
  useEffect(() => {
    const initial: OscillatorWithChannel[] = Array.from(
      { length: OSCILLATOR_COUNT },
      (_, i) => createOscillator(types[i] ?? "basic")
    );
    oscillatorsRef.current = initial;
    setOscillators([...initial]);
    initializedRef.current = true;

    return () => {
      oscillatorsRef.current.forEach(
        ({ oscillator, channel, tremolo, autoPanner }) => {
          oscillator.dispose();
          channel.dispose();
          tremolo.dispose();
          autoPanner.dispose();
        }
      );
      oscillatorsRef.current = [];
    };
  }, []);

  // Update on type change without disposing reused instances unnecessarily
  useEffect(() => {
    // No-op until initial mount completed
    if (!initializedRef.current) return;

    const current = oscillatorsRef.current;

    // Update oscillator types for all 6 oscillators
    for (let i = 0; i < OSCILLATOR_COUNT; i++) {
      const desiredType = types[i] ?? "basic";
      const existing = current[i];

      if (existing.type !== desiredType) {
        // Dispose and replace when type changes
        existing.oscillator.dispose();
        existing.channel.dispose();
        current[i] = createOscillator(desiredType);
      }
    }

    oscillatorsRef.current = current;
    setOscillators([...current]);
  }, [types]);

  return [oscillators, setOscillators, setTypes];
}
