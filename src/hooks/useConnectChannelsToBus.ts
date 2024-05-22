/* 
  This hook connects an array of channels to a bus.
  It sends the channels to the bus and then connects them to the it.
  This is useful for sending audio sources (e.g., oscillators) to their effects bus
*/

import * as Tone from "tone";

export function useConnectChannelsToBus(
  channels: Tone.Channel[],
  bus: Tone.Channel,
  busName: string
): void {
  channels.forEach((channel) => {
    channel.send(busName);
    channel.connect(bus);
  });
}
