import { Colors } from "@/src/constants/Colors";
import { useShufflePlaybackMode } from "@/src/features/playback/hooks/use-shuffle-playback-mode";
import { Image, StyleSheet, TouchableOpacity } from "react-native";

interface ShuffleButtonProps {
  primary?: string;
  useBG?: boolean;
}

const ShuffleButton = ({ primary, useBG }: ShuffleButtonProps) => {
  const { shuffle, toggleShuffle } = useShufflePlaybackMode();
  const tint = primary ? primary : "rgba(20, 20, 20, 0.5)";

  return (
    <TouchableOpacity
      style={{
        padding: useBG ? 5 : 0,
        backgroundColor:
          shuffle && useBG ? "rgba(255, 255, 255, 0.1)" : "transparent",
        borderRadius: 5,
      }}
      activeOpacity={0.7}
      onPress={toggleShuffle}
    >
      <Image
        source={require("@/src/assets/icons/shuffle.png")}
        style={[
          Local.image,
          {
            tintColor: shuffle ? tint : Colors.text,
          },
        ]}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
};

const Local = StyleSheet.create({
  image: {
    width: 30,
    height: 30,
  },
});

export default ShuffleButton;
