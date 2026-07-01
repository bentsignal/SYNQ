import { useCallback, useEffect, useRef } from "react";
import CFG from "@/src/constants/Config";
import { usePremiumContext } from "@/src/features/premium/context/PremiumProvider";
import { usePlaybackAdContext } from "@/src/features/playback/context/PlaybackAdProvider";
import { usePlaybackAdActions } from "@/src/features/playback/hooks/use-playback-ad-actions";
import {
  getPlaybackStorageItem,
  setPlaybackStorageItem,
} from "@/src/features/playback/lib/playback-storage-service";
import { type Track } from "react-native-track-player";

const CHECK_FOR_AD_INTERVAL_SECONDS = 5;

type PlaybackAdTimingEffectsParams = {
  duration: number;
  position: number;
  track?: Track;
};

export const usePlaybackAdTimingEffects = ({
  duration,
  position,
  track,
}: PlaybackAdTimingEffectsParams) => {
  const { adPlaying, shouldPlayAd, setAdPlaying, setShouldPlayAd } =
    usePlaybackAdContext();
  const { premium } = usePremiumContext();
  const {
    resetAdPlaybackProgress,
    skipActiveAdForPremium,
    startAdPlayback,
  } = usePlaybackAdActions();

  const previousPosition = useRef(0);
  const timePlayed = useRef(0);

  useEffect(() => {
    if (track?.id === -2) {
      setAdPlaying(true);
      if (premium) {
        skipActiveAdForPremium();
      }
    } else {
      setAdPlaying(false);
    }
  }, [premium, setAdPlaying, skipActiveAdForPremium, track]);

  const updateTimePlayed = useCallback(async () => {
    const previouslyPlayed = await getPlaybackStorageItem("timePlayed");
    if (previouslyPlayed !== null) {
      const previouslyPlayedInt = parseInt(previouslyPlayed);
      const newTimePlayed =
        previouslyPlayedInt + CHECK_FOR_AD_INTERVAL_SECONDS;
      if (newTimePlayed >= CFG.playAdAfter) {
        await setPlaybackStorageItem("playAd", "true");
        setShouldPlayAd(true);
      }
      await setPlaybackStorageItem("timePlayed", newTimePlayed.toString());
    } else {
      await setPlaybackStorageItem(
        "timePlayed",
        CHECK_FOR_AD_INTERVAL_SECONDS.toString(),
      );
    }
  }, [setShouldPlayAd]);

  useEffect(() => {
    if (premium && adPlaying) {
      skipActiveAdForPremium();
      return;
    } else if (premium) return;

    const timeToEnd = Math.floor(duration) - Math.floor(position);
    if (timeToEnd !== 0 && timeToEnd <= 1) {
      if (!premium && !adPlaying && shouldPlayAd) {
        startAdPlayback();
      } else if (adPlaying) {
        resetAdPlaybackProgress();
        timePlayed.current = 0;
      }
    }

    if (adPlaying) return;

    const current = Math.floor(position);
    const difference = Math.abs(current - previousPosition.current);
    if (difference === 1) {
      timePlayed.current += 1;
    }
    if (
      timePlayed.current !== 0 &&
      timePlayed.current % CHECK_FOR_AD_INTERVAL_SECONDS === 0
    ) {
      updateTimePlayed();
    }
    previousPosition.current = current;
  }, [
    adPlaying,
    duration,
    position,
    premium,
    resetAdPlaybackProgress,
    shouldPlayAd,
    skipActiveAdForPremium,
    startAdPlayback,
    updateTimePlayed,
  ]);
};
