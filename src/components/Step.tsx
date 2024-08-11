import type { Step } from "../types/Step";
import { clsx } from "clsx";

interface StepProps {
  handleClick: () => void;
  isCurrentBeat: boolean;
  step: Step;
}

function Step({
  handleClick,
  isCurrentBeat,
  step: { frequency, isActive },
}: StepProps) {
  return (
    <div>
      <p>{frequency}</p>
      <p className={isActive ? "text-green-500" : "text-gray-500"}>
        {isActive ? "active" : "inactive"}
      </p>
      <button
        className={clsx(
          "w-8 h-8 rounded-full border-2 border-white",
          isActive && "bg-green-500",
          !isActive && "bg-gray-500",
          isCurrentBeat && "bg-pink-500",
          isCurrentBeat && isActive && "bg-yellow-500"
        )}
        onClick={handleClick}
      />
    </div>
  );
}

export default Step;
