import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, PanResponder, Animated, Text } from 'react-native';
import { useGlobalContext } from '@/context/GlobalProvider';

const Time = () => {

  const { 

    theme, sound,
    duration, currentTime,

    setDuration, setCurrentTime,

  } = useGlobalContext();
  
  const [scrubbing, setScrubbing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startProgress, setStartProgress] = useState(0);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [remainingSec, setRemainingSec] = useState(0);

  const sliderWidth = useRef(300); // Default width, will be updated
  const panX = useRef(new Animated.Value(0)).current;
  const sliderHeight = useRef(new Animated.Value(7)).current; // New animated value for height

  useEffect(() => {
    const elapsed = getSec(currentTime);
    const remaining = getSec(duration);
    if (elapsed != elapsedSec) {
      setElapsedSec(elapsed);
      setRemainingSec(remaining - elapsed);
    }
  }, [scrubbing, currentTime]);

  

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        setScrubbing(true);
        setStartX(evt.nativeEvent.locationX);
        setStartProgress(currentTime / duration);
        // Animate slider height to 1.5x
        Animated.timing(sliderHeight, {
          toValue: 10.5, // 7 * 1.5
          duration: 200,
          useNativeDriver: true,
        }).start();
      },
      onPanResponderMove: (evt, gestureState) => {
        const newProgress = startProgress + (gestureState.dx / sliderWidth.current);
        const clampedProgress = Math.max(0, Math.min(newProgress, 1));
        const newTime = clampedProgress * duration;
        setCurrentTime(newTime);
      },
      onPanResponderRelease: (evt, gestureState) => {
        setScrubbing(false);
        // Animate slider height back to original
        Animated.timing(sliderHeight, {
          toValue: 7,
          duration: 200,
          useNativeDriver: true,
        }).start();
        if (sound) {
          const newProgress = startProgress + (gestureState.dx / sliderWidth.current);
          const clampedProgress = Math.max(0, Math.min(newProgress, 1));
          const newTime = clampedProgress * duration;
          sound.setPositionAsync(newTime);
          setCurrentTime(newTime);
        }
      },
    })
  ).current;

  useEffect(() => {
    const listener = panX.addListener(({ value }) => {
      const newPosition = Math.max(0, Math.min(value, sliderWidth.current));
      const newTime = (newPosition / sliderWidth.current) * duration;
      setCurrentTime(newTime);
    });

    return () => {
      panX.removeListener(listener);
    };
  }, [panX, duration, setCurrentTime]);

  const getSec = (milliseconds: number) => {
    return Math.floor(milliseconds / 1000);
  };

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  useEffect(() => {
    setElapsedSec(0);
    setRemainingSec(getSec(duration));
  }, [duration]);

  const progressWidth = (currentTime / duration) * sliderWidth.current;

  return (
    <View style={styles.container}>
      <View style={styles.timelineContainer}>
        <Animated.View 
          style={[
            styles.timeline,
            { height: sliderHeight } // Use animated height
          ]}
          onLayout={(event) => {
            sliderWidth.current = event.nativeEvent.layout.width;
          }}
          {...panResponder.panHandlers}
        >
          <Animated.View style={[
            styles.progress, 
            { 
              width: progressWidth, 
              backgroundColor: theme,
              height: sliderHeight // Use animated height
            }
          ]} />
        </Animated.View>
      </View>
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>{formatTime(elapsedSec)}</Text>
        <Text style={styles.timeText}>{formatTime(remainingSec)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
    height: 40,
  },
  timelineContainer: {
    width: '85%',
    overflow: 'hidden',
    borderRadius: 5,
  },
  timeline: {
    width: '100%',
    backgroundColor: '#e0e0e0',
  },
  progress: {
    borderRadius: 0,
  },
  thumbContainer: {
    width: 44,
    height: 44,
    position: 'absolute',
    backgroundColor: 'white',
    opacity: 0,
    top: -20,
    left: -22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumb: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '85%',
    marginTop: 10,
  },
  timeText: {
    fontSize: 12,
    color: '#888',
    fontVariant: ['tabular-nums'],
  },
});

export default Time;
