import { useEffect } from "react";
import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const COVER_FADE_DELAY_MS = 200;
const COVER_FADE_DURATION_MS = 200;

export const useMiniPlayerCoverFade = (visible: boolean) => {
  const opacity = useSharedValue(0);

  const coverStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  useEffect(() => {
    const timeout = setTimeout(() => {
      opacity.value = withTiming(visible ? 1 : 0, {
        duration: COVER_FADE_DURATION_MS,
      });
    }, COVER_FADE_DELAY_MS);

    return () => {
      clearTimeout(timeout);
    };
  }, [opacity, visible]);

  return {
    coverStyle,
  };
};
