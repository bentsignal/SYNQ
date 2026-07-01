import CFG from "@/src/constants/Config";
import {
  getPlaybackStorageNumber,
  setPlaybackStorageBoolean,
  setPlaybackStorageNumber,
} from "@/src/features/playback/lib/playback-storage-service";

export const CHECK_FOR_AD_INTERVAL_SECONDS = 5;

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
