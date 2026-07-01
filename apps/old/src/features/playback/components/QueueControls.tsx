import LoopButton from "@/src/features/playback/components/LoopButton";
import PausePlayButtons from "@/src/features/playback/components/PausePlayButtons";
import ShuffleButton from "@/src/features/playback/components/ShuffleButton";
import { SkipLeft, SkipRight } from "@/src/features/playback/components/Skip";
import Time from "@/src/features/playback/components/Time";
import { Colors } from "@/src/constants/Colors";
import { useThemeContext } from "@/src/features/theme/context/ThemeProvider";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const QueueControls = () => {
  const { theme } = useThemeContext();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        Local.footer,
        {
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <Time />
      <View style={Local.controlsContainer}>
        <ShuffleButton primary={theme} />
        <View style={Local.centerControlsContainer}>
          <SkipLeft size={20} />
          <PausePlayButtons
            playSize={30}
            pauseHeight={30}
            pauseWidth={9}
            style={Local.pausePlay}
          />
          <SkipRight size={20} />
        </View>
        <LoopButton primary={theme} useBG={false} />
      </View>
    </View>
  );
};

const Local = StyleSheet.create({
  footer: {
    backgroundColor: Colors.popup,
    borderTopWidth: 1,
    borderTopColor: Colors.popup,
    height: 150,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  controlsContainer: {
    flexDirection: "row",
    width: "85%",
    gap: 15,
    justifyContent: "space-between",
    alignItems: "center",
  },
  centerControlsContainer: {
    flexDirection: "row",
    gap: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  pausePlay: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
});
