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
import Reverb from "./Reverb";
import ModulationMatrix from "./ModulationMatrix";

import { useAudioEffectsBus } from "../hooks/useAudioEffectsBus.ts";
import { useAutoFilter } from "../hooks/useAutoFilter";
import { useBitCrusher } from "../hooks/useBitCrusher";
import { useChebyshev } from "../hooks/useChebyshev";
import { useDelay } from "../hooks/useDelay";
import { useFilter } from "../hooks/useFilter.ts";
import { useReverb } from "../hooks/useReverb";

import { useRecorder } from "../hooks/useRecorder.ts";

import { usePolysynths } from "../hooks/usePolysynths";

import {
  useEffect,
  useRef,
  useImperativeHandle,
  useState,
  useMemo,
} from "react";

import type { OscillatorsHandle } from "../types/OscillatorsParams";
import type { AutoFilterHandle } from "../types/AutoFilterParams";
import type { BitCrusherHandle } from "../types/BitCrusherParams";
import type { ChebyshevHandle } from "../types/ChebyshevParams";
import type { DelayHandle } from "../types/DelayParams";
import type { FilterHandle } from "../types/FilterParams";
import type { ReverbHandle } from "../types/ReverbParams";
import type { PolySynthsHandle } from "./Polysynths";
import type { EffectsBusSendHandle } from "./EffectsBusSendControl";
import type { BpmControlHandle } from "../types/BpmParams";
import type { ModulationMatrixHandle } from "../types/ModulationMatrixParams";
import type { OscillatorWithChannel } from "../types/OscillatorWithChannel";

export interface DroneSynthHandle {
  oscillatorsRef: React.RefObject<OscillatorsHandle | null>;
  polysynthsRef: React.RefObject<PolySynthsHandle | null>;
  autoFilterRef: React.RefObject<AutoFilterHandle | null>;
  bitCrusherRef: React.RefObject<BitCrusherHandle | null>;
  chebyshevRef: React.RefObject<ChebyshevHandle | null>;
  microlooperRef: React.RefObject<DelayHandle | null>;
  afterFilterRef: React.RefObject<FilterHandle | null>;
  delayRef: React.RefObject<DelayHandle | null>;
  reverb1Ref: React.RefObject<ReverbHandle | null>;
  reverb2Ref: React.RefObject<ReverbHandle | null>;
  effectsBusSendRef: React.RefObject<EffectsBusSendHandle | null>;
  bpmControlRef: React.RefObject<BpmControlHandle | null>;
  modulationMatrixRef: React.RefObject<ModulationMatrixHandle | null>;
}

interface DroneSynthProps {
  ref?: React.Ref<DroneSynthHandle>;
  onParameterChange?: () => void;
}

