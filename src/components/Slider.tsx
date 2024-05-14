import { useId } from "react";

interface SliderProps {
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  inputName: string;
  max: number;
  min: number;
  step?: number;
  value: number;
}

function Slider({
  handleChange,
  inputName,
  max,
  min,
  step,
  value,
}: SliderProps) {
  const id = useId();

  return (
    <div className="flex space-x-2">
      <label htmlFor={id}>{inputName.charAt(0).toUpperCase()}</label>
      <input
        className="w-48"
        id={id}
        max={max}
        min={min}
        name={inputName}
        onChange={handleChange}
        step={step}
        type="range"
        value={value}
      />
      <div>{value}</div>
    </div>
  );
}

export default Slider;
