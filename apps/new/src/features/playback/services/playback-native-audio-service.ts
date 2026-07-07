import SynqNativeAudio from "@synq/native-audio";
import type {
  PlaybackCommandRuntime,
  PlaybackTrack,
} from "@synq/native-audio";
import { setAudioModeAsync } from "expo-audio";
import * as FileSystem from "expo-file-system/legacy";

import { getImagePathFromHash } from "../../images/services/image-storage-service";
import type { PlaybackQueueItem } from "../types/playback-state";
import { getNativePlaybackTrackWithDependencies } from "./playback-native-track-mapper-service";

export const playbackAdAudio =
  require("../../../assets/audio/ad.mp3") as number;

export type SynqNativePlaybackAdapter = PlaybackCommandRuntime;

export const getSynqNativePlaybackTrack = (
  item: PlaybackQueueItem,
): PlaybackTrack =>
  getNativePlaybackTrackWithDependencies({
    documentDirectory: FileSystem.documentDirectory,
    getImagePathFromHash,
    item,
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
