import * as Tone from "tone";
import { useState, useEffect } from "react";
import Slider from "./Slider";
import OptionsSelector from "./OptionsSelector";

interface ModulationLFOProps {
  lfo: Tone.LFO;
  lfoIndex: number;
  initialFrequency?: number;
  initialType?: OscillatorType;
  initialAmplitude?: number;
  onFrequencyChange?: (frequency: number) => void;
  onTypeChange?: (type: OscillatorType) => void;
  onAmplitudeChange?: (amplitude: number) => void;
  onParameterChange?: () => void;
}

function ModulationLFO({
  lfo,
  lfoIndex,
  initialFrequency = 0.5,
  initialType = "sine",
  initialAmplitude = 1,
  onFrequencyChange,
  onTypeChange,
  onAmplitudeChange,
  onParameterChange,
}: ModulationLFOProps) {
  const [frequency, setFrequency] = useState(initialFrequency);
  const [type, setType] = useState<OscillatorType>(initialType);
  const [amplitude, setAmplitude] = useState(initialAmplitude);

  // Update LFO when parameters change
  useEffect(() => {
    if (lfo) {
      lfo.frequency.value = frequency;
      lfo.type = type;
      lfo.amplitude.value = amplitude;
    }
  }, [lfo, frequency, type, amplitude]);

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
            setFrequency(newFreq);
            onFrequencyChange?.(newFreq);
            onParameterChange?.();
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
            setAmplitude(newAmp);
            onAmplitudeChange?.(newAmp);
            onParameterChange?.();
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
      </div>
    </div>
  );
}

export default ModulationLFO;

