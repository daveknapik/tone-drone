import { useId } from "react";

interface SliderProps {
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  inputName: string;
  labelText?: string;
  max: number;
  min: number;
  step?: number;
  value: number;
}

function Slider({
  handleChange,
  inputName,
  labelText,
  max,
  min,
  step,
  value,
}: SliderProps) {
  const id = useId();

  return (
    <div className="flex space-x-2">
      <label htmlFor={id} className={labelText ? "w-24" : ""}>
        {labelText ? labelText : inputName.charAt(0).toUpperCase()}
      </label>
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
