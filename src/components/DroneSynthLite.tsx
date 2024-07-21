import * as Tone from "tone";

import Effects from "./Effects.tsx";
import AutoFilter from "./AutoFilter";
import BitCrusher from "./BitCrusher";
import Chebyshev from "./Chebyshev";
import Delay from "./Delay";
import EffectsBusSendControl from "./EffectsBusSendControl.tsx";
import Filter from "./Filter.tsx";
import Oscillators from "./Oscillators.tsx";
import PolySynths from "./Polysynths";
import Recorder from "./Recorder.tsx";

import { useAudioEffectsBus } from "../hooks/useAudioEffectsBus.ts";
import { useAutoFilter } from "../hooks/useAutoFilter";
import { useBitCrusher } from "../hooks/useBitCrusher";
import { useChebyshev } from "../hooks/useChebyshev";
import { useDelay } from "../hooks/useDelay";
import { useFilter } from "../hooks/useFilter.ts";

import { useRecorder } from "../hooks/useRecorder.ts";

import { usePolysynths } from "../hooks/usePolysynths";

import { useEffect } from "react";

function DroneSynthLite() {
  const recorder = useRecorder();

  const beforeFilter = useAutoFilter();
  const bitCrusher = useBitCrusher();
  const chebyshev = useChebyshev();
  const microlooper = useDelay();
  const afterFilter = useFilter();
  const delay = useDelay();

  const compressor = new Tone.Compressor(-30, 3);

  const effects = [
    beforeFilter.current,
    bitCrusher.current,
    chebyshev.current,
    microlooper.current,
    afterFilter.current,
    delay.current,
    compressor,
  ];

  const mainAudioEffectsBus = useAudioEffectsBus(effects);

  useEffect(() => {
    if (recorder.current) {
      Tone.getDestination().connect(recorder.current);
    }
    Tone.Transport.bpm.value = 60;
    Tone.Transport.start();
  }, [recorder]);

  const polysynths = usePolysynths(1);

  polysynths.forEach((polysynth) => {
    polysynth.connect(mainAudioEffectsBus.current);
  });

  return (
    <div className="dark:text-sky-300">
      <div className="border-2 rounded border-pink-500 dark:border-sky-300 pt-2 px-3">
        <Recorder recorder={recorder} />

        <Effects>
          <AutoFilter filter={beforeFilter} />
          <BitCrusher bitCrusher={bitCrusher} />
          <Chebyshev chebyshev={chebyshev} />
          <Delay
            delay={microlooper}
            label="Microlooper"
            maxTime={1}
            minFeedback={0.6}
          />
          <Filter filter={afterFilter} />
          <Delay delay={delay} />
          <EffectsBusSendControl bus={mainAudioEffectsBus} />
        </Effects>
        <PolySynths polysynths={polysynths} />
        <Oscillators bus={mainAudioEffectsBus} />
      </div>
    </div>
  );
}
export default DroneSynthLite;
