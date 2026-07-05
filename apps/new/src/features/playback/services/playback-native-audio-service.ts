import SynqNativeAudio from "@synq/native-audio";
import type {
  PlaybackCommandRuntime,
  PlaybackTrack,
} from "@synq/native-audio";
import { setAudioModeAsync } from "expo-audio";

import type { PlaybackQueueItem } from "../types/playback-state";

export const playbackAdAudio =
  require("../../../assets/audio/ad.mp3") as number;

export type SynqNativePlaybackAdapter = PlaybackCommandRuntime;

export const getSynqNativePlaybackTrack = (
  item: PlaybackQueueItem,
): PlaybackTrack => ({
  albumTitle: item.album,
  artistName: item.artist,
  durationMs: item.duration ?? undefined,
  id: String(item.id),
  title: item.title,
  uri: item.pathToFile ?? "",
});

export const configurePlaybackAudio = async () => {
  SynqNativeAudio.getModuleName();

  await setAudioModeAsync({
    allowsRecording: false,
    interruptionMode: "doNotMix",
    interruptionModeAndroid: "duckOthers",
    playsInSilentMode: true,
    shouldPlayInBackground: true,
    shouldRouteThroughEarpiece: false,
  });
};
