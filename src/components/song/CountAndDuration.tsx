import { check, getDurationString } from "@/lib/Util";
import { Colors } from "@/src/constants/Colors";
import { Styles } from "@/src/constants/Styles";
import { useEffect } from "react";
import { Text, StyleSheet } from "react-native";
import Animated, { useAnimatedStyle, 
  withTiming, useSharedValue } from "react-native-reanimated";
import { ListStyles } from "../lists/Styles";

type CountAndDurationProps = {
  songCount: number;
  duration: number;
}

export default function CountAndDuration({songCount, duration}: CountAndDurationProps) {

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
        {check(songCount) && `${songCount} song${songCount === 1 ? '' : 's'}`}
        {check(duration) && duration > 0 && `, ${getDurationString(duration)}`}
      </Text>
    </Animated.View>
  );

}

