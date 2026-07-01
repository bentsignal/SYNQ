import { useSkipPlaybackButton } from "@/src/features/playback/hooks/use-skip-playback-button";
import {
  StyleSheet,
  type StyleProp,
  TouchableOpacity,
  View,
  type ViewStyle,
} from "react-native";
import { PlayButton } from "./PausePlayButtons";

const Shape = ({ size, color }: { size: number; color?: string }) => {
  return (
    <>
      <PlayButton size={size} color={color} />
      <View style={Local.second}>
        <PlayButton size={size} color={color} />
      </View>
    </>
  );
};

export const SkipRight = ({
  size,
  color,
  style,
}: {
  size: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}) => {
  const { skip } = useSkipPlaybackButton("right");

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[Local.container, style]}
      onPress={skip}
    >
      <Shape size={size} color={color} />
    </TouchableOpacity>
  );
};

export const SkipLeft = ({
  size,
  color,
  style,
}: {
  size: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}) => {
  const { skip } = useSkipPlaybackButton("left");

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[Local.flipped, Local.container, style]}
      onPress={skip}
    >
      <Shape size={size} color={color} />
    </TouchableOpacity>
  );
};

const Local = StyleSheet.create({
  container: {
    flexDirection: "row",
  },
  flipped: {
    transform: [{ rotate: "180deg" }],
  },
  second: {
    transform: [{ translateX: -5 }],
  },
});
