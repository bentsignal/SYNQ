import { Animated } from "react-native";
import { useEffect, useRef, useState } from "react";
import { Colors } from "@/src/constants/Colors";

type SkeletonProps = {
  show: boolean;
  styles: any;
}

const Skeleton = ({show, styles}: SkeletonProps) => {

  const skeletonAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnimation = useRef(new Animated.Value(1)).current;
  const [render, setRender] = useState(true);

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

    return () => {
      pulse.stop();
    };
  }, [skeletonAnimation]);

  useEffect(() => {
    if (!show) {
      Animated.timing(fadeAnimation, {
        toValue: 0,
        duration: 500,
        useNativeDriver: false,
      }).start(() => {
        setRender(false);
      });
    }
  }, [fadeAnimation, show])

  const backgroundColor = skeletonAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.song, Colors.bone],
  });

  if (!render) return null;

  return (
    <Animated.View style={[{ backgroundColor, opacity: fadeAnimation, }, styles, {
        display: render ? 'flex' : 'none',
      }]} 
      pointerEvents={show ? 'auto' : 'none'}
    />
  );

}

export default Skeleton;
