import { useAudioContext } from "../hooks/useAudioContext";
import { useKeyDown } from "../hooks/useKeyDown";
import Button from "./Button";

function PlayPauseSequencerButton() {
  useKeyDown(() => {
    toggleSequencerPlay();
  }, [" "]);

  const { handleBrowserAudioStart, isTransportRunning, toggleTransport } =
    useAudioContext();

  const toggleSequencerPlay = () => {
    void handleBrowserAudioStart();
    toggleTransport();
  };

  return (
    <Button
      handleClick={toggleSequencerPlay}
      isActive={isTransportRunning}
      testId="play-pause-button"
    >
      {isTransportRunning ? "Pause Sequences" : "Play Sequences"}
    </Button>
  );
}

export default PlayPauseSequencerButton;
