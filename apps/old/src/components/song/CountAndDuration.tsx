import { useEffect } from "react";
import { Colors } from "@/src/constants/Colors";
import { Styles } from "@/src/constants/Styles";
import { check, getDurationString } from "@/src/lib/util";
import { StyleSheet, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { ListStyles } from "../lists/Styles";

type CountAndDurationProps = {
  songCount: number;
  duration: number;
};

export default function CountAndDuration({
  songCount,
  duration,
}: CountAndDurationProps) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (check(songCount) && check(duration)) {
      opacity.value = withTiming(1, { duration: 500 });
    }
  }, [songCount, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Text style={ListStyles.count}>
        {check(songCount) && `${songCount} song${songCount === 1 ? "" : "s"}`}
        {check(duration) && duration > 0 && `, ${getDurationString(duration)}`}
      </Text>
    </Animated.View>
  );
}
