import { useCrossfadeImage } from "@/src/features/playback/hooks/use-crossfade-image";
import {
  Animated,
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

export default function CrossfadeImage({
  source,
  duration = 500,
  style,
  ...props
}: CrossfadeImageProps) {
  const { displaySource, opacity } = useCrossfadeImage(source, duration);

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
