import CFG from "@/src/constants/Config";
import {
  getPlaybackStorageNumber,
  setPlaybackStorageBoolean,
  setPlaybackStorageNumber,
} from "@/src/features/playback/lib/playback-storage-service";
import { Track } from "react-native-track-player";

export const CHECK_FOR_AD_INTERVAL_SECONDS = 5;
const PLAYBACK_AD_TRACK_ID = -2;

export const isPlaybackAdTrack = (track?: Track) => {
  return track?.id === PLAYBACK_AD_TRACK_ID;
};

export const isAtPlaybackAdBoundary = ({
  duration,
  position,
}: {
  duration: number;
  position: number;
}) => {
  const timeToEnd = Math.floor(duration) - Math.floor(position);

  return timeToEnd !== 0 && timeToEnd <= 1;
};

export const didAdvanceOneSecond = ({
  currentPosition,
  previousPosition,
}: {
  currentPosition: number;
  previousPosition: number;
}) => {
  return Math.abs(Math.floor(currentPosition) - previousPosition) === 1;
};

export const shouldPersistPlaybackAdProgress = (timePlayed: number) => {
  return (
    timePlayed !== 0 && timePlayed % CHECK_FOR_AD_INTERVAL_SECONDS === 0
  );
};

export const resetPlaybackAdProgress = async () => {
  await setPlaybackStorageBoolean("playAd", false);
  await setPlaybackStorageNumber("timePlayed", 0);
};

export const incrementPlaybackAdTimePlayed = async () => {
  const previouslyPlayed = await getPlaybackStorageNumber("timePlayed");
  if (previouslyPlayed === null) {
    await setPlaybackStorageNumber(
      "timePlayed",
      CHECK_FOR_AD_INTERVAL_SECONDS,
    );

    return {
      shouldPlayAd: false,
      timePlayed: CHECK_FOR_AD_INTERVAL_SECONDS,
    };
  }

  const newTimePlayed = previouslyPlayed + CHECK_FOR_AD_INTERVAL_SECONDS;

  if (newTimePlayed >= CFG.playAdAfter) {
    await setPlaybackStorageBoolean("playAd", true);
  }

  await setPlaybackStorageNumber("timePlayed", newTimePlayed);

  return {
    shouldPlayAd: newTimePlayed >= CFG.playAdAfter,
    timePlayed: newTimePlayed,
  };
};