function DroneSynth({ ref, onParameterChange }: DroneSynthProps) {
  const recorder = useRecorder();

  const beforeFilter = useAutoFilter();
  const bitCrusher = useBitCrusher();
  const chebyshev = useChebyshev();
  const microlooper = useDelay();
  const afterFilter = useFilter();
  const delay = useDelay();
  const { reverb: reverb1, isReady: reverb1Ready } = useReverb();
  const { reverb: reverb2, isReady: reverb2Ready } = useReverb();

  // Create compressor once; recreating per-render is expensive in dev (and StrictMode doubles this).
  const compressorRef = useRef<Tone.Compressor | null>(null);
  compressorRef.current ??= new Tone.Compressor(-30, 3);
  useEffect(() => {
    return () => {
      compressorRef.current?.dispose();
      compressorRef.current = null;
    };
  }, []);

  // Memoize effects list to avoid re-chaining on every render
  // Effects chain order (explained):
  // 1. AutoFilter → Reverb 1: Early reverb can be processed by distortion effects
  // 2. BitCrusher, Chebyshev: Distortion effects that create interesting artifacts when fed reverb
  // 3. Microlooper, Filter, Delay: Time/frequency effects
  // 4. Reverb 2: Clean ambience at end of chain (not distorted)
  // 5. Compressor: Always last to control output levels
  const effects = useMemo(
    () => [
      beforeFilter.current,
      reverb1.current,
      bitCrusher.current,
      chebyshev.current,
      microlooper.current,
      afterFilter.current,
      delay.current,
      reverb2.current,
      compressorRef.current!,
    ],
    [
      beforeFilter.current,
      reverb1.current,
      bitCrusher.current,
      chebyshev.current,
      microlooper.current,
      afterFilter.current,
      delay.current,
      reverb2.current,
      compressorRef.current,
    ]
  );

  const mainAudioEffectsBus = useAudioEffectsBus(effects);

  useEffect(() => {
    if (recorder.current) {
      Tone.getDestination().connect(recorder.current);
    }
  }, [recorder]);

  const polysynths = usePolysynths(2);

  polysynths.forEach(({ panner }) => {
    panner.connect(mainAudioEffectsBus.current);
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
  const reverb1Ref = useRef<ReverbHandle>(null);
  const reverb2Ref = useRef<ReverbHandle>(null);
  const effectsBusSendRef = useRef<EffectsBusSendHandle | null>(null);
  const bpmControlRef = useRef<BpmControlHandle | null>(null);
  const modulationMatrixRef = useRef<ModulationMatrixHandle | null>(null);

  // Track oscillators for modulation matrix
  const [oscillatorsForModulation, setOscillatorsForModulation] = useState<
    OscillatorWithChannel[]
  >([]);

  // Get oscillators from Oscillators component once ready
  useEffect(() => {
    const getOscillators = () => {
      if (oscillatorsRef.current) {
        const oscs = oscillatorsRef.current.getOscillators();
        if (oscs.length > 0) {
          setOscillatorsForModulation(oscs);
          clearInterval(interval); // Stop polling once we have the oscillators
        }
      }
    };

    // Poll for oscillators to be ready (they're created in the Oscillators useEffect)
    const interval = setInterval(getOscillators, 100);

    // Also try immediately
    getOscillators();

    // Cleanup
    return () => clearInterval(interval);
  }, []);

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
    reverb1Ref,
    reverb2Ref,
    effectsBusSendRef,
    bpmControlRef,
    modulationMatrixRef,
  }));

  return (
    <div className="dark:text-sky-300">
      <div className="border-2 rounded border-pink-500 dark:border-sky-300 pt-2 px-3">
        <Recorder recorder={recorder} />

        <Effects>
          <AutoFilter
            filter={beforeFilter}
            ref={autoFilterRef}
            onParameterChange={onParameterChange}
          />
          <Reverb
            reverb={reverb1}
            isReady={reverb1Ready}
            ref={reverb1Ref}
            onParameterChange={onParameterChange}
            label="Reverb 1"
          />
          <BitCrusher
            bitCrusher={bitCrusher}
            ref={bitCrusherRef}
            onParameterChange={onParameterChange}
          />
          <Chebyshev
            chebyshev={chebyshev}
            ref={chebyshevRef}
            onParameterChange={onParameterChange}
          />
          <Delay
            delay={microlooper}
            label="Microlooper"
            maxTime={1}
            minFeedback={0.6}
            ref={microlooperRef}
            onParameterChange={onParameterChange}
          />
          <Filter
            filter={afterFilter}
            ref={afterFilterRef}
            onParameterChange={onParameterChange}
          />
          <Delay
            delay={delay}
            ref={delayRef}
            onParameterChange={onParameterChange}
          />
          <Reverb
            reverb={reverb2}
            isReady={reverb2Ready}
            ref={reverb2Ref}
            onParameterChange={onParameterChange}
            label="Reverb 2"
          />
          <EffectsBusSendControl
            bus={mainAudioEffectsBus}
            ref={effectsBusSendRef}
            onParameterChange={onParameterChange}
          />
        </Effects>
        <ModulationMatrix
          ref={modulationMatrixRef}
          onParameterChange={onParameterChange}
          oscillators={oscillatorsForModulation}
          effects={{
            filter: afterFilter,
            delay: delay,
            micro: microlooper,
            bitCrusher: bitCrusher,
            chebyshev: chebyshev,
            reverb1: reverb1,
            reverb2: reverb2,
          }}
          effectRefs={{
            filterRef: afterFilterRef,
            delayRef: delayRef,
            microRef: microlooperRef,
            bitCrusherRef: bitCrusherRef,
            chebyshevRef: chebyshevRef,
            reverb1Ref: reverb1Ref,
            reverb2Ref: reverb2Ref,
          }}
        />
        <PolySynths
          polysynths={polysynths}
          ref={polysynthsRef}
          onParameterChange={onParameterChange}
        />
        <Oscillators
          bus={mainAudioEffectsBus}
          ref={oscillatorsRef}
          onParameterChange={onParameterChange}
          bpmControlRef={bpmControlRef}
        />
      </div>
    </div>
  );
}
export default DroneSynth;
