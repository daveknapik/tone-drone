import * as Tone from "tone";
import { useState, useEffect, useCallback } from "react";
import { useDebounceCallback } from "usehooks-ts";
import Slider from "./Slider";
import OptionsSelector from "./OptionsSelector";
import { LFOPolarityMode } from "../types/ModulationMatrixParams";

interface ModulationLFOProps {
  lfo: Tone.LFO;
  lfoIndex: number;
  initialFrequency?: number;
  initialType?: OscillatorType;
  initialAmplitude?: number;
  initialPolarityMode?: LFOPolarityMode;
  onFrequencyChange?: (frequency: number) => void;
  onTypeChange?: (type: OscillatorType) => void;
  onAmplitudeChange?: (amplitude: number) => void;
  onPolarityModeChange?: (mode: LFOPolarityMode) => void;
  onParameterChange?: () => void;
}

function ModulationLFO({
  lfo,
  lfoIndex,
  initialFrequency = 0.5,
  initialType = "sine",
  initialAmplitude = 1,
  initialPolarityMode = "bipolar",
  onFrequencyChange,
  onTypeChange,
  onAmplitudeChange,
  onPolarityModeChange,
  onParameterChange,
}: ModulationLFOProps) {
  const [frequency, setFrequency] = useState(initialFrequency);
  const [type, setType] = useState<OscillatorType>(initialType);
  const [amplitude, setAmplitude] = useState(initialAmplitude);
  const [polarityMode, setPolarityMode] = useState<LFOPolarityMode>(initialPolarityMode);

  // Imperative Tone.js updates (called immediately on every slider change)
  const updateLFOFrequencyImmediate = useCallback((freq: number) => {
    if (lfo) {
      // Direct value assignment - LFO parameters don't need ramping
      // The LFO output is already smooth, changing frequency/amplitude instantly is safe
      lfo.frequency.value = freq;
    }
  }, [lfo]);

  const updateLFOAmplitudeImmediate = useCallback((amp: number) => {
    if (lfo) {
      // Direct value assignment - LFO parameters don't need ramping
      lfo.amplitude.value = amp;
    }
  }, [lfo]);

  // Debounced state persistence callbacks (for serialization only)
  const persistFrequency = useDebounceCallback((freq: number) => {
    onFrequencyChange?.(freq);
    onParameterChange?.(); // Call AFTER dragging stops
  }, 500);

  const persistAmplitude = useDebounceCallback((amp: number) => {
    onAmplitudeChange?.(amp);
    onParameterChange?.(); // Call AFTER dragging stops
  }, 500);

  // Update LFO type immediately (non-audio-rate parameter)
  useEffect(() => {
    if (lfo) {
      lfo.type = type;
    }
  }, [lfo, type]);

  return (
    <div className="border-2 rounded border-pink-500 dark:border-sky-300 p-4">
      <h4 className="text-center font-semibold mb-3 text-pink-500 dark:text-sky-300">
        LFO {lfoIndex + 1}
      </h4>
      <div className="space-y-3">
        <Slider
          inputName={`lfo${lfoIndex}-frequency`}
          min={0.01}
          max={20}
          value={frequency}
          labelText="Rate (Hz)"
          step={0.01}
          handleChange={(e) => {
            const newFreq = parseFloat(e.target.value);
            setFrequency(newFreq); // 1. Immediate UI update (local state)
            updateLFOFrequencyImmediate(newFreq); // 2. Immediate Tone.js update (imperative)
            persistFrequency(newFreq); // 3. Debounced state persistence (500ms, serialization only)
            // Note: onParameterChange NOT called here - would trigger parent re-renders during drag
          }}
        />
        <Slider
          inputName={`lfo${lfoIndex}-amplitude`}
          min={0}
          max={1}
          value={amplitude}
          labelText="Amplitude"
          step={0.01}
          handleChange={(e) => {
            const newAmp = parseFloat(e.target.value);
            setAmplitude(newAmp); // 1. Immediate UI update (local state)
            updateLFOAmplitudeImmediate(newAmp); // 2. Immediate Tone.js update (imperative)
            persistAmplitude(newAmp); // 3. Debounced state persistence (500ms, serialization only)
            // Note: onParameterChange NOT called here - would trigger parent re-renders during drag
          }}
        />
        <OptionsSelector<OscillatorType>
          handleChange={(e) => {
            const newType = e.target.value as OscillatorType;
            setType(newType);
            onTypeChange?.(newType);
            onParameterChange?.();
          }}
          value={type}
          options={["sine", "triangle", "square", "sawtooth"]}
          useDropdownOnSmall={true}
          label="Wave"
        />

        {/* Polarity Mode Toggle */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-sm font-medium text-pink-500 dark:text-sky-300">
            Mode
          </span>
          <button
            onClick={() => {
              const newMode = polarityMode === "bipolar" ? "unipolar" : "bipolar";
              setPolarityMode(newMode);
              onPolarityModeChange?.(newMode);
              onParameterChange?.();
            }}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              polarityMode === "bipolar"
                ? "bg-pink-500 dark:bg-sky-500 text-white"
                : "bg-pink-200 dark:bg-sky-800 text-pink-900 dark:text-sky-100"
            }`}
            title={
              polarityMode === "bipolar"
                ? "Bipolar: -1 to +1 (click to switch)"
                : "Unipolar: 0 to +1 (click to switch)"
            }
          >
            {polarityMode === "bipolar" ? "±" : "+"}
            {" "}
            {polarityMode === "bipolar" ? "Bipolar" : "Unipolar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModulationLFO;

