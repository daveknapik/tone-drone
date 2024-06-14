import * as Tone from "tone";
import { useId } from "react";

type OptionType = OscillatorType | BiquadFilterType | Tone.FilterRollOff;

interface OptionsSelectorProps<T extends OptionType> {
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  value: string | number;
  options: T[];
}

function OptionsSelector<T extends OptionType>({
  handleChange,
  value,
  options,
}: OptionsSelectorProps<T>) {
  const id = useId();

  const buildLabelText = (value: string | number) => {
    if (typeof value === "string") {
      return value.charAt(0).toUpperCase() + value.slice(1);
    } else {
      return value;
    }
  };

  return (
    <div className="flex flex-wrap items-center space-x-2">
      {options.map((option) => (
        <div key={option} className="flex space-x-2">
          <input
            checked={value === option}
            id={`option-${option}-${id}`}
            name={`option-${id}`}
            onChange={handleChange}
            type="radio"
            value={option}
          />
          <label htmlFor={`option-${option}-${id}`}>
            {buildLabelText(option)}
          </label>
        </div>
      ))}
    </div>
  );
}

export default OptionsSelector;
