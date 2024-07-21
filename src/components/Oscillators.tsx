import * as Tone from "tone";
import { clsx } from "clsx";

import { useState, MutableRefObject, Fragment } from "react";

import FrequencyRangeControl from "./FrequencyRangeControl";
import Heading from "./Heading";
import Oscillator from "./Oscillator";

import { OscillatorWithChannel } from "../types/OscillatorWithChannel";

import { useConnectChannelsToBus } from "../hooks/useConnectChannelsToBus";
import { useOscillators } from "../hooks/useOscillators";
import { useSynth } from "../hooks/useSynth";

interface OscillatorsProps {
  bus: MutableRefObject<Tone.Channel>;
  oscillatorCount?: number;
}

function Oscillators({ bus, oscillatorCount = 6 }: OscillatorsProps) {
  const [minFreq, setMinFreq] = useState(440);
  const [maxFreq, setMaxFreq] = useState(454);
  const [playKeys] = useState<string[]>(["q", "w", "a", "s", "z", "x"]);
  const [expandOscillators, setExpandOscillators] = useState(true);

  const [oscillators, setOscillators] = useOscillators(oscillatorCount);
  const synth = useSynth();

  useConnectChannelsToBus(
    [...oscillators.map((osc) => osc.channel), synth],
    bus.current
  );

  const createOscillator = (): OscillatorWithChannel => {
    const oscillator = new Tone.Oscillator(minFreq, "sine");
    const channel = new Tone.Channel(-10, 0);
    oscillator.connect(channel);
    channel.connect(bus.current);

    return { oscillator, channel };
  };

  const addOscillator = (): void => {
    setOscillators((prevOscillators: OscillatorWithChannel[]) => [
      ...prevOscillators,
      createOscillator(),
    ]);
  };

  const updateFrequencyRange = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const min = Number(formData.get("minFreq"));
    const max = Number(formData.get("maxFreq"));

    if (min && max) {
      if (min > max) {
        setMinFreq(min);
        setMaxFreq(min + 10);
      } else {
        setMinFreq(min);
        setMaxFreq(max);
      }
    }
  };

  const toggleExpandOscillators = (): void => {
    setExpandOscillators((prev) => !prev);
  };

  return (
    <Fragment>
      <Heading
        expanded={expandOscillators}
        toggleExpanded={toggleExpandOscillators}
      >
        Oscillators
      </Heading>
      <div
        className={clsx(
          "border-2 rounded border-pink-500 dark:border-sky-300 p-5 mb-3",
          !expandOscillators && "hidden"
        )}
      >
        <div className="flex items-start justify-between">
          <FrequencyRangeControl handleFormSubmit={updateFrequencyRange} />
          <button onClick={addOscillator}>+</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-8 mb-3 place-items-center">
          {oscillators.map((oscillator, i) => (
            <Oscillator
              playPauseKey={playKeys[i]}
              key={i}
              minFreq={minFreq}
              maxFreq={maxFreq}
              oscillator={oscillator.oscillator}
              channel={oscillator.channel}
              synth={synth}
            />
          ))}
        </div>
      </div>
    </Fragment>
  );
}

export default Oscillators;
