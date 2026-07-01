import LoopButton from "@/src/features/playback/components/LoopButton";
import PausePlayButtons from "@/src/features/playback/components/PausePlayButtons";
import QueueButton from "@/src/features/playback/components/QueueButton";
import ShuffleButton from "@/src/features/playback/components/ShuffleButton";
import { SkipLeft, SkipRight } from "@/src/features/playback/components/Skip";
import { Dimensions, StyleSheet, View } from "react-native";

export default function PlayerControls() {
  return (
    <>
      <View style={Local.controlsContainer}>
        <View style={Local.centerControlsContainer}>
          <SkipLeft size={25} />
          <PausePlayButtons
            playSize={40}
            pauseHeight={40}
            pauseWidth={12}
            style={Local.pausePlay}
          />
          <SkipRight size={25} />
        </View>
      </View>
      <View style={[Local.controlsContainer, Local.bottomControlsContainer]}>
        <View style={Local.bottomControl}>
          <ShuffleButton useBG={true} />
        </View>
        <View style={Local.bottomControl}>
          <QueueButton />
        </View>
        <View style={Local.bottomControl}>
          <LoopButton useBG={true} />
        </View>
      </View>
    </>
  );
}

const Local = StyleSheet.create({
  controlsContainer: {
    width: Dimensions.get("screen").width * 0.85,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 15,
  },
  centerControlsContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 30,
    marginTop: 10,
    marginBottom: 10,
  },
  bottomControlsContainer: {
    width: Dimensions.get("screen").width * 0.7,
    gap: 30,
    marginTop: 20,
    justifyContent: "space-between",
    alignItems: "center",
  },
  bottomControl: {
    minWidth: 50,
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
