import Slider from "./Slider";
import { useState, useImperativeHandle, useRef, useEffect } from "react";
import { SynthEnvelopeHandle, SynthEnvelopeParams } from "../types/SynthParams";
import { DEFAULT_SYNTH_ENVELOPE_PARAMS } from "../utils/presetDefaults";
import { useDebounceCallback } from "usehooks-ts";

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
      // Clamp values to slider ranges to match UI constraints
      setAttack(Math.min(Math.max(params.attack, 0), 2));
      setDecay(Math.min(Math.max(params.decay, 0), 1));
      setSustain(Math.min(Math.max(params.sustain, 0), 1));
      setRelease(Math.min(Math.max(params.release, 0), 2));
    },
  }));

  // Debounced callbacks to reduce update frequency (prevents excessive synth updates)
  const debouncedOnChange = useDebounceCallback((params: SynthEnvelopeParams) => {
    onChange?.(params);
  }, 50); // 50ms - fast enough to feel responsive, slow enough to reduce updates

  const debouncedOnParameterChange = useDebounceCallback(() => {
    onParameterChange?.();
  }, 500); // 500ms for preset modification marking

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      <div title="Time for sound to reach full volume (0-2s).">
        <Slider
          inputName="synth-attack"
          labelText="Attack"
          min={0}
          max={2}
          step={0.01}
          value={attack}
          handleChange={(e) => {
            const newAttack = parseFloat(e.target.value);
            setAttack(newAttack); // UI state update
            debouncedOnChange({ attack: newAttack, decay, sustain, release }); // Debounced synth update
            debouncedOnParameterChange(); // Debounced preset marking
          }}
        />
      </div>
      <div title="Time to decay from peak to sustain level (0-1s, limited to prevent voice accumulation).">
        <Slider
          inputName="synth-decay"
          labelText="Decay"
          min={0}
          max={1}
          step={0.01}
          value={decay}
          handleChange={(e) => {
            const newDecay = parseFloat(e.target.value);
            setDecay(newDecay); // UI state update
            debouncedOnChange({ attack, decay: newDecay, sustain, release }); // Debounced synth update
            debouncedOnParameterChange(); // Debounced preset marking
          }}
        />
      </div>
      <div title="Sustained volume level (0-1, where 1 is full volume).">
        <Slider
          inputName="synth-sustain"
          labelText="Sustain"
          min={0}
          max={1}
          step={0.01}
          value={sustain}
          handleChange={(e) => {
            const newSustain = parseFloat(e.target.value);
            setSustain(newSustain); // UI state update
            debouncedOnChange({ attack, decay, sustain: newSustain, release }); // Debounced synth update
            debouncedOnParameterChange(); // Debounced preset marking
          }}
        />
      </div>
      <div title="Time for sound to fade out after note ends (0-2s, limited to prevent voice accumulation with high BPM).">
        <Slider
          inputName="synth-release"
          labelText="Release"
          min={0}
          max={2}
          step={0.01}
          value={release}
          handleChange={(e) => {
            const newRelease = parseFloat(e.target.value);
            setRelease(newRelease); // UI state update
            debouncedOnChange({ attack, decay, sustain, release: newRelease }); // Debounced synth update
            debouncedOnParameterChange(); // Debounced preset marking
          }}
        />
      </div>
    </div>
  );
}

export default SynthEnvelopeControl;
