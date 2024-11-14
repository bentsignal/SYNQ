import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, PanResponder, Animated, Text, Easing, Dimensions } from 'react-native';
import { useGlobalContext } from '@/context/GlobalProvider';
import { Colors } from '@/constants/Colors';
import TrackPlayer, { useProgress } from 'react-native-track-player';
import { formatTime } from '@/lib/Util';

const Time = ({ progressColor }: { progressColor?: string }) => {

  const interval = 50;

  const { theme, adPlaying } = useGlobalContext();
  const { position, duration } = useProgress(interval);
  
  const scrubbing = useRef(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [remainingSec, setRemainingSec] = useState(0);
  const durationRef = useRef(duration);
  const allowScrub = useRef(true);
  const preScrubCompletion = useRef(0);
  const postScrubCompletion = useRef(0);
  const progressScale = useRef(new Animated.Value(0)).current;
  const sliderHeight = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!scrubbing.current) {
      setElapsedSec(Math.floor(position));
      setRemainingSec(Math.floor(duration) - Math.floor(position));
      updateTimeline();
    }
  }, [position]);

  useEffect(() => {
    allowScrub.current = !adPlaying;
  }, [adPlaying]);

  useEffect(() => {
    if (duration !== 0) {
      progressScale.setValue(position / duration);
      durationRef.current = Math.floor(duration);
    }
  }, [duration]);

  const updateTimeline = () => {
    Animated.timing(progressScale, {
      toValue:  duration === 0 ? 0 : position / duration,
      duration: interval,
      useNativeDriver: true,
      easing: Easing.linear,
    }).start();
  }

  const jump = async (newPosition: number) => {
    await TrackPlayer.seekTo(newPosition);
  }
  
  // handle scrubbing timeline
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => allowScrub.current,
      onMoveShouldSetPanResponder: () => allowScrub.current,
      onPanResponderGrant: (evt) => {
        if (!allowScrub.current) return;
        scrubbing.current = true;
        preScrubCompletion.current = (progressScale as any)._value;
        // Animate slider height to 1.5x
        Animated.timing(sliderHeight, {
          toValue: 1.5, 
          duration: 200,
          useNativeDriver: true,
        }).start();
      },
      onPanResponderMove: (evt, gestureState) => {
        if (!allowScrub.current) return;
        const multiplier = 1.2;
        const newCompletion = preScrubCompletion.current + (gestureState.dx / Dimensions.get('window').width * multiplier);
        progressScale.setValue(newCompletion);
        const newElapsed = Math.max(0, Math.min(Math.floor(newCompletion * durationRef.current), durationRef.current));
        const newRemaining = Math.floor(durationRef.current) - newElapsed;
        setElapsedSec(newElapsed);
        setRemainingSec(newRemaining);
        postScrubCompletion.current = Math.max(0, Math.min(newCompletion, 1));
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (!allowScrub.current) return;
        const newPosition = Math.min(Math.max(0, postScrubCompletion.current * durationRef.current), durationRef.current);
        jump(newPosition).then(() => {
          setTimeout(() => {
            scrubbing.current = false;
          }, interval);
        });
        // Animate slider height back to original
        Animated.timing(sliderHeight, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      <View 
        style={styles.timelineContainer}
        {...panResponder.panHandlers}
      >
        <Animated.View 
          style={[
            styles.timeline,
            { 
              height: 7,
              transform: [{ scaleY: sliderHeight }],
            }
          ]}
        >
          <Animated.View 
            style={[
              styles.progress, 
              { 
                backgroundColor: progressColor ? progressColor : theme,
                height: 7,
                transform: [{ scaleX: progressScale }],
                transformOrigin: 'left',
              }
            ]}
          />
        </Animated.View>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(elapsedSec)}</Text>
          <Text style={styles.timeText}>{formatTime(remainingSec)}</Text>
        </View>
      </View>
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
    height: 50,
  },
  timelineContainer: {
    width: Dimensions.get('window').width * 0.85,
    paddingTop: 10,
    paddingBottom: 10,
    marginBottom: 10,
  },
  timeline: {
    width: '100%',
    backgroundColor: '#e0e0e0',
    borderRadius: 20,
    overflow: 'hidden',
  },
  progress: {
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    width: Dimensions.get('window').width * 0.85,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  timeText: {
    fontSize: 12,
    // color: '#888',
    color: Colors.text,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});

export default Time;
