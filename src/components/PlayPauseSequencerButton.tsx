import { useAudioContext } from "../hooks/useAudioContext";

function PlayPauseSequencerButton() {
  const { handleBrowserAudioStart, isTransportRunning, toggleTransport } =
    useAudioContext();

  const toggleSequencerPlay = () => {
    void handleBrowserAudioStart();
    toggleTransport();
  };

  return (
    <button
      className="border-2 rounded-md border-pink-500 dark:border-sky-300 px-2 py-1"
      onClick={() => {
        toggleSequencerPlay();
      }}
    >
      {isTransportRunning ? "Pause" : "Play"}
    </button>
  );
}

export default PlayPauseSequencerButton;
