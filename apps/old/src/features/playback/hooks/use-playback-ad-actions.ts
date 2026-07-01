import { useThemeContext } from "@/src/features/theme/context/ThemeProvider";
import { usePlaybackAdContext } from "@/src/features/playback/context/PlaybackAdProvider";
import { playAd } from "@/src/features/playback/lib/playback-ad-service";
import {
  setPlaybackStorageBoolean,
  setPlaybackStorageNumber,
} from "@/src/features/playback/lib/playback-storage-service";
import { skipToNextQueueTrack } from "@/src/features/playback/lib/playback-transport-service";
import { useCallback } from "react";

export const usePlaybackAdActions = () => {
  const { adURL, setAdPlaying, setShouldPlayAd } = usePlaybackAdContext();
  const { theme } = useThemeContext();

  const startAdPlayback = useCallback(async () => {
    setAdPlaying(true);
    await playAd(theme, adURL);
  }, [adURL, setAdPlaying, theme]);

  const resetAdPlaybackProgress = useCallback(async () => {
    await setPlaybackStorageBoolean("playAd", false);
    await setPlaybackStorageNumber("timePlayed", 0);
    setShouldPlayAd(false);
  }, [setShouldPlayAd]);

  const skipActiveAdForPremium = useCallback(async () => {
    setAdPlaying(false);
    setShouldPlayAd(false);
    await skipToNextQueueTrack();
  }, [setAdPlaying, setShouldPlayAd]);

  return {
    resetAdPlaybackProgress,
    skipActiveAdForPremium,
    startAdPlayback,
  };
};
