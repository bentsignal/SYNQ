import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  ImageProps,
  ImageSourcePropType,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";

type CrossfadeImageProps = Omit<ImageProps, "source" | "style"> & {
  source: ImageSourcePropType;
  duration?: number;
  style?: StyleProp<ViewStyle>;
};

const sourceKey = (source: ImageSourcePropType) => JSON.stringify(source);

export default function CrossfadeImage({
  source,
  duration = 500,
  style,
  ...props
}: CrossfadeImageProps) {
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

  return (
    <View style={[styles.root, style]}>
      <Animated.Image
        {...props}
        source={displaySource}
        style={[styles.image, { opacity }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    overflow: "hidden",
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    height: "100%",
    width: "100%",
  },
});
