import type { ReactNode } from "react";
import type { SharedValue } from "react-native-reanimated";
import { useState } from "react";
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
import { scheduleOnRN } from "react-native-worklets";

import { cn } from "~/lib/cn";
import { FadeView } from "./native-fade";

/** Wide enough that the text sets its own width, for any real song name. */
const MEASURE_WIDTH = 6000;
/** Points a second, at any length: slow enough to read while it moves. */
const SPEED = 30;
const PAUSE_AT_START = 8000;
const PAUSE_AT_END = 3000;
/** Less than this past the edge isn't worth moving for (FadeView.swift agrees). */
const MIN_TRAVEL = 2;
/** How far in from a clipped edge the text fades out. */
const FADE_WIDTH = 16;
/** Closer than this to either end counts as being there. */
const AT_END = 0.5;

/**
 * One line of text that, when it doesn't fit, shows the rest: a pause, a slow
 * scroll to the end at one speed whatever its length, a pause, and back, over
 * and over. It runs on the UI thread with a transform, and fades out at
 * whichever edge cuts something off (`modules/synq-fade`). Text that fits
 * stays still and unfaded, and under Reduce Motion it's truncated as usual.
 * Give it a `key` that changes with the song to start each song from the
 * beginning.
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
  const [phase, setPhase] = useState(0);

  useScroll({ active, boxWidth, textWidth, x });
  useFadePhase({ boxWidth, setPhase, textWidth, x });

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
    <Clip text={text} phase={phase} onWidth={(width) => boxWidth.set(width)}>
      <Animated.View
        collapsable={false}
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
    </Clip>
  );
}

/** The pause, the scroll, the pause, and back, while there's somewhere to go. */
function useScroll({
  active,
  boxWidth,
  textWidth,
  x,
}: {
  active: boolean;
  boxWidth: SharedValue<number>;
  textWidth: SharedValue<number>;
  x: SharedValue<number>;
}) {
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
        easing: Easing.linear,
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
}

/**
 * Tells the mask where the text is. It changes a few times a cycle, not every
 * frame, and the mask animates by itself from there.
 */
function useFadePhase({
  boxWidth,
  setPhase,
  textWidth,
  x,
}: {
  boxWidth: SharedValue<number>;
  setPhase: (phase: number) => void;
  textWidth: SharedValue<number>;
  x: SharedValue<number>;
}) {
  useAnimatedReaction(
    () => {
      const at = x.get();
      if (at > -AT_END) return 0;
      const travel = Math.ceil(textWidth.get() - boxWidth.get());
      return at < AT_END - travel ? 2 : 1;
    },
    (next, previous) => {
      if (previous !== null && next !== previous) {
        scheduleOnRN(setPhase, next);
      }
    },
  );
}

/** Fades at the clipped edges, or cuts them off in a binary without the mask. */
function Clip({
  text,
  phase,
  onWidth,
  children,
}: {
  text: string;
  phase: number;
  onWidth: (width: number) => void;
  children: ReactNode;
}) {
  if (FadeView === null) {
    return (
      <View
        className="overflow-hidden"
        onLayout={(event) => onWidth(event.nativeEvent.layout.width)}
      >
        {children}
      </View>
    );
  }
  return (
    <FadeView
      contentKey={text}
      fadeWidth={FADE_WIDTH}
      phase={phase}
      onLayout={(event) => onWidth(event.nativeEvent.layout.width)}
    >
      {children}
    </FadeView>
  );
}
