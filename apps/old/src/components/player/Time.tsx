import React, { useEffect, useRef, useState } from "react";
import { Colors } from "@/src/constants/Colors";
import { useThemeContext } from "@/src/context/ThemeProvider";
import { usePlaybackAdContext } from "@/src/features/playback/context/PlaybackAdProvider";
import { formatTime } from "@/src/lib/util";
import { Dimensions, PanResponder, StyleSheet, Text, View } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureType,
} from "react-native-gesture-handler";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import TrackPlayer, {
  State,
  usePlaybackState,
  useProgress,
} from "react-native-track-player";

const Time = () => {
  const interval = 50;

  const { adPlaying } = usePlaybackAdContext();
  const { theme } = useThemeContext();
  const { position, duration } = useProgress(interval);
  const playbackState = usePlaybackState();

  const [elapsedSec, setElapsedSec] = useState(0);
  const [remainingSec, setRemainingSec] = useState(0);

  const preScrubCompletion = useSharedValue(0);
  const postScrubCompletion = useSharedValue(0);
  const allowScrub = useSharedValue(true);
  const scrubbing = useSharedValue(false);
  const sharedDuration = useSharedValue(duration);
  const progressScale = useSharedValue(0);
  const sliderHeight = useSharedValue(1);
  const windowWidth = useSharedValue(Dimensions.get("window").width);

  useEffect(() => {
    if (scrubbing.value) return;
    if (
      !(
        playbackState.state === State.Playing ||
        playbackState.state === State.Paused
      )
    )
      return;
    setElapsedSec(Math.floor(position));
    setRemainingSec(Math.floor(duration) - Math.floor(position));
    updateTimeline();
  }, [position]);

  useEffect(() => {
    allowScrub.value = !adPlaying;
  }, [adPlaying]);

  useEffect(() => {
    if (duration === 0) return;
    progressScale.value = position / duration;
    sharedDuration.value = Math.floor(duration);
  }, [duration]);

  const updateTimeline = () => {
    progressScale.value = withTiming(duration === 0 ? 0 : position / duration, {
      duration: interval,
      easing: Easing.linear,
    });
  };

  const jump = async (newPosition: number) => {
    await TrackPlayer.seekTo(newPosition);
    setTimeout(() => {
      scrubbing.value = false;
    }, interval);
  };

  const updateTimes = (newElapsed: number, newRemaining: number) => {
    setElapsedSec(newElapsed);
    setRemainingSec(newRemaining);
  };

  const handleGesture = Gesture.Pan()
    .onStart((e) => {
      if (!allowScrub.value) return;
      scrubbing.value = true;
      sliderHeight.value = withTiming(1.5, {
        duration: 200,
      });
    })
    .onTouchesMove((e) => {
      if (!allowScrub.value) return;
      const dx = e.allTouches[0].x;
      const multiplier = 1.2;
      const newCompletionRaw =
        preScrubCompletion.value + (dx / windowWidth.value) * multiplier;
      const newCompletion = Math.max(0, Math.min(newCompletionRaw, 1));
      progressScale.value = newCompletion;
      const newElapsed = Math.max(
        0,
        Math.min(
          Math.floor(newCompletion * sharedDuration.value),
          sharedDuration.value,
        ),
      );
      const newRemaining = Math.floor(sharedDuration.value) - newElapsed;
      runOnJS(updateTimes)(newElapsed, newRemaining);
      postScrubCompletion.value = Math.max(0, Math.min(newCompletion, 1));
    })
    .onEnd((e) => {
      if (!allowScrub.value) return;
      const newPosition = Math.min(
        Math.max(0, postScrubCompletion.value * sharedDuration.value),
        sharedDuration.value,
      );
      runOnJS(jump)(newPosition);
      sliderHeight.value = withTiming(1, {
        duration: 200,
      });
    });

  const timelineStyle = useAnimatedStyle(() => ({
    height: 8,
    transform: [{ scaleY: sliderHeight.value }],
    borderRadius: 20 * sliderHeight.value,
  }));

  const progressStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: progressScale.value }],
    borderTopLeftRadius: 20 * sliderHeight.value,
    borderBottomLeftRadius: 20 * sliderHeight.value,
  }));

  return (
    <View style={styles.container}>
      <GestureDetector gesture={handleGesture}>
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
    width: Dimensions.get("window").width * 0.85,
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
    width: Dimensions.get("window").width * 0.85,
    position: "absolute",
    left: 0,
    top: 0,
    height: 8,
  },
  progress: {
    width: Dimensions.get("window").width * 0.85,
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
    // color: '#888',
    color: Colors.text,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
});

export default Time;
