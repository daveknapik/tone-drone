import type { Step } from "../types/Step";

interface StepProps {
  step: Step;
  handleClick: () => void;
}

function Step({ step: { frequency, isActive }, handleClick }: StepProps) {
  return (
    <div>
      <p>{frequency}</p>
      <p className={isActive ? "text-green-500" : "text-gray-500"}>
        {isActive ? "active" : "inactive"}
      </p>
      <button onClick={handleClick}>foo</button>
    </div>
  );
}

export default Step;
