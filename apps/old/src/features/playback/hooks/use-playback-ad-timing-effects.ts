import { useCallback, useEffect, useRef } from "react";
import CFG from "@/src/constants/Config";
import { usePremiumContext } from "@/src/context/PremiumProvider";
import { useThemeContext } from "@/src/context/ThemeProvider";
import { playAd } from "@/src/controllers/PlayerController";
import { usePlaybackAdContext } from "@/src/features/playback/context/PlaybackAdProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import TrackPlayer, { type Track } from "react-native-track-player";

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
  const { adPlaying, adURL, shouldPlayAd, setAdPlaying, setShouldPlayAd } =
    usePlaybackAdContext();
  const { theme } = useThemeContext();
  const { premium } = usePremiumContext();

  const previousPosition = useRef(0);
  const timePlayed = useRef(0);

  useEffect(() => {
    if (track?.id === -2) {
      setAdPlaying(true);
      if (premium) {
        setAdPlaying(false);
        setShouldPlayAd(false);
        TrackPlayer.skipToNext();
      }
    } else {
      setAdPlaying(false);
    }
  }, [premium, setAdPlaying, setShouldPlayAd, track]);

  const updateTimePlayed = useCallback(async () => {
    const previouslyPlayed = await AsyncStorage.getItem("timePlayed");
    if (previouslyPlayed !== null) {
      const previouslyPlayedInt = parseInt(previouslyPlayed);
      const newTimePlayed =
        previouslyPlayedInt + CHECK_FOR_AD_INTERVAL_SECONDS;
      if (newTimePlayed >= CFG.playAdAfter) {
        await AsyncStorage.setItem("playAd", "true");
        setShouldPlayAd(true);
      }
      await AsyncStorage.setItem("timePlayed", newTimePlayed.toString());
    } else {
      await AsyncStorage.setItem(
        "timePlayed",
        CHECK_FOR_AD_INTERVAL_SECONDS.toString(),
      );
    }
  }, [setShouldPlayAd]);

  useEffect(() => {
    if (premium && adPlaying) {
      setAdPlaying(false);
      setShouldPlayAd(false);
      TrackPlayer.skipToNext();
      return;
    } else if (premium) return;

    const timeToEnd = Math.floor(duration) - Math.floor(position);
    if (timeToEnd !== 0 && timeToEnd <= 1) {
      if (!premium && !adPlaying && shouldPlayAd) {
        playAd(theme, adURL);
      } else if (adPlaying) {
        AsyncStorage.setItem("playAd", "false");
        AsyncStorage.setItem("timePlayed", "0");
        timePlayed.current = 0;
        setShouldPlayAd(false);
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
    adURL,
    duration,
    position,
    premium,
    setAdPlaying,
    setShouldPlayAd,
    shouldPlayAd,
    theme,
    updateTimePlayed,
  ]);
};
