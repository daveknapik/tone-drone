import * as Tone from "tone";

import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

import { OscillatorWithChannel } from "../types/OscillatorWithChannel";
import { OscillatorType } from "../types/OscillatorParams";

export function useOscillators(
  oscillatorCount = 6,
  oscillatorTypes?: OscillatorType[],
  bus?: Tone.Channel
): [
  OscillatorWithChannel[],
  Dispatch<SetStateAction<OscillatorWithChannel[]>>,
  Dispatch<SetStateAction<OscillatorType[]>>
] {
  const [oscillators, setOscillators] = useState<OscillatorWithChannel[]>([]);
  const [types, setTypes] = useState<OscillatorType[]>(
    oscillatorTypes ?? Array(oscillatorCount).fill("basic")
  );
  const oscillatorsRef = useRef<OscillatorWithChannel[]>([]);
  const initializedRef = useRef<boolean>(false);

  const createOscillator = (type: OscillatorType): OscillatorWithChannel => {
    const oscillator =
      type === "fat"
        ? new Tone.FatOscillator(440, "sine")
        : new Tone.Oscillator(440, "sine");
    const channel = new Tone.Channel(-5, 0);
    oscillator.connect(channel);
    if (bus) {
      channel.connect(bus);
    }
    return { oscillator, channel, type };
  };

  // Mount/unmount: create initial set and dispose everything on unmount
  useEffect(() => {
    const initial: OscillatorWithChannel[] = Array.from(
      { length: oscillatorCount },
      (_, i) => createOscillator(types[i] ?? "basic")
    );
    oscillatorsRef.current = initial;
    setOscillators([...initial]);
    initializedRef.current = true;

    return () => {
      oscillatorsRef.current.forEach(({ oscillator, channel }) => {
        oscillator.dispose();
        channel.dispose();
      });
      oscillatorsRef.current = [];
    };
  }, []);

  // Update on type change without disposing reused instances unnecessarily
  useEffect(() => {
    // No-op until initial mount completed
    if (!initializedRef.current) return;

    const current = oscillatorsRef.current;

    // Handle updates for existing indices and additions
    // Derive target length from current list and types only (component controls additions)
    const targetLength = Math.max(current.length, types.length);
    for (let i = 0; i < targetLength; i++) {
      const desiredType = types[i] ?? "basic";
      const existing = current[i];

      if (!existing) {
        // Create new at the end
        current[i] = createOscillator(desiredType);
        continue;
      }

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

  // Expose a setter that keeps the ref in sync for external mutations (e.g., addOscillator)
  const setOscillatorsSync: Dispatch<
    SetStateAction<OscillatorWithChannel[]>
  > = (updater) => {
    setOscillators((prev) => {
      const next =
        typeof updater === "function"
          ? (
              updater as (p: OscillatorWithChannel[]) => OscillatorWithChannel[]
            )(prev)
          : updater;
      oscillatorsRef.current = next;
      return next;
    });
  };

  return [oscillators, setOscillatorsSync, setTypes];
}
