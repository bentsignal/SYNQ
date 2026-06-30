import { useThemeContext } from "@/src/context/ThemeProvider";
import { usePlaybackAdContext } from "@/src/features/playback/context/PlaybackAdProvider";
import { playAd } from "@/src/features/playback/lib/player-track-service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback } from "react";
import TrackPlayer from "react-native-track-player";

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
    await TrackPlayer.skipToNext();
  }, [setAdPlaying, setShouldPlayAd]);

  return {
    resetAdPlaybackProgress,
    skipActiveAdForPremium,
    startAdPlayback,
  };
};
