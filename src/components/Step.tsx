import { clsx } from "clsx";

interface StepProps {
  handleClick: () => void;
  isCurrentBeat: boolean;
  step: boolean;
}

function Step({ handleClick, isCurrentBeat, step }: StepProps) {
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
      />
    </div>
  );
}

export default Step;
