/*
  This hook connects an array of channels to a bus.
  It sends the channels to the bus and then connects them to the it.
  This is useful for sending audio sources (e.g., oscillators) to their effects bus
*/

import * as Tone from "tone";

export function useConnectChannelsToBus(
  channels: (Tone.Channel | Tone.Synth)[],
  bus: Tone.Channel
): void {
  channels.forEach((channel) => {
    channel.connect(bus);
  });
}
