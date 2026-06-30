import { useState } from "react";
import { cn } from "@/src/lib/util";
import { View } from "react-native";
import FastImage, { Source } from "react-native-fast-image";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { CoverType, defaultCoverIcons } from "../lib/constants";

type ListCoverProps = {
  image?: string | Source;
  fadeOnLoad?: boolean;
  type: CoverType;
  size?: number;
  containerClass?: string;
  imageClass?: string;
};

export default function ListCover({
  image,
  fadeOnLoad,
  type,
  size = 60,
  containerClass,
  imageClass,
}: ListCoverProps) {
  const [failedToLoad, setFailedToLoad] = useState(false);

  const opacityRef = useSharedValue(fadeOnLoad ? 0 : 1);
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacityRef.value,
  }));

  if (failedToLoad || !image) {
    return <Fallback type={type} size={size} containerClass={containerClass} />;
  }

  return (
    <Animated.View
      style={[animatedStyle, { width: size, height: size }]}
      className={cn(
        "flex items-center justify-center overflow-hidden rounded-xl",
        containerClass,
      )}
    >
      <FastImage
        source={typeof image === "string" ? { uri: image } : image}
        style={{ width: size, height: size }}
        className={imageClass}
        onLoad={() => {
          if (fadeOnLoad) {
            opacityRef.value = withTiming(1, { duration: 300 });
          }
        }}
        onError={() => setFailedToLoad(true)}
      />
    </Animated.View>
  );
}

const Fallback = ({ type, size = 60, containerClass }: ListCoverProps) => {
  const icon = defaultCoverIcons[type];
  const iconSize = size / 3;
  return (
    <View
      className={cn(
        "flex items-center justify-center overflow-hidden rounded-xl bg-gray-300",
        containerClass,
      )}
      style={{ width: size, height: size }}
    >
      <FastImage source={icon} style={{ width: iconSize, height: iconSize }} />
    </View>
  );
};
