import Slider from "./Slider";
import { useState, useImperativeHandle, useRef, useEffect } from "react";
import { SynthEnvelopeHandle, SynthEnvelopeParams } from "../types/SynthParams";
import { DEFAULT_SYNTH_ENVELOPE_PARAMS } from "../utils/presetDefaults";

interface SynthEnvelopeControlProps {
  initialParams?: SynthEnvelopeParams;
  onChange?: (params: SynthEnvelopeParams) => void;
  onParameterChange?: () => void;
  ref?: React.Ref<SynthEnvelopeHandle>;
}

function SynthEnvelopeControl({
  initialParams,
  onChange,
  onParameterChange,
  ref,
}: SynthEnvelopeControlProps) {
  const [attack, setAttack] = useState(
    initialParams?.attack ?? DEFAULT_SYNTH_ENVELOPE_PARAMS.attack
  );
  const [decay, setDecay] = useState(
    initialParams?.decay ?? DEFAULT_SYNTH_ENVELOPE_PARAMS.decay
  );
  const [sustain, setSustain] = useState(
    initialParams?.sustain ?? DEFAULT_SYNTH_ENVELOPE_PARAMS.sustain
  );
  const [release, setRelease] = useState(
    initialParams?.release ?? DEFAULT_SYNTH_ENVELOPE_PARAMS.release
  );

  // Keep a ref with current state values
  const paramsRef = useRef<SynthEnvelopeParams>({
    attack,
    decay,
    sustain,
    release,
  });

  // Update ref whenever state changes (but don't call onChange here!)
  useEffect(() => {
    paramsRef.current = { attack, decay, sustain, release };
  }, [attack, decay, sustain, release]);

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    getParams: (): SynthEnvelopeParams => paramsRef.current,
    setParams: (params: SynthEnvelopeParams) => {
      setAttack(params.attack);
      setDecay(params.decay);
      setSustain(params.sustain);
      setRelease(params.release);
    },
  }));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      <Slider
        inputName="synth-attack"
        labelText="Attack"
        min={0}
        max={2}
        step={0.01}
        value={attack}
        handleChange={(e) => {
          const newAttack = parseFloat(e.target.value);
          setAttack(newAttack);
          onChange?.({ attack: newAttack, decay, sustain, release });
          onParameterChange?.();
        }}
      />
      <Slider
        inputName="synth-decay"
        labelText="Decay"
        min={0}
        max={1}
        step={0.01}
        value={decay}
        handleChange={(e) => {
          const newDecay = parseFloat(e.target.value);
          setDecay(newDecay);
          onChange?.({ attack, decay: newDecay, sustain, release });
          onParameterChange?.();
        }}
      />
      <Slider
        inputName="synth-sustain"
        labelText="Sustain"
        min={0}
        max={1}
        step={0.01}
        value={sustain}
        handleChange={(e) => {
          const newSustain = parseFloat(e.target.value);
          setSustain(newSustain);
          onChange?.({ attack, decay, sustain: newSustain, release });
          onParameterChange?.();
        }}
      />
      <Slider
        inputName="synth-release"
        labelText="Release"
        min={0}
        max={2}
        step={0.01}
        value={release}
        handleChange={(e) => {
          const newRelease = parseFloat(e.target.value);
          setRelease(newRelease);
          onChange?.({ attack, decay, sustain, release: newRelease });
          onParameterChange?.();
        }}
      />
    </div>
  );
}

export default SynthEnvelopeControl;
