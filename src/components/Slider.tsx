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
      <label
        htmlFor={id}
        className={labelText ? "w-18 md:w-24 basis-1/4" : "basis-2/8"}
      >
        {labelText ? labelText : inputName.charAt(0).toUpperCase()}
      </label>
      <input
        className="w-36 md:w-48 basis-5/8"
        id={id}
        max={max}
        min={min}
        name={inputName}
        onChange={handleChange}
        step={step}
        type="range"
        value={value}
      />
      <div className="w-6 md:w-8 basis-1/8">{value}</div>
    </div>
  );
}

export default Slider;
