import TrackPlayer, { useTrackPlayerEvents, Event, Capability } from "react-native-track-player";

export const setupPlayer = async () => {
  await TrackPlayer.setupPlayer();
  TrackPlayer.updateOptions({
    capabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.SkipToNext,
      Capability.SkipToPrevious,
      Capability.Skip,
      Capability.Stop,
      Capability.SeekTo,
    ],
  })
}