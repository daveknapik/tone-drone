import * as Tone from "tone";
import Slider from "./Slider";
import OptionsSelector from "./OptionsSelector";
import { useState, useImperativeHandle, useRef, useEffect } from "react";
import {
  GristleizerHandle,
  GristleizerParams,
  GristleizerMode,
  GristleizerWaveform,
} from "../types/GristleizerParams";
import { useRampedParameter } from "../hooks/useRampedParameter";

interface GristleizerProps {
  gristleizer: React.RefObject<Tone.AutoFilter>;
  ref?: React.Ref<GristleizerHandle>;
  onParameterChange?: () => void;
}

function Gristleizer({
  gristleizer,
  ref,
  onParameterChange,
}: GristleizerProps) {
  const [mode, setMode] = useState<GristleizerMode>("vca");
  const [waveform, setWaveform] = useState<GristleizerWaveform>("sine");
  const [freq, setFreq] = useState(4);
  const [depth, setDepth] = useState(0);
  const [filterFreq, setFilterFreq] = useState(200);
  const [filterQ, setFilterQ] = useState(1);
  const [wet, setWet] = useState(0);

  // Keep a ref with current state values for imperative access
  const paramsRef = useRef<GristleizerParams>({
    mode,
    waveform,
    freq,
    depth,
    filterFreq,
    filterQ,
    wet,
  });

  // Update ref whenever state changes
  useEffect(() => {
    paramsRef.current = {
      mode,
      waveform,
      freq,
      depth,
      filterFreq,
      filterQ,
      wet,
    };
  }, [mode, waveform, freq, depth, filterFreq, filterQ, wet]);

  // Smooth ramped parameter updates (prevents clicking)
  const freqRamped = useRampedParameter(
    gristleizer.current?.frequency,
    onParameterChange
  );
  const depthRamped = useRampedParameter(
    gristleizer.current?.depth,
    onParameterChange
  );
  const filterFreqRamped = useRampedParameter(
    gristleizer.current?.baseFrequency as unknown as { rampTo: (value: number, rampTime: number) => void } | undefined,
    onParameterChange
  );
  const filterQRamped = useRampedParameter(
    gristleizer.current?.filter.Q,
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
      freqRamped.rampTo(params.freq);
      depthRamped.rampTo(params.depth);
      filterFreqRamped.rampTo(params.filterFreq);
      filterQRamped.rampTo(params.filterQ);
      wetRamped.rampTo(params.wet);

      // Update React state for UI
      setMode(params.mode);
      setWaveform(params.waveform);
      setFreq(params.freq);
      setDepth(params.depth);
      setFilterFreq(params.filterFreq);
      setFilterQ(params.filterQ);
      setWet(params.wet);
    },
  }));

  // Apply initial parameter values on mount
  useEffect(() => {
    freqRamped.rampTo(freq);
    depthRamped.rampTo(depth);
    filterFreqRamped.rampTo(filterFreq);
    filterQRamped.rampTo(filterQ);
    wetRamped.rampTo(wet);
  }, []); // Empty deps - only run on mount

  // Update waveform (non-ramped parameter)
  useEffect(() => {
    if (gristleizer.current) {
      gristleizer.current.type = waveform;
    }
  }, [gristleizer, waveform]);

  // Update octaves based on mode
  // VCA mode: smaller range (tremolo-like), VCF mode: wider range (wah-like)
  useEffect(() => {
    if (gristleizer.current) {
      const octaves = mode === "vca" ? 1 : 2.6;
      gristleizer.current.octaves = octaves;
    }
  }, [gristleizer, mode]);

  return (
    <div className="sm:place-items-center sm:border-2 sm:rounded sm:border-pink-500 dark:sm:border-sky-300 p-5">
      <div className="col-span-full mb-1 text-center">Gristleizer</div>

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
        options={["sine", "triangle", "square", "sawtooth"]}
        useDropdownOnSmall={true}
        label="Waveform"
      />

      <Slider
        inputName="freq"
        min={0.1}
        max={20}
        value={freq}
        labelText="LFO Freq"
        step={0.1}
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
        labelText="Depth"
        step={0.01}
        handleChange={(e) => {
          const newDepth = parseFloat(e.target.value);
          depthRamped.rampTo(newDepth);
          setDepth(newDepth);
          depthRamped.markModified();
        }}
      />

      <Slider
        inputName="filterFreq"
        min={20}
        max={5000}
        value={filterFreq}
        labelText="Filter Freq"
        step={1}
        handleChange={(e) => {
          const newFilterFreq = parseFloat(e.target.value);
          filterFreqRamped.rampTo(newFilterFreq);
          setFilterFreq(newFilterFreq);
          filterFreqRamped.markModified();
        }}
      />

      <Slider
        inputName="filterQ"
        min={0.5}
        max={10}
        value={filterQ}
        labelText="Filter Q"
        step={0.1}
        handleChange={(e) => {
          const newFilterQ = parseFloat(e.target.value);
          filterQRamped.rampTo(newFilterQ);
          setFilterQ(newFilterQ);
          filterQRamped.markModified();
        }}
      />

      <Slider
        inputName="wet"
        min={0}
        max={1}
        value={wet}
        step={0.01}
        labelText="Dry / Wet"
        handleChange={(e) => {
          const newWet = parseFloat(e.target.value);
          wetRamped.rampTo(newWet);
          setWet(newWet);
          wetRamped.markModified();
        }}
      />
    </div>
  );
}

export default Gristleizer;
