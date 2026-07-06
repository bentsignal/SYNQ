import SynqNativeAudio from "@synq/native-audio";
import type {
  PlaybackCommandRuntime,
  PlaybackTrack,
} from "@synq/native-audio";
import { setAudioModeAsync } from "expo-audio";
import * as FileSystem from "expo-file-system/legacy";

import { getImagePathFromHash } from "../../images/services/image-storage-service";
import type { PlaybackQueueItem } from "../types/playback-state";

export const playbackAdAudio =
  require("../../../assets/audio/ad.mp3") as number;

export type SynqNativePlaybackAdapter = PlaybackCommandRuntime;

const repairPlaybackFileUri = (uri: string | null | undefined) => {
  if (!uri) {
    return "";
  }

  const marker = "/Documents/library/";
  const markerIndex = uri.indexOf(marker);

  if (markerIndex === -1 || !FileSystem.documentDirectory) {
    return uri;
  }

  const libraryRelativePath = uri.slice(markerIndex + "/Documents/".length);
  return `${FileSystem.documentDirectory}${libraryRelativePath}`;
};

const getPlaybackArtworkUri = (artworkUri: string | null | undefined) => {
  if (!artworkUri) {
    return undefined;
  }

  if (
    artworkUri.startsWith("file://") ||
    artworkUri.startsWith("http://") ||
    artworkUri.startsWith("https://") ||
    artworkUri.startsWith("/")
  ) {
    return artworkUri;
  }

  return getImagePathFromHash(artworkUri).pathToSmallImage;
};

export const getSynqNativePlaybackTrack = (
  item: PlaybackQueueItem,
): PlaybackTrack => ({
  albumTitle: item.album,
  artistName: item.artist,
  artworkUri: getPlaybackArtworkUri(item.artworkUri),
  durationMs: item.duration ?? undefined,
  id: String(item.id),
  title: item.title,
  uri: repairPlaybackFileUri(item.pathToFile),
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
