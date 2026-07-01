import { StyleSheet, View } from "react-native";

import PausePlayButtons from "@/src/features/playback/components/PausePlayButtons";
import { SkipLeft, SkipRight } from "@/src/features/playback/components/Skip";

type MiniPlayerControlsProps = {
  color: string;
};

const MiniPlayerControls = ({ color }: MiniPlayerControlsProps) => {
  return (
    <View style={Local.buttonContainer}>
      <SkipLeft size={16} color={color} style={Local.buttonWrapper} />
      <PausePlayButtons
        playSize={25}
        pauseHeight={25}
        pauseWidth={7}
        style={Local.playPauseButtonWrapper}
        color={color}
      />
      <SkipRight size={16} color={color} style={Local.buttonWrapper} />
    </View>
  );
};

const Local = StyleSheet.create({
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  playPauseButtonWrapper: {
    width: 35,
    justifyContent: "center",
    alignItems: "center",
    padding: 5,
  },
  buttonWrapper: {
    paddingTop: 5,
    paddingBottom: 5,
  },
});

export default MiniPlayerControls;
