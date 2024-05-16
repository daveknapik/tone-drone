import * as Tone from "tone";

import Delay from "./Delay";
import EffectsBusSendControl from "./EffectsBusSendControl";
import FrequencyRangeControl from "./FrequencyRangeControl";
import Oscillator from "./Oscillator";
import Reverb from "./Reverb";
import { OscillatorWithChannel } from "../interfaces/OscillatorWithChannel";

import { useState } from "react";

import { useDelay } from "../hooks/useDelay";
import { useReverb } from "../hooks/useReverb";
import { useAutoFilter } from "../hooks/useAutoFilter";
import { useAudioEffectsBus } from "../hooks/useAudioEffectsBus";
import { useOscillators } from "../hooks/useOscillators";
import { useConnectChannelsToBus } from "../hooks/useConnectChannelsToBus";
import AutoFilter from "./AutoFilter";

interface DroneSynthProps {
  oscillatorCount?: number;
}

function DroneSynth({ oscillatorCount = 6 }: DroneSynthProps) {
  const [minFreq, setMinFreq] = useState(440);
  const [maxFreq, setMaxFreq] = useState(454);

  const delay = useDelay();
  const reverb = useReverb();
  const filter = useAutoFilter();
  const mainAudioEffectsBus = useAudioEffectsBus();

  // TODO:
  // - hook that connects the bus to audio effects should accept audio effects as a generic array it can destructure
  const [oscillators, setOscillators] = useOscillators(
    oscillatorCount,
    mainAudioEffectsBus.current,
    delay.current,
    reverb.current,
    filter.current
  );

  useConnectChannelsToBus(
    oscillators.map((osc) => osc.channel),
    mainAudioEffectsBus.current
  );

  const createOscillator = (): OscillatorWithChannel => {
    const oscillator = new Tone.Oscillator(minFreq, "sine");
    const channel = new Tone.Channel(-5, 0).toDestination();
    oscillator.connect(channel);
    channel.connect(mainAudioEffectsBus.current);

    return { oscillator, channel };
  };

  const addOscillator = (): void => {
    setOscillators((prevOscillators: OscillatorWithChannel[]) => [
      ...prevOscillators,
      createOscillator(),
    ]);
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
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

  return (
    <div className="dark:text-sky-300">
      <div className="border-2 rounded border-pink-500 dark:border-sky-300 pt-2 px-3">
        <div className="grid grid-cols-2 gap-x-2 gap-y-3 sm:grid-cols-6">
          <div className="col-span-full">Drone Synth</div>
          <div className="col-start-7">
            <button onClick={addOscillator}>+</button>
          </div>
          <FrequencyRangeControl
            handleFormSubmit={handleFormSubmit}
            className="mb-7"
          />
        </div>

        <div className="col-span-full justify-self-start mt-5">Effects</div>
        <div className="grid grid-cols-1 gap-x-2 gap-y-3 md:grid-cols-2 my-5 border-2 rounded border-pink-500 dark:border-sky-300 p-5">
          <Delay delay={delay} />
          <Reverb reverb={reverb} />
          <AutoFilter filter={filter} />
          <EffectsBusSendControl bus={mainAudioEffectsBus} />
        </div>

        <div className="col-span-full justify-self-start">Oscillators</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 my-5 place-items-center border-2 rounded border-pink-500 dark:border-sky-300 p-5">
          {oscillators.map((oscillator, i) => (
            <Oscillator
              key={i}
              minFreq={minFreq}
              maxFreq={maxFreq}
              oscillator={oscillator.oscillator}
              channel={oscillator.channel}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
export default DroneSynth;
