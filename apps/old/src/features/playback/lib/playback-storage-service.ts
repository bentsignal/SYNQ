import AsyncStorage from "@react-native-async-storage/async-storage";

import { playbackStorageKeys } from "@/src/features/playback/lib/playback-storage-keys";

type PlaybackStorageKey = keyof typeof playbackStorageKeys;

export const getPlaybackStorageItem = (key: PlaybackStorageKey) => {
  return AsyncStorage.getItem(playbackStorageKeys[key]);
};

export const setPlaybackStorageItem = (
  key: PlaybackStorageKey,
  value: string,
) => {
  return AsyncStorage.setItem(playbackStorageKeys[key], value);
};
