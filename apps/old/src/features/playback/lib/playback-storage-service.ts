import AsyncStorage from "@react-native-async-storage/async-storage";
import { type Track } from "react-native-track-player";

import { SourceType } from "@/src/constants/Types";
import { playbackStorageKeys } from "@/src/features/playback/lib/playback-storage-keys";

type PlaybackStorageKey = keyof typeof playbackStorageKeys;
type BooleanPlaybackStorageKey = "loop" | "playAd" | "shuffle";
type NumberPlaybackStorageKey =
  | "addOffset"
  | "lastTrackIndex"
  | "position"
  | "sourceId"
  | "sourceType"
  | "timePlayed";

export const getPlaybackStorageItem = (key: PlaybackStorageKey) => {
  return AsyncStorage.getItem(playbackStorageKeys[key]);
};

export const setPlaybackStorageItem = (
  key: PlaybackStorageKey,
  value: string,
) => {
  return AsyncStorage.setItem(playbackStorageKeys[key], value);
};

export const getPlaybackStorageBoolean = async (
  key: BooleanPlaybackStorageKey,
) => {
  const value = await getPlaybackStorageItem(key);
  if (value === null) {
    return null;
  }

  return value === "true";
};

export const setPlaybackStorageBoolean = (
  key: BooleanPlaybackStorageKey,
  value: boolean,
) => {
  return setPlaybackStorageItem(key, value.toString());
};

export const getPlaybackStorageNumber = async (
  key: NumberPlaybackStorageKey,
) => {
  const value = await getPlaybackStorageItem(key);
  if (value === null) {
    return null;
  }

  return Number(value);
};

export const setPlaybackStorageNumber = (
  key: NumberPlaybackStorageKey,
  value: number,
) => {
  return setPlaybackStorageItem(key, value.toString());
};

export const getPlaybackStorageQueue = async () => {
  const value = await getPlaybackStorageItem("queue");
  if (!value) {
    return null;
  }

  return JSON.parse(value) as Track[];
};

export const setPlaybackStorageQueue = (queue: Track[]) => {
  return setPlaybackStorageItem("queue", JSON.stringify(queue));
};

export const getPersistedPlaybackState = async () => {
  const shuffle = await getPlaybackStorageBoolean("shuffle");
  const loop = await getPlaybackStorageBoolean("loop");
  const sourceType = await getPlaybackStorageNumber("sourceType");
  const sourceId = await getPlaybackStorageNumber("sourceId");
  const queue = await getPlaybackStorageQueue();
  const lastTrackIndex = await getPlaybackStorageNumber("lastTrackIndex");
  const position = await getPlaybackStorageNumber("position");
  const addOffset = await getPlaybackStorageNumber("addOffset");

  return {
    addOffset,
    lastTrackIndex,
    loop,
    position,
    queue,
    shuffle,
    sourceId,
    sourceType: sourceType as SourceType | null,
  };
};
