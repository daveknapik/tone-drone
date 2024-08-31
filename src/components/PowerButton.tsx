import { useAudioContext } from "../hooks/useAudioContext";

function PowerButton() {
  const { handleBrowserAudioStart, isAudioEnabled } = useAudioContext();
  return (
    !isAudioEnabled && (
      <button
        className="border-2 rounded-md border-pink-500 dark:border-sky-300 px-2 py-1"
        onClick={() => {
          void handleBrowserAudioStart();
        }}
      >
        Start It
      </button>
    )
  );
}

export default PowerButton;
