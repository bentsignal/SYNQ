import { useEffect } from "react";
import { getDurationString } from "@/src/lib/util";
import { Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { ListStyles } from "@/src/features/library/components/lists/Styles";

type CountAndDurationProps = {
  songCount?: number;
  duration?: number;
};

export default function CountAndDuration({
  songCount,
  duration,
}: CountAndDurationProps) {
  const opacity = useSharedValue(0);
  const hasSongCount = songCount !== undefined && songCount !== null;
  const hasDuration = duration !== undefined && duration !== null;

  useEffect(() => {
    if (hasSongCount && hasDuration) {
      opacity.value = withTiming(1, { duration: 500 });
    }
  }, [duration, hasDuration, hasSongCount, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Text style={ListStyles.count}>
        {hasSongCount && `${songCount} song${songCount === 1 ? "" : "s"}`}
        {hasDuration && duration > 0 && `, ${getDurationString(duration)}`}
      </Text>
    </Animated.View>
  );
}
