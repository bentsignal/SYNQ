import { TouchableOpacity, View, Text, Animated } from "react-native";
import { useEffect, useRef } from "react";
import { Styles } from "@/constants/Styles";
import { Colors } from "@/constants/Colors";

type SkeletonProps = {
  show: boolean;
  styles: any;
}

const Skeleton = ({show, styles}: SkeletonProps) => {

  const skeletonAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(skeletonAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(skeletonAnimation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );
    pulse.start();
  }, [skeletonAnimation]);

  const backgroundColor = skeletonAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.song, Colors.bone],
  });

  return (
    <Animated.View style={[{ backgroundColor }, styles, {
        display: show ? 'flex' : 'none'
      }]} 
    />
  );
  
}

export default Skeleton;