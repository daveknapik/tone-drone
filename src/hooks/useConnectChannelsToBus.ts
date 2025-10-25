/*
  This hook connects an array of channels to a bus.
  It sends the channels to the bus and then connects them to the it.
  This is useful for sending audio sources (e.g., oscillators) to their effects bus
*/

import * as Tone from "tone";
import { useEffect } from "react";

export function useConnectChannelsToBus(
  channels: (Tone.Channel | Tone.Panner)[],
  bus: Tone.Channel
): void {
  useEffect(() => {
    if (!bus || !channels?.length) return;
    channels.forEach((channel) => {
      channel.connect(bus);
    });
    // No explicit cleanup needed; channels are disposed elsewhere
  }, [bus, channels]);
}
