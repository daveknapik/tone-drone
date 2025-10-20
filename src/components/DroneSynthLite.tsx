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

import { useEffect, useRef, useImperativeHandle } from "react";

import type { OscillatorsHandle } from "../types/OscillatorsParams";
import type { AutoFilterHandle } from "../types/AutoFilterParams";
import type { BitCrusherHandle } from "../types/BitCrusherParams";
import type { ChebyshevHandle } from "../types/ChebyshevParams";
import type { DelayHandle } from "../types/DelayParams";
import type { FilterHandle } from "../types/FilterParams";
import type { PolySynthsHandle } from "./Polysynths";
import type { EffectsBusSendHandle } from "./EffectsBusSendControl";
import type { BpmControlHandle } from "../types/BpmParams";

export interface DroneSynthLiteHandle {
  oscillatorsRef: React.RefObject<OscillatorsHandle | null>;
  polysynthsRef: React.RefObject<PolySynthsHandle | null>;
  autoFilterRef: React.RefObject<AutoFilterHandle | null>;
  bitCrusherRef: React.RefObject<BitCrusherHandle | null>;
  chebyshevRef: React.RefObject<ChebyshevHandle | null>;
  microlooperRef: React.RefObject<DelayHandle | null>;
  afterFilterRef: React.RefObject<FilterHandle | null>;
  delayRef: React.RefObject<DelayHandle | null>;
  effectsBusSendRef: React.RefObject<EffectsBusSendHandle | null>;
  bpmControlRef: React.RefObject<BpmControlHandle | null>;
}

interface DroneSynthLiteProps {
  ref?: React.Ref<DroneSynthLiteHandle>;
  onParameterChange?: () => void;
}

function DroneSynthLite({ ref, onParameterChange }: DroneSynthLiteProps) {
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
  }, [recorder]);

  const polysynths = usePolysynths(1);

  polysynths.forEach((polysynth) => {
    polysynth.connect(mainAudioEffectsBus.current);
  });

  // Create refs for all components that need to be accessed by presets
  const oscillatorsRef = useRef<OscillatorsHandle>(null);
  const polysynthsRef = useRef<PolySynthsHandle>(null);
  const autoFilterRef = useRef<AutoFilterHandle>(null);
  const bitCrusherRef = useRef<BitCrusherHandle>(null);
  const chebyshevRef = useRef<ChebyshevHandle>(null);
  const microlooperRef = useRef<DelayHandle>(null);
  const afterFilterRef = useRef<FilterHandle>(null);
  const delayRef = useRef<DelayHandle>(null);
  const effectsBusSendRef = useRef<EffectsBusSendHandle | null>(null);
  const bpmControlRef = useRef<BpmControlHandle | null>(null);

  // Expose refs to parent component
  useImperativeHandle(ref, () => ({
    oscillatorsRef,
    polysynthsRef,
    autoFilterRef,
    bitCrusherRef,
    chebyshevRef,
    microlooperRef,
    afterFilterRef,
    delayRef,
    effectsBusSendRef,
    bpmControlRef,
  }));

  return (
    <div className="dark:text-sky-300">
      <div className="border-2 rounded border-pink-500 dark:border-sky-300 pt-2 px-3">
        <Recorder recorder={recorder} />

        <Effects>
          <AutoFilter filter={beforeFilter} ref={autoFilterRef} onParameterChange={onParameterChange} />
          <BitCrusher bitCrusher={bitCrusher} ref={bitCrusherRef} onParameterChange={onParameterChange} />
          <Chebyshev chebyshev={chebyshev} ref={chebyshevRef} onParameterChange={onParameterChange} />
          <Delay
            delay={microlooper}
            label="Microlooper"
            maxTime={1}
            minFeedback={0.6}
            ref={microlooperRef}
            onParameterChange={onParameterChange}
          />
          <Filter filter={afterFilter} ref={afterFilterRef} onParameterChange={onParameterChange} />
          <Delay delay={delay} ref={delayRef} onParameterChange={onParameterChange} />
          <EffectsBusSendControl bus={mainAudioEffectsBus} ref={effectsBusSendRef} onParameterChange={onParameterChange} />
        </Effects>
        <PolySynths polysynths={polysynths} ref={polysynthsRef} onParameterChange={onParameterChange} />
        <Oscillators bus={mainAudioEffectsBus} ref={oscillatorsRef} onParameterChange={onParameterChange} bpmControlRef={bpmControlRef} />
      </div>
    </div>
  );
}
export default DroneSynthLite;
