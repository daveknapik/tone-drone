import { clsx } from "clsx";

interface StepProps {
  handleClick: () => void;
  isCurrentBeat: boolean;
  step: boolean;
  oscIndex: number;
  stepIndex: number;
}

function Step({
  handleClick,
  isCurrentBeat,
  step,
  oscIndex,
  stepIndex,
}: StepProps) {
  return (
    <div>
      <button
        className={clsx(
          "w-8 h-8 rounded-full border-2 border-white",
          step && "bg-green-500",
          !step && "bg-gray-500",
          isCurrentBeat && "bg-pink-500",
          isCurrentBeat && step && "bg-yellow-300"
        )}
        onClick={handleClick}
        data-testid={`step-${oscIndex}-${stepIndex}`}
        aria-label={`Oscillator ${oscIndex + 1}, Step ${stepIndex + 1}`}
      />
    </div>
  );
}

export default Step;
