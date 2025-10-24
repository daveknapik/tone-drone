import * as Tone from "tone";

import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

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
  const oscillatorsRef = useRef<OscillatorWithChannel[]>([]);
  const initializedRef = useRef<boolean>(false);

  const createOscillator = (type: OscillatorType): OscillatorWithChannel => {
    const oscillator =
      type === "fat"
        ? new Tone.FatOscillator(440, "sine")
        : new Tone.Oscillator(440, "sine");
    const channel = new Tone.Channel(-5, 0);
    oscillator.connect(channel);
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

  // Update on type or count change without disposing reused instances
  useEffect(() => {
    // No-op until initial mount completed
    if (!initializedRef.current) return;

    const current = oscillatorsRef.current;

    // Handle updates for existing indices and count increase
    const targetLength = Math.max(
      current.length,
      oscillatorCount,
      types.length
    );
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

    // Handle count decrease after updates
    if (oscillatorCount < current.length) {
      for (let i = oscillatorCount; i < current.length; i++) {
        current[i].oscillator.dispose();
        current[i].channel.dispose();
      }
      current.length = oscillatorCount;
    }

    oscillatorsRef.current = current;
    setOscillators([...current]);
  }, [oscillatorCount, types]);

  // Expose a setter that keeps the ref in sync for external mutations (e.g., addOscillator)
  const setOscillatorsSync: Dispatch<
    SetStateAction<OscillatorWithChannel[]>
  > = (updater) => {
    setOscillators((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
