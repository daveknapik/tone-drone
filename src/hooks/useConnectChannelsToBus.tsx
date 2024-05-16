import * as Tone from "tone";

export function useConnectChannelsToBus(
  channels: Tone.Channel[],
  bus: Tone.Channel
): void {
  channels.forEach((channel) => {
    channel.send("mainAudioEffectsBus");
    channel.connect(bus);
  });
}
