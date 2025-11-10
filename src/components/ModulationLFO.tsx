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


  // Direct immediate updates - exactly like modulation-reference.html
  const updateLFOFrequencyImmediate = useCallback((freq: number) => {
    if (!lfo) return;
    // Use typed Param and a short ramp for smooth, click-free updates
    // Using augmented Tone.js types from src/types/tone.d.ts
    lfo.frequency.rampTo(freq, 0.08);
  }, [lfo]);

  const updateLFOAmplitudeImmediate = useCallback((amp: number) => {
    if (!lfo) return;
    // Use typed Param and a short ramp for smooth, click-free updates
    // Using augmented Tone.js types from src/types/tone.d.ts
    lfo.amplitude.rampTo(amp, 0.08);
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
    <div className="border-2 rounded border-pink-500 dark:border-sky-300 p-4" data-testid={`lfo-${lfoIndex}`}>
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
            // Reset phase to avoid discontinuity when changing rate
            // Using augmented Tone.js types from src/types/tone.d.ts
            if (lfo) {
              lfo.phase = 0;
            }
            // Update Tone.js immediately (like modulation-reference.html)
            updateLFOFrequencyImmediate(newFreq);
            // Update local state for UI (this causes re-render but should be OK)
            setFrequency(newFreq);
            // Debounced state persistence (for serialization)
            persistFrequency(newFreq);
            // Debounced end (no-op)
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
            // Update Tone.js immediately (like modulation-reference.html)
            updateLFOAmplitudeImmediate(newAmp);
            // Update local state for UI (this causes re-render but should be OK)
            setAmplitude(newAmp);
            // Debounced state persistence (for serialization)
            persistAmplitude(newAmp);
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

