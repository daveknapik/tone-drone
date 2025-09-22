import { useId } from "react";

interface SliderProps {
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  inputName: string;
  labelText?: string;
  max: number;
  min: number;
  step?: number;
  value: number;
  logarithmic?: boolean;
}

function Slider({
  handleChange,
  inputName,
  labelText,
  max,
  min,
  step,
  value,
  logarithmic = false,
}: SliderProps) {
  const id = useId();

  const toLogarithmic = (value: number): number => {
    const sign = Math.sign(value);
    return sign * Math.log(Math.abs(value) + 1); // +1 to handle value=0
  };

  const toLinear = (value: number): number => {
    const sign = Math.sign(value);
    return sign * (Math.exp(Math.abs(value)) - 1); // -1 to reverse the +1 added in toLogarithmic
  };

  const handleLogChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const linearValue = parseFloat(e.target.value);
    console.log("linear: " + linearValue);
    const transformedValue = logarithmic ? toLinear(linearValue) : linearValue;
    console.log(transformedValue);

    // Limit the transformed value to 2 decimal places
    const valueLimitedPrecision = parseFloat(transformedValue.toFixed(2));

    // Create a synthetic event with the transformed value because handleChange expects a React.ChangeEvent<HTMLInputElement>
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        value: valueLimitedPrecision.toString(),
      },
    };

    handleChange(syntheticEvent);
  };

  const sliderValue = logarithmic ? toLogarithmic(value) : value;

  return (
    <div className="flex space-x-2">
      <label
        htmlFor={id}
        className={labelText ? "w-18 md:w-24 basis-1/4" : "basis-2/8"}
      >
        {labelText ?? inputName.charAt(0).toUpperCase()}
      </label>
      <input
        className="w-36 md:w-48 basis-5/8"
        id={id}
        max={logarithmic ? toLogarithmic(max) : max}
        min={logarithmic ? toLogarithmic(min) : min}
        name={inputName}
        onChange={logarithmic ? handleLogChange : handleChange}
        step={step}
        type="range"
        value={sliderValue}
      />
      <div className="w-6 md:w-8 basis-1/8">{value}</div>
    </div>
  );
}

export default Slider;
