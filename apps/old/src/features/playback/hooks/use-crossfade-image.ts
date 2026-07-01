import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Easing, type ImageSourcePropType } from "react-native";

const sourceKey = (source: ImageSourcePropType) => JSON.stringify(source);

export const useCrossfadeImage = (
  source: ImageSourcePropType,
  duration: number,
) => {
  const opacity = useRef(new Animated.Value(1)).current;
  const [displaySource, setDisplaySource] = useState(source);
  const sourceKeyRef = useRef(sourceKey(source));

  const fadeIn = useCallback(() => {
    opacity.setValue(0);
    Animated.timing(opacity, {
      toValue: 1,
      duration,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }, [duration, opacity]);

  useEffect(() => {
    const nextSourceKey = sourceKey(source);
    if (nextSourceKey === sourceKeyRef.current) {
      return;
    }

    sourceKeyRef.current = nextSourceKey;
    setDisplaySource(source);
    fadeIn();
  }, [fadeIn, source]);

  return {
    displaySource,
    opacity,
  };
};
