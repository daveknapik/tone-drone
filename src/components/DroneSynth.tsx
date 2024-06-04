import * as Tone from "tone";

import Effects from "./Effects.tsx";
import AutoFilter from "./AutoFilter";
import BitCrusher from "./BitCrusher";
import Chebyshev from "./Chebyshev";
import Delay from "./Delay";
import EffectsBusSendControl from "./EffectsBusSendControl";
import Oscillators from "./Oscillators.tsx";
import PolySynths from "./Polysynths";
import Reverb from "./Reverb";
import Recorder from "./Recorder.tsx";

import { useAudioEffectsBus } from "../hooks/useAudioEffectsBus";
import { useAutoFilter } from "../hooks/useAutoFilter";
import { useBitCrusher } from "../hooks/useBitCrusher";
import { useChebyshev } from "../hooks/useChebyshev";
import { useConnectChannelsToBus } from "../hooks/useConnectChannelsToBus";
import { useDelay } from "../hooks/useDelay";
import { useOscillators } from "../hooks/useOscillators";
import { useRecorder } from "../hooks/useRecorder.ts";
import { useReverb } from "../hooks/useReverb";

import { usePolysynths } from "../hooks/usePolysynths";

interface DroneSynthProps {
  oscillatorCount?: number;
}

function DroneSynth({ oscillatorCount = 6 }: DroneSynthProps) {
  const beforeFilter = useAutoFilter();
  const bitCrusher = useBitCrusher();
  const chebyshev = useChebyshev();
  const delay = useDelay();
  const reverb = useReverb();
  const afterFilter = useAutoFilter();
  const compressor = new Tone.Compressor(-30, 3);

  const recorder = useRecorder();

  const [oscillators, setOscillators] = useOscillators(oscillatorCount);
  const polysynths = usePolysynths(2);

  const busName = "mainAudioEffectsBus";
  const mainAudioEffectsBus = useAudioEffectsBus(busName, recorder.current, [
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
          <Delay delay={delay} />
          <Reverb reverb={reverb} />
          <AutoFilter filter={afterFilter} />
          <EffectsBusSendControl bus={mainAudioEffectsBus} />
        </Effects>

        <PolySynths polysynths={polysynths} />
        <Oscillators
          oscillators={oscillators}
          setOscillators={setOscillators}
          bus={mainAudioEffectsBus}
        />
      </div>
    </div>
  );
}
export default DroneSynth;
