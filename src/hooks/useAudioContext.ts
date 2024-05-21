import { useContext } from "react";
import AudioContext from "../context/audio";

export function useAudioContext() {
  const audioContext = useContext(AudioContext);

  if (!audioContext) {
    throw new Error(
      "useAudioContext must be used within an AudioContextProvider component"
    );
  }

  return audioContext;
}
