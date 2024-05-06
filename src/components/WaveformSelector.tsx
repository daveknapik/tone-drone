import { useId } from "react";

interface WaveformSelectorProps {
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  value: string;
  waveforms: string[];
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
        <div key={waveform}>
          <input
            name={`waveform-${id}`}
            type="radio"
            id={`waveform-${waveform}-${id}`}
            value={waveform}
            checked={value === waveform}
            onChange={handleChange}
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
