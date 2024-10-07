import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, PanResponder, Animated, Text, Easing, Dimensions } from 'react-native';
import { useGlobalContext } from '@/context/GlobalProvider';
import { Colors } from '@/constants/Colors';
import { msToSec } from '@/lib/Util';

const Time = ({ progressColor }: { progressColor: string }) => {

  const { 

    theme, sound,
    duration, currentTime,

    setNewJump,

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
      height: 50,
    },
    timelineContainer: {
      width: Dimensions.get('window').width * 0.85,
      // backgroundColor: 'red',
      paddingTop: 10,
      paddingBottom: 10,
      marginBottom: 10,
      // borderRadius: 20,
    },
    timeline: {
      width: '100%',
      backgroundColor: '#e0e0e0',
      borderRadius: 20,
      overflow: 'hidden',
    },
    progress: {
      // borderRadius: 0,
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

  // Update elapsed/remaining time, as well as progress bar AS LONG AS USER ISN'T SCRUBBING
  const updateTime = (currentTimeMS: number) => {
    const elapsed = msToSec(currentTimeMS);
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
  };

  // update duration
  const updateDuration = (durationMS: number) => {
    setElapsedSec(0);
    setRemainingSec(msToSec(durationMS));
  };

  // jump to a new position in song
  const jump = (newPositionMS: number) => {
    const execJump = async () => {
      try {
        if (newPositionMS && sound) {
          const status = await sound.getStatusAsync();
          if (status.isLoaded) {
            const newPosition: number = Number(newPositionMS);
            await sound.setPositionAsync(newPosition);
          }
        }
      }
      catch (error) {
        console.error('Error setting new audio position:', error);
      }
    }
    execJump();
  }

  useEffect(() => {

    const handleSoundUpdate = async () => {
      if (sound) {
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          // set duration to the total duration of the song
          updateDuration(status.playableDurationMillis);
          // function to update the current time of the song
          sound.setOnPlaybackStatusUpdate((status: any) => {
            if (status.isLoaded && !scrubbing) {
              updateTime(status.positionMillis);
            }
          });
        }
      }
    }

    try {
      handleSoundUpdate();
    } catch (error) {
      console.error('Error in handleSoundUpdate:', error);
    }

  }, [sound]);
  
  // handle scrubbing timeline
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
        const multiplier = 1.2;
        const newCompletion = preScrubCompletion.current + (gestureState.dx / Dimensions.get('window').width * multiplier);
        progressScale.setValue(newCompletion);
        const newElapsed = Math.max(0, Math.min(Math.floor(newCompletion * msToSec(duration)), msToSec(duration)));;
        const newRemaining = msToSec(duration) - newElapsed;
        setElapsedSec(newElapsed);
        setRemainingSec(newRemaining);
        postScrubCompletion.current = newCompletion;
      },
      onPanResponderRelease: (evt, gestureState) => {
        setScrubbing(false);
        jump(postScrubCompletion.current * duration);
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
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(elapsedSec)}</Text>
          <Text style={styles.timeText}>{formatTime(remainingSec)}</Text>
        </View>
      </View>
      
    </View>
  );
};

export default Time;
