import Slider from "./Slider";

interface PatternDensitySliderProps {
  value: number;
  onChange: (value: number) => void;
}

function PatternDensitySlider({ value, onChange }: PatternDensitySliderProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseFloat(e.target.value));
  };

  return (
    <Slider
      inputName="patternDensity"
      labelText="Density"
      min={0}
      max={100}
      step={1}
      value={value}
      handleChange={handleChange}
      testId="pattern-density-slider"
    />
  );
}

export default PatternDensitySlider;
