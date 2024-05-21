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
