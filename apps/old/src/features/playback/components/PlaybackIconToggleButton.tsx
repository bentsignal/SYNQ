import { Colors } from "@/src/constants/Colors";
import {
  Image,
  type ImageSourcePropType,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

type PlaybackIconToggleButtonProps = {
  active: boolean;
  icon: ImageSourcePropType;
  onPress: () => void;
  primary?: string;
  useBG?: boolean;
};

const ACTIVE_BACKGROUND = "rgba(255, 255, 255, 0.1)";
const DEFAULT_ACTIVE_TINT = "rgba(20, 20, 20, 0.5)";

const PlaybackIconToggleButton = ({
  active,
  icon,
  onPress,
  primary,
  useBG,
}: PlaybackIconToggleButtonProps) => {
  const tint = primary ?? DEFAULT_ACTIVE_TINT;

  return (
    <TouchableOpacity
      style={[
        Local.container,
        {
          backgroundColor: active && useBG ? ACTIVE_BACKGROUND : "transparent",
          padding: useBG ? 5 : 0,
        },
      ]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <Image
        source={icon}
        style={[
          Local.image,
          {
            tintColor: active ? tint : Colors.text,
          },
        ]}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
};

const Local = StyleSheet.create({
  container: {
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 30,
    height: 30,
  },
});

export default PlaybackIconToggleButton;
