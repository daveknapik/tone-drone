import { useEffect, useState, useImperativeHandle, useRef } from "react";
import Slider from "./Slider";
import OptionsSelector from "./OptionsSelector";
import {
  GristleizerHandle,
  GristleizerParams,
  GristleizerMode,
  GristleizerWaveform,
} from "../types/GristleizerParams";
import { useRampedParameter } from "../hooks/useRampedParameter";
import { GristleizerEffect } from "../hooks/useGristleizer";

interface GristleizerProps {
  gristleizer: React.RefObject<GristleizerEffect | null>;
  ref?: React.Ref<GristleizerHandle>;
  onParameterChange?: () => void;
}

function Gristleizer({
  gristleizer,
  ref,
  onParameterChange,
}: GristleizerProps) {
  const [bias, setBias] = useState(0.5);
  const [gain, setGain] = useState(0);
  const [filterMix, setFilterMix] = useState(0);
  const [freq, setFreq] = useState(4);
  const [depth, setDepth] = useState(0);
  const [level, setLevel] = useState(1);
  const [mode, setMode] = useState<GristleizerMode>("vca");
  const [waveform, setWaveform] = useState<GristleizerWaveform>("triangle");
  const [wet, setWet] = useState(0);

  // Keep a ref with current state values for imperative access
  const paramsRef = useRef<GristleizerParams>({
    bias,
    gain,
    filterMix,
    freq,
    depth,
    level,
    mode,
    waveform,
    wet,
  });

  // Update ref whenever state changes
  useEffect(() => {
    paramsRef.current = {
      bias,
      gain,
      filterMix,
      freq,
      depth,
      level,
      mode,
      waveform,
      wet,
    };
  }, [bias, gain, filterMix, freq, depth, level, mode, waveform, wet]);

  // Smooth ramped parameter updates (prevents clicking)
  const biasRamped = useRampedParameter(
    gristleizer.current?.bias,
    onParameterChange
  );
  const gainRamped = useRampedParameter(
    gristleizer.current?.gain,
    onParameterChange
  );
  const filterMixRamped = useRampedParameter(
    gristleizer.current?.filterMix,
    onParameterChange
  );
  const freqRamped = useRampedParameter(
    gristleizer.current?.freq,
    onParameterChange
  );
  const depthRamped = useRampedParameter(
    gristleizer.current?.depth,
    onParameterChange
  );
  const levelRamped = useRampedParameter(
    gristleizer.current?.level as { rampTo: (value: number, rampTime: number) => void } | undefined,
    onParameterChange
  );
  const wetRamped = useRampedParameter(
    gristleizer.current?.wet,
    onParameterChange
  );

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    getParams: (): GristleizerParams => paramsRef.current,
    setParams: (params: GristleizerParams) => {
      // Apply audio parameters with smooth ramping
      biasRamped.rampTo(params.bias);
      gainRamped.rampTo(params.gain);
      filterMixRamped.rampTo(params.filterMix);
      freqRamped.rampTo(params.freq);
      depthRamped.rampTo(params.depth);
      levelRamped.rampTo(params.level);
      wetRamped.rampTo(params.wet);

      // Update React state for UI
      setBias(params.bias);
      setGain(params.gain);
      setFilterMix(params.filterMix);
      setFreq(params.freq);
      setDepth(params.depth);
      setLevel(params.level);
      setMode(params.mode);
      setWaveform(params.waveform);
      setWet(params.wet);
    },
  }));

  // Apply initial parameter values on mount
  useEffect(() => {
    biasRamped.rampTo(bias);
    gainRamped.rampTo(gain);
    filterMixRamped.rampTo(filterMix);
    freqRamped.rampTo(freq);
    depthRamped.rampTo(depth);
    levelRamped.rampTo(level);
    wetRamped.rampTo(wet);
  }, []); // Empty deps - only run on mount

  // Update mode and waveform (non-ramped parameters)
  useEffect(() => {
    if (gristleizer.current) {
      gristleizer.current.setMode(mode);
    }
  }, [gristleizer, mode]);

  useEffect(() => {
    if (gristleizer.current) {
      gristleizer.current.setWaveform(waveform);
    }
  }, [gristleizer, waveform]);

  // Handle BIAS control (context-dependent parameter)
  // In VCA mode: affects tremolo intensity and distortion character
  // In VCF mode: controls filter center frequency
  useEffect(() => {
    if (gristleizer.current) {
      if (mode === "vca") {
        // In VCA mode, bias affects the tremolo depth offset
        // Map bias (0-1) to a useful range for tremolo character
        const tremoloOffset = bias * 0.5; // Subtle effect
        gristleizer.current.tremolo.depth.rampTo(depth + tremoloOffset, 0.05);
      } else {
        // In VCF mode, bias controls filter center frequency
        // Map bias (0-1) to frequency range (100 Hz - 5000 Hz)
        const minFreq = 100;
        const maxFreq = 5000;
        const filterFreq = minFreq + bias * (maxFreq - minFreq);
        gristleizer.current.filter.frequency.rampTo(filterFreq, 0.05);
      }
    }
  }, [gristleizer, bias, mode, depth]);

  return (
    <div className="sm:place-items-center sm:border-2 sm:rounded sm:border-pink-500 dark:sm:border-sky-300 p-5">
      <div className="col-span-full mb-1 text-center">Gristleizer</div>

      <Slider
        inputName="bias"
        min={0}
        max={1}
        value={bias}
        labelText={mode === "vca" ? "Bias (Intensity)" : "Bias (Filter Freq)"}
        step={0.01}
        handleChange={(e) => {
          const newBias = parseFloat(e.target.value);
          biasRamped.rampTo(newBias);
          setBias(newBias);
          biasRamped.markModified();
        }}
      />

      <Slider
        inputName="gain"
        min={0}
        max={1}
        value={gain}
        labelText="Gain (Distortion)"
        step={0.01}
        handleChange={(e) => {
          const newGain = parseFloat(e.target.value);
          gainRamped.rampTo(newGain);
          setGain(newGain);
          gainRamped.markModified();
        }}
      />

      <Slider
        inputName="freq"
        min={0.01}
        max={20}
        value={freq}
        labelText="Freq (LFO)"
        step={0.01}
        handleChange={(e) => {
          const newFreq = parseFloat(e.target.value);
          freqRamped.rampTo(newFreq);
          setFreq(newFreq);
          freqRamped.markModified();
        }}
      />

      <Slider
        inputName="depth"
        min={0}
        max={1}
        value={depth}
        labelText="Depth (LFO Amount)"
        step={0.01}
        handleChange={(e) => {
          const newDepth = parseFloat(e.target.value);
          depthRamped.rampTo(newDepth);
          setDepth(newDepth);
          depthRamped.markModified();
        }}
      />

      {mode === "vcf" && (
        <Slider
          inputName="filterMix"
          min={0}
          max={1}
          value={filterMix}
          labelText="Filter Mix"
          step={0.01}
          handleChange={(e) => {
            const newFilterMix = parseFloat(e.target.value);
            filterMixRamped.rampTo(newFilterMix);
            setFilterMix(newFilterMix);
            filterMixRamped.markModified();
          }}
        />
      )}

      <Slider
        inputName="level"
        min={0}
        max={1}
        value={level}
        labelText="Level (Output)"
        step={0.01}
        handleChange={(e) => {
          const newLevel = parseFloat(e.target.value);
          levelRamped.rampTo(newLevel);
          setLevel(newLevel);
          levelRamped.markModified();
        }}
      />

      <Slider
        inputName="wet"
        min={0}
        max={1}
        value={wet}
        labelText="Dry / Wet"
        step={0.01}
        handleChange={(e) => {
          const newWet = parseFloat(e.target.value);
          wetRamped.rampTo(newWet);
          setWet(newWet);
          wetRamped.markModified();
        }}
      />

      <div className="mt-3 space-y-2">
        <OptionsSelector<GristleizerMode>
          handleChange={(e) => {
            setMode(e.target.value as GristleizerMode);
            onParameterChange?.();
          }}
          value={mode}
          options={["vca", "vcf"]}
          useDropdownOnSmall={true}
          label="Mode"
          renderLabel={(option) => option.toUpperCase()}
        />

        <OptionsSelector<GristleizerWaveform>
          handleChange={(e) => {
            setWaveform(e.target.value as GristleizerWaveform);
            onParameterChange?.();
          }}
          value={waveform}
          options={["triangle", "sawtooth", "square"]}
          useDropdownOnSmall={true}
          label="Waveform"
        />
      </div>
    </div>
  );
}

export default Gristleizer;
