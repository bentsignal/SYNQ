import { useCallback, useEffect, useRef } from "react";
import { usePremiumContext } from "@/src/features/premium/context/PremiumProvider";
import { usePlaybackAdContext } from "@/src/features/playback/context/PlaybackAdProvider";
import { usePlaybackAdActions } from "@/src/features/playback/hooks/use-playback-ad-actions";
import {
  didAdvanceOneSecond,
  incrementPlaybackAdTimePlayed,
  isAtPlaybackAdBoundary,
  isPlaybackAdTrack,
  shouldPersistPlaybackAdProgress,
} from "@/src/features/playback/lib/playback-ad-progress-service";
import { type Track } from "react-native-track-player";

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
    if (isPlaybackAdTrack(track)) {
      setAdPlaying(true);
      if (premium) {
        skipActiveAdForPremium();
      }
    } else {
      setAdPlaying(false);
    }
  }, [premium, setAdPlaying, skipActiveAdForPremium, track]);

  const updateTimePlayed = useCallback(async () => {
    const result = await incrementPlaybackAdTimePlayed();
    if (result.shouldPlayAd) {
      setShouldPlayAd(true);
    }
  }, [setShouldPlayAd]);

  useEffect(() => {
    if (premium && adPlaying) {
      skipActiveAdForPremium();
      return;
    } else if (premium) return;

    if (isAtPlaybackAdBoundary({ duration, position })) {
      if (!premium && !adPlaying && shouldPlayAd) {
        startAdPlayback();
      } else if (adPlaying) {
        resetAdPlaybackProgress();
        timePlayed.current = 0;
      }
    }

    if (adPlaying) return;

    const current = Math.floor(position);
    if (
      didAdvanceOneSecond({
        currentPosition: position,
        previousPosition: previousPosition.current,
      })
    ) {
      timePlayed.current += 1;
    }
    if (shouldPersistPlaybackAdProgress(timePlayed.current)) {
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
