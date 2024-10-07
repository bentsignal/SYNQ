import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, PanResponder, Animated, Text, Easing, Dimensions } from 'react-native';
import { useGlobalContext } from '@/context/GlobalProvider';
import { Colors } from '@/constants/Colors';
import { msToSec } from '@/lib/Util';

const Time = ({ progressColor }: { progressColor: string }) => {

  const { 

    theme, sound,
    duration, currentTime,

    setCurrentTime, setNewJump,

  } = useGlobalContext();
  
  const [scrubbing, setScrubbing] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(msToSec(currentTime));
  const [remainingSec, setRemainingSec] = useState(msToSec(duration) - msToSec(currentTime));
  const preScrubCompletion = useRef(0);
  const postScrubCompletion = useRef(0);
  const progressScale = useRef(new Animated.Value(msToSec(currentTime) / msToSec(duration))).current;
  const sliderHeight = useRef(new Animated.Value(1)).current;

  const styles = StyleSheet.create({
    container: {
      width: '100%',
      alignItems: 'center',
      marginTop: 20,
      height: 40,
    },
    timelineContainer: {
      width: Dimensions.get('window').width * 0.85,
      // backgroundColor: 'red',
      paddingTop: 10,
      paddingBottom: 10,
      marginBottom: 10,
      borderRadius: 20,
    },
    timeline: {
      width: '100%',
      backgroundColor: '#e0e0e0',
      borderRadius: 20,
      overflow: 'hidden',
    },
    progress: {
      borderRadius: 0,
      width: Dimensions.get('window').width * 0.85,
      position: 'absolute',
      left: 0,
      top: 0,
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

  // Update elapsed/remaining time, as well as progress bar AS LONG AS USER ISN'T SCRUBBING
  useEffect(() => {
    const elapsed = msToSec(currentTime);
    if (elapsed !== elapsedSec && !scrubbing) {
      const total = msToSec(duration);
      setElapsedSec(elapsed);
      setRemainingSec(total - elapsed);
      Animated.timing(progressScale, {
        toValue: elapsed / total,
        duration: 1000,
        useNativeDriver: true,
        easing: Easing.linear,
      }).start();
    }
  }, [currentTime]);

  // set elapsed to 0 and remaining time to duration on call from miniplayer
  useEffect(() => {
    setElapsedSec(0);
    setRemainingSec(msToSec(duration));
  }, [duration]);
  
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        setScrubbing(true);
        preScrubCompletion.current = (progressScale as any)._value;
        // // Animate slider height to 1.5x
        Animated.timing(sliderHeight, {
          toValue: 1.5, 
          duration: 200,
          useNativeDriver: true,
        }).start();
      },
      onPanResponderMove: (evt, gestureState) => {
        console.log('preScrubCompletion', preScrubCompletion.current);
        const newCompletion = preScrubCompletion.current + (gestureState.dx / Dimensions.get('window').width * 0.85);
        progressScale.setValue(newCompletion);
        const newElapsed = Math.max(0, Math.min(Math.floor(newCompletion * msToSec(duration)), msToSec(duration)));;
        const newRemaining = msToSec(duration) - newElapsed;
        setElapsedSec(newElapsed);
        setRemainingSec(newRemaining);
        postScrubCompletion.current = newCompletion;
      },
      onPanResponderRelease: (evt, gestureState) => {
        setScrubbing(false);
        setNewJump(postScrubCompletion.current * duration);
        // Animate slider height back to original
        Animated.timing(sliderHeight, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

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
                backgroundColor: progressColor,
                height: 7,
                transform: [{ scaleX: progressScale }],
                transformOrigin: 'left',
              }
            ]}
          />
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
