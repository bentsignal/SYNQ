import { Colors } from "@/src/constants/Colors";
import { usePlaybackTimeline } from "@/src/features/playback/hooks/use-playback-timeline";
import { formatTime } from "@/src/lib/util";
import { StyleSheet, Text, View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";

const Time = () => {
  const { elapsedSec, remainingSec, gesture, timelineStyle, progressStyle } =
    usePlaybackTimeline();

  return (
    <View style={styles.container}>
      <GestureDetector gesture={gesture}>
        <View style={styles.timelineContainer}>
          <Animated.View style={[styles.timeline, timelineStyle]}>
            <Animated.View style={styles.progressBackground} />
            <Animated.View
              style={[
                styles.progress,
                progressStyle,
                {
                  backgroundColor: Colors.progress,
                  height: 8,
                  transformOrigin: "left",
                },
              ]}
            />
          </Animated.View>
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{formatTime(elapsedSec)}</Text>
            <Text style={styles.timeText}>{formatTime(remainingSec)}</Text>
          </View>
        </View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    marginTop: 10,
    height: 50,
  },
  timelineContainer: {
    width: "85%",
    paddingTop: 10,
    paddingBottom: 10,
    marginBottom: 10,
  },
  timeline: {
    width: "100%",
    overflow: "hidden",
  },
  progressBackground: {
    backgroundColor: "rgba(232, 232, 232, 0.3)",
    width: "100%",
    position: "absolute",
    left: 0,
    top: 0,
    height: 8,
  },
  progress: {
    width: "100%",
    position: "absolute",
    left: 0,
    top: 0,
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 10,
  },
  timeText: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
});

export default Time;
