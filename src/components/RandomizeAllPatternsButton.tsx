/**
 * Button component for randomizing all sequencer patterns
 */

import Button from "./Button";
import DiceIcon from "./icons/DiceIcon";

interface RandomizeAllPatternsButtonProps {
  onClick: () => void;
  className?: string;
}

/**
 * Button for randomizing all sequencer patterns based on global pattern density
 * Displays a dice icon to indicate randomization
 */
function RandomizeAllPatternsButton({
  onClick,
  className = "",
}: RandomizeAllPatternsButtonProps) {
  return (
    <Button
      handleClick={onClick}
      className={className}
      icon={<DiceIcon size={16} />}
      ariaLabel="Randomize all patterns based on density"
      title="Randomize all patterns based on density"
      testId="randomize-all-patterns-button"
    >
      Patterns
    </Button>
  );
}

export default RandomizeAllPatternsButton;
