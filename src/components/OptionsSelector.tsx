import { useId } from "react";

type OptionType = OscillatorType | BiquadFilterType;

interface OptionsSelectorProps<T extends OptionType> {
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  value: string;
  options: T[];
}

function OptionsSelector<T extends OptionType>({
  handleChange,
  value,
  options,
}: OptionsSelectorProps<T>) {
  const id = useId();

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
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </label>
        </div>
      ))}
    </div>
  );
}

export default OptionsSelector;
