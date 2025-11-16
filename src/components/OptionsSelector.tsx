import * as Tone from "tone";
import { clsx } from "clsx";
import { useId } from "react";
import { OscillatorType as OscTypeEnum } from "../types/OscillatorParams";
import type { GristleizerMode, GristleizerWaveform } from "../types/GristleizerParams";

type OptionType =
  | OscillatorType
  | BiquadFilterType
  | Tone.FilterRollOff
  | OscTypeEnum
  | GristleizerMode
  | GristleizerWaveform;

interface OptionsSelectorProps<T extends OptionType> {
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  justifyBetween?: boolean;
  options: T[];
  value: string | number;
  renderLabel?: (option: T) => React.ReactNode;
  useDropdownOnSmall?: boolean;
  label?: string;
}

function OptionsSelector<T extends OptionType>({
  handleChange,
  justifyBetween = false,
  options,
  value,
  renderLabel,
  useDropdownOnSmall = false,
  label,
}: OptionsSelectorProps<T>) {
  const id = useId();

  const buildLabelText = (value: string | number) => {
    if (typeof value === "string") {
      return value.charAt(0).toUpperCase() + value.slice(1);
    } else {
      return value;
    }
  };

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    // Create a synthetic event compatible with the radio input handler
    const syntheticEvent = {
      target: {
        value: event.target.value,
      },
    } as React.ChangeEvent<HTMLInputElement>;
    handleChange(syntheticEvent);
  };

  // Radio buttons version (always shown on large screens, conditionally on small)
  const radioButtons = (
    <div
      className={clsx(
        "flex flex-wrap space-x-2",
        justifyBetween && "justify-between",
        useDropdownOnSmall && "hidden sm:flex"
      )}
    >
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
            {renderLabel ? renderLabel(option) : buildLabelText(option)}
          </label>
        </div>
      ))}
    </div>
  );

  // Dropdown version (only shown on small screens if useDropdownOnSmall is true)
  const dropdown = useDropdownOnSmall && (
    <div className="sm:hidden w-full">
      {label && <label className="mr-2">{label}:</label>}
      <select
        value={value}
        onChange={handleSelectChange}
        className="bg-pink-100 dark:bg-gray-700 border border-pink-500 dark:border-sky-300 rounded px-2 py-1 w-full"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {renderLabel ? renderLabel(option) : buildLabelText(option)}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className={clsx(useDropdownOnSmall && "w-full")}>
      {dropdown}
      {radioButtons}
    </div>
  );
}

export default OptionsSelector;
