import { useId } from "react";

interface WaveformSelectorProps {
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  value: string;
  waveforms: ["sine", "square", "triangle", "sawtooth"];
}

function WaveformSelector({
  handleChange,
  value,
  waveforms,
}: WaveformSelectorProps) {
  const id = useId();

  return (
    <div className="flex items-center space-x-2">
      {waveforms.map((waveform) => (
        <div key={waveform} className="flex space-x-2">
          <input
            checked={value === waveform}
            id={`waveform-${waveform}-${id}`}
            name={`waveform-${id}`}
            onChange={handleChange}
            type="radio"
            value={waveform}
          />
          <label htmlFor={`waveform-${waveform}-${id}`}>
            {waveform.charAt(0).toUpperCase() + waveform.slice(1)}
          </label>
        </div>
      ))}
    </div>
  );
}

export default WaveformSelector;
