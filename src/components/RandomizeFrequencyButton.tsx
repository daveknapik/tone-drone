/**
 * Button component for randomizing oscillator frequencies to musical scales
 */

import Button from "./Button";
import DiceIcon from "./icons/DiceIcon";

interface RandomizeFrequencyButtonProps {
  onClick: () => void;
  className?: string;
}

/**
 * Button for randomizing oscillator frequencies to musical scales
 * Displays a dice icon to indicate randomization
 */
function RandomizeFrequencyButton({
  onClick,
  className = "",
}: RandomizeFrequencyButtonProps) {
  return (
    <Button
      handleClick={onClick}
      className={className}
      icon={<DiceIcon size={16} />}
      ariaLabel="Randomize frequencies to musical scale"
      title="Randomize frequencies to musical scale"
      testId="randomize-frequency-button"
    >
      Frequencies
    </Button>
  );
}

export default RandomizeFrequencyButton;
