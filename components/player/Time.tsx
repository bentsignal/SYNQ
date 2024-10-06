import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, PanResponder, Animated, Text, Easing } from 'react-native';
import { useGlobalContext } from '@/context/GlobalProvider';
import { Colors } from '@/constants/Colors';
import { msToSec } from '@/lib/Util';

const Time = ({ progressColor }: { progressColor: string }) => {

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

  const sliderWidth = useRef(new Animated.Value(0)).current;
  const progressScale = useRef(new Animated.Value(0)).current; // New animated value for progress scale
  const sliderHeight = useRef(new Animated.Value(7)).current; // New animated value for height

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
      width: '100%',
      position: 'absolute',
      left: 0,
      top: 0,
    },
    thumbContainer: {
      width: 44,
      height: 44,
      position: 'absolute',
      backgroundColor: 'white',
      opacity: 1,
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
      // color: '#888',
      color: Colors.text,
      fontWeight: '700',
      fontVariant: ['tabular-nums'],
    },
  });

  // Update elapsed and remaining time based on call from miniplayer
  useEffect(() => {
    const elapsed = msToSec(currentTime);
    const total = msToSec(duration);
    if (elapsed != elapsedSec) {
      setElapsedSec(elapsed);
      setRemainingSec(total - elapsed);
      console.log(elapsed / total)
      // animate progress bar using scaleX
      if (!scrubbing) {
        Animated.timing(progressScale, {
          toValue: elapsed / total,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.linear,
        }).start();
      }
    }
  }, [currentTime]);

  // set elapsed to 0 and remaining time to duration on call from miniplayer
  useEffect(() => {
    setElapsedSec(0);
    setRemainingSec(msToSec(duration));
  }, [duration]);

  const pan = () => {
  
  // const panResponder = useRef(
  //   PanResponder.create({
  //     onStartShouldSetPanResponder: () => true,
  //     onMoveShouldSetPanResponder: () => true,
  //     onPanResponderGrant: (evt) => {
  //       setScrubbing(true);
  //       setStartX(evt.nativeEvent.locationX);
  //       setStartProgress(currentTime / duration);
  //       // Animate slider height to 1.5x
  //       Animated.timing(sliderHeight, {
  //         toValue: 10.5, // 7 * 1.5
  //         duration: 200,
  //         useNativeDriver: true,
  //       }).start();
  //     },
  //     onPanResponderMove: (evt, gestureState) => {
  //       const newProgress = startProgress + (gestureState.dx / sliderWidth.current);
  //       const clampedProgress = Math.max(0, Math.min(newProgress, 1));
  //       const newTime = clampedProgress * duration;
  //       setCurrentTime(newTime);
  //     },
  //     onPanResponderRelease: (evt, gestureState) => {
  //       setScrubbing(false);
  //       // Animate slider height back to original
  //       Animated.timing(sliderHeight, {
  //         toValue: 7,
  //         duration: 200,
  //         useNativeDriver: true,
  //       }).start();
  //       if (sound) {
  //         const newProgress = startProgress + (gestureState.dx / sliderWidth.current);
  //         const clampedProgress = Math.max(0, Math.min(newProgress, 1));
  //         const newTime = clampedProgress * duration;
  //         sound.setPositionAsync(newTime);
  //         setCurrentTime(newTime);
  //       }
  //     },
  //   })
  // ).current;

  // useEffect(() => {
  //   const listener = panX.addListener(({ value }) => {
  //     const newPosition = Math.max(0, Math.min(value, sliderWidth.current));
  //     const newTime = (newPosition / sliderWidth.current) * duration;
  //     setCurrentTime(newTime);
  //   });

  //   return () => {
  //     panX.removeListener(listener);
  //   };
  // }, [panX, duration, setCurrentTime]);

  // const progressWidth = (currentTime / duration) * sliderWidth.current;

  }

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.timelineContainer}>
        <Animated.View 
          style={[
            styles.timeline,
            { height: 7 }
          ]}
        >
          <Animated.View style={[
            styles.progress, 
            { 
              backgroundColor: progressColor,
              height: 7,
              transform: [{ scaleX: progressScale }],
              transformOrigin: 'left', // Add this line
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

export default Time;
