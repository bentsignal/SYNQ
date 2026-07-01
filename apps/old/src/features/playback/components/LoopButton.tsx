import { Colors } from "@/src/constants/Colors";
import { useLoopPlaybackMode } from "@/src/features/playback/hooks/use-loop-playback-mode";
import { Image, StyleSheet, TouchableOpacity } from "react-native";

interface LoopButtonProps {
  primary?: string;
  useBG?: boolean;
}

const LoopButton = ({ primary, useBG }: LoopButtonProps) => {
  const { loop, toggleLoop } = useLoopPlaybackMode();
  const tint = primary ? primary : "rgba(20, 20, 20, 0.5)";

  return (
    <TouchableOpacity
      style={{
        padding: useBG ? 5 : 0,
        backgroundColor:
          loop && useBG ? "rgba(255, 255, 255, 0.1)" : "transparent",
        borderRadius: 5,
        justifyContent: "center",
        alignItems: "center",
      }}
      activeOpacity={0.7}
      onPress={toggleLoop}
    >
      <Image
        source={require("@/src/assets/icons/loop.png")}
        style={[
          Local.image,
          {
            tintColor: loop ? tint : Colors.text,
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

export default LoopButton;
