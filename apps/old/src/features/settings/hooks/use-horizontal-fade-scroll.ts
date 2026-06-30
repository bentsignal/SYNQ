import { useCallback, useRef, useState } from "react";
import {
  Animated,
  Easing,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";

export function useHorizontalFadeScroll(endOffset = 200) {
  const leftGradientOpacity = useRef(new Animated.Value(0)).current;
  const rightGradientOpacity = useRef(new Animated.Value(1)).current;
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const fade = useCallback((value: Animated.Value, toValue: number) => {
    Animated.timing(value, {
      toValue,
      duration: 200,
      easing: toValue === 0 ? Easing.out(Easing.ease) : Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, []);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const xOffset = event.nativeEvent.contentOffset.x;

      if (xOffset <= 5 && !atStart) {
        setAtStart(true);
        fade(leftGradientOpacity, 0);
      } else if (xOffset > 5 && atStart) {
        setAtStart(false);
        fade(leftGradientOpacity, 1);
      }

      if (xOffset >= endOffset && !atEnd) {
        setAtEnd(true);
        fade(rightGradientOpacity, 0);
      } else if (xOffset < endOffset && atEnd) {
        setAtEnd(false);
        fade(rightGradientOpacity, 1);
      }
    },
    [
      atEnd,
      atStart,
      endOffset,
      fade,
      leftGradientOpacity,
      rightGradientOpacity,
    ],
  );

  return {
    handleScroll,
    leftGradientOpacity,
    rightGradientOpacity,
  };
}
