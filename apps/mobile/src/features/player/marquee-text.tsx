import { Text, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedReaction,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { cn } from "~/lib/cn";

/** Wide enough that the text sets its own width, for any real song name. */
const MEASURE_WIDTH = 6000;
/** Points a second: slow enough to read while it moves. */
const SPEED = 28;
const PAUSE_AT_START = 2500;
const PAUSE_AT_END = 1500;
/** Less than this past the edge isn't worth moving for. */
const MIN_TRAVEL = 2;

/**
 * One line of text that, when it doesn't fit, shows the rest: a pause, a slow
 * scroll to the end, a pause, and back, over and over. It runs on the UI
 * thread with a transform. Text that fits stays still, and under Reduce
 * Motion it's truncated as usual. Give it a `key` that changes with the song
 * to start each song from the beginning.
 */
export function MarqueeText({
  text,
  active,
  className,
}: {
  text: string;
  /** Whether it can be seen; it holds still at the start when it can't. */
  active: boolean;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const boxWidth = useSharedValue(0);
  const textWidth = useSharedValue(0);
  const x = useSharedValue(0);

  useAnimatedReaction(
    () => {
      const box = boxWidth.get();
      if (!active || box === 0) return 0;
      const travel = Math.ceil(textWidth.get() - box);
      return travel < MIN_TRAVEL ? 0 : travel;
    },
    (travel, previous) => {
      if (travel === previous) return;
      cancelAnimation(x);
      if (travel === 0) {
        x.set(withTiming(0, { duration: 200 }));
        return;
      }
      const scroll = {
        duration: (travel / SPEED) * 1000,
        easing: Easing.inOut(Easing.ease),
      };
      x.set(0);
      x.set(
        withRepeat(
          withSequence(
            withDelay(PAUSE_AT_START, withTiming(-travel, scroll)),
            withDelay(PAUSE_AT_END, withTiming(0, scroll)),
          ),
          -1,
        ),
      );
    },
    [active],
  );

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: x.get() }],
  }));

  if (reduceMotion) {
    return (
      <Text numberOfLines={1} className={className}>
        {text}
      </Text>
    );
  }
  return (
    <View
      className="overflow-hidden"
      onLayout={(event) => boxWidth.set(event.nativeEvent.layout.width)}
    >
      <Animated.View
        className="flex-row"
        style={[{ width: MEASURE_WIDTH }, style]}
      >
        <Text
          numberOfLines={1}
          className={cn("shrink-0", className)}
          onLayout={(event) => textWidth.set(event.nativeEvent.layout.width)}
        >
          {text}
        </Text>
      </Animated.View>
    </View>
  );
}
