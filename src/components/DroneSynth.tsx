import * as Tone from "tone";

import AutoFilter from "./AutoFilter";
import BitCrusher from "./BitCrusher";
import Chebyshev from "./Chebyshev";
import Delay from "./Delay";
import EffectsBusSendControl from "./EffectsBusSendControl";
import FrequencyRangeControl from "./FrequencyRangeControl";
import Oscillator from "./Oscillator";
import Reverb from "./Reverb";

import { useAudioEffectsBus } from "../hooks/useAudioEffectsBus";
import { useAutoFilter } from "../hooks/useAutoFilter";
import { useBitCrusher } from "../hooks/useBitCrusher";
import { useChebyshev } from "../hooks/useChebyshev";
import { useConnectChannelsToBus } from "../hooks/useConnectChannelsToBus";
import { useDelay } from "../hooks/useDelay";
import { useOscillators } from "../hooks/useOscillators";
import { useReverb } from "../hooks/useReverb";

import { OscillatorWithChannel } from "../types/OscillatorWithChannel";
import { useState } from "react";

interface DroneSynthProps {
  oscillatorCount?: number;
}

function DroneSynth({ oscillatorCount = 6 }: DroneSynthProps) {
  const [minFreq, setMinFreq] = useState(440);
  const [maxFreq, setMaxFreq] = useState(454);

  const beforeFilter = useAutoFilter();
  const bitCrusher = useBitCrusher();
  const chebyshev = useChebyshev();
  const delay = useDelay();
  const reverb = useReverb();
  const afterFilter = useAutoFilter();
  const compressor = new Tone.Compressor(-30, 3);

  const [oscillators, setOscillators] = useOscillators(oscillatorCount);

  const busName = "mainAudioEffectsBus";
  const mainAudioEffectsBus = useAudioEffectsBus(busName, [
    beforeFilter?.current,
    bitCrusher?.current,
    chebyshev?.current,
    delay?.current,
    reverb?.current,
    afterFilter?.current,
    compressor,
  ]);

  useConnectChannelsToBus(
    oscillators.map((osc) => osc.channel),
    mainAudioEffectsBus.current,
    busName
  );

  const createOscillator = (): OscillatorWithChannel => {
    const oscillator = new Tone.Oscillator(minFreq, "sine");
    const channel = new Tone.Channel(-5, 0);
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

  return (
    <div className="dark:text-sky-300">
      <div className="border-2 rounded border-pink-500 dark:border-sky-300 pt-2 px-3">
        <div className="grid grid-cols-2 gap-x-2 gap-y-3 sm:grid-cols-6">
          <div className="col-span-full">Drone Synth</div>
          <div className="col-start-7">
            <button onClick={addOscillator}>+</button>
          </div>
          <FrequencyRangeControl
            handleFormSubmit={updateFrequencyRange}
            className="mb-7"
          />
        </div>

        <div className="col-span-full justify-self-start mt-5">Effects</div>
        <div className="grid grid-cols-1 gap-x-2 gap-y-3 md:grid-cols-2 my-5 border-2 rounded border-pink-500 dark:border-sky-300 p-5">
          <AutoFilter filter={beforeFilter} />
          <BitCrusher bitCrusher={bitCrusher} />
          <Chebyshev chebyshev={chebyshev} />
          <Delay delay={delay} />
          <Reverb reverb={reverb} />
          <AutoFilter filter={afterFilter} />
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
