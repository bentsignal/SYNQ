import { useThemeContext } from "@/src/context/ThemeProvider";
import { usePlaybackAdContext } from "@/src/features/playback/context/PlaybackAdProvider";
import { playAd } from "@/src/features/playback/lib/playback-ad-service";
import { skipToNextQueueTrack } from "@/src/features/playback/lib/player-queue-actions-service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback } from "react";

export const usePlaybackAdActions = () => {
  const { adURL, setAdPlaying, setShouldPlayAd } = usePlaybackAdContext();
  const { theme } = useThemeContext();

  const startAdPlayback = useCallback(async () => {
    setAdPlaying(true);
    await playAd(theme, adURL);
  }, [adURL, setAdPlaying, theme]);

  const resetAdPlaybackProgress = useCallback(async () => {
    await AsyncStorage.setItem("playAd", "false");
    await AsyncStorage.setItem("timePlayed", "0");
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
