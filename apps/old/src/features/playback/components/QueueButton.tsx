import { Colors } from "@/src/constants/Colors";
import { useOpenPlaybackQueue } from "@/src/features/playback/hooks/use-open-playback-queue";
import { StyleSheet, TouchableOpacity, View } from "react-native";

const QueueButton = () => {
  const { openPlaybackQueue } = useOpenPlaybackQueue();

  return (
    <TouchableOpacity
      style={Local.container}
      activeOpacity={0.5}
      onPress={openPlaybackQueue}
    >
      <View style={Local.top} />
      <View style={Local.line} />
      <View style={Local.line} />
    </TouchableOpacity>
  );
};

const Local = StyleSheet.create({
  container: {
    width: 25,
    height: 25,
  },
  top: {
    borderColor: Colors.text,
    borderWidth: 3,
    borderStyle: "solid",
    borderRadius: 10,
    height: 9,
  },
  line: {
    backgroundColor: Colors.text,
    height: 3,
    borderRadius: 10,
    marginTop: 4,
  },
});

export default QueueButton;
