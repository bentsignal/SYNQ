import { useCallback, useEffect, useState } from "react";
import { Dimensions } from "react-native";
import { Gesture } from "react-native-gesture-handler";
import {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { State, usePlaybackState, useProgress } from "react-native-track-player";

import { usePlaybackAdContext } from "@/src/features/playback/context/PlaybackAdProvider";
import {
  clampTimelineCompletion,
  getPlaybackProgressCompletion,
  getPlaybackTimelineSeconds,
  getScrubbedTimelineTimes,
  getTimelineSeekPosition,
} from "@/src/features/playback/lib/playback-timeline-service";
import { seekToPlaybackPosition } from "@/src/features/playback/lib/playback-transport-service";

const PROGRESS_INTERVAL = 50;
const SCRUB_SCALE_MULTIPLIER = 1.2;
const TIMELINE_HEIGHT = 8;
const TIMELINE_RADIUS = 20;
const SCRUBBED_TIMELINE_SCALE = 1.5;
const SCRUB_ANIMATION_DURATION = 200;

export function usePlaybackTimeline() {
  const { adPlaying } = usePlaybackAdContext();
  const { position, duration } = useProgress(PROGRESS_INTERVAL);
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

  const updateTimeline = useCallback(() => {
    progressScale.value = withTiming(
      getPlaybackProgressCompletion({ duration, position }),
      {
        duration: PROGRESS_INTERVAL,
        easing: Easing.linear,
      },
    );
  }, [duration, position, progressScale]);

  useEffect(() => {
    if (scrubbing.value) return;
    if (
      !(
        playbackState.state === State.Playing ||
        playbackState.state === State.Paused
      )
    )
      return;
    const nextTimes = getPlaybackTimelineSeconds({ duration, position });
    setElapsedSec(nextTimes.elapsedSec);
    setRemainingSec(nextTimes.remainingSec);
    updateTimeline();
  }, [duration, playbackState.state, position, scrubbing, updateTimeline]);

  useEffect(() => {
    allowScrub.value = !adPlaying;
  }, [adPlaying, allowScrub]);

  useEffect(() => {
    if (duration === 0) return;
    progressScale.value = position / duration;
    sharedDuration.value = Math.floor(duration);
  }, [duration, position, progressScale, sharedDuration]);

  const jump = useCallback(
    async (newPosition: number) => {
      await seekToPlaybackPosition(newPosition);
      setTimeout(() => {
        scrubbing.value = false;
      }, PROGRESS_INTERVAL);
    },
    [scrubbing],
  );

  const updateTimes = useCallback((newElapsed: number, newRemaining: number) => {
    setElapsedSec(newElapsed);
    setRemainingSec(newRemaining);
  }, []);

  const gesture = Gesture.Pan()
    .onStart(() => {
      if (!allowScrub.value) return;
      scrubbing.value = true;
      sliderHeight.value = withTiming(SCRUBBED_TIMELINE_SCALE, {
        duration: SCRUB_ANIMATION_DURATION,
      });
    })
    .onTouchesMove((event) => {
      if (!allowScrub.value) return;
      const dx = event.allTouches[0].x;
      const newCompletionRaw =
        preScrubCompletion.value +
        (dx / windowWidth.value) * SCRUB_SCALE_MULTIPLIER;
      const newCompletion = clampTimelineCompletion(newCompletionRaw);
      progressScale.value = newCompletion;
      const newTimes = getScrubbedTimelineTimes({
        completion: newCompletion,
        duration: sharedDuration.value,
      });
      runOnJS(updateTimes)(newTimes.elapsedSec, newTimes.remainingSec);
      postScrubCompletion.value = clampTimelineCompletion(newCompletion);
    })
    .onEnd(() => {
      if (!allowScrub.value) return;
      const newPosition = getTimelineSeekPosition({
        completion: postScrubCompletion.value,
        duration: sharedDuration.value,
      });
      runOnJS(jump)(newPosition);
      sliderHeight.value = withTiming(1, {
        duration: SCRUB_ANIMATION_DURATION,
      });
    });

  const timelineStyle = useAnimatedStyle(() => ({
    height: TIMELINE_HEIGHT,
    transform: [{ scaleY: sliderHeight.value }],
    borderRadius: TIMELINE_RADIUS * sliderHeight.value,
  }));

  const progressStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: progressScale.value }],
    borderTopLeftRadius: TIMELINE_RADIUS * sliderHeight.value,
    borderBottomLeftRadius: TIMELINE_RADIUS * sliderHeight.value,
  }));

  return {
    elapsedSec,
    remainingSec,
    gesture,
    timelineStyle,
    progressStyle,
  };
}
