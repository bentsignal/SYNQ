import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { View, StyleSheet, PanResponder, Animated, Text, Easing, Dimensions } from 'react-native';
import { useGlobalContext } from '@/context/GlobalProvider';
import { Colors } from '@/constants/Colors';
import { msToSec } from '@/lib/Util';
import { jump } from '@/lib/SoundManager';
import TrackPlayer, { useProgress } from 'react-native-track-player';

const Time = ({ progressColor }: { progressColor?: string }) => {

  const { 

    theme, sound,
    rewind, songPlaying,

    setRewind,

    playNextSong,

  } = useGlobalContext();

  const { position, duration } = useProgress(50);
  
  const [scrubbing, setScrubbing] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [remainingSec, setRemainingSec] = useState(0);
  const preScrubCompletion = useRef(0);
  const postScrubCompletion = useRef(0);
  const progressScale = useRef(new Animated.Value(0)).current;
  const sliderHeight = useRef(new Animated.Value(1)).current;
  const [localTime, setLocalTime] = useState(0);
  const [jumpPos, setJumpPos] = useState(-1);

  useEffect(() => {
    setElapsedSec(Math.floor(position));
    setRemainingSec(Math.floor(duration) - Math.floor(position));
  }, [position]);

  // gets initial elapsed and remaining time, and sets the progress slider to appropriate position
  const checkTime = async () => {
    if (sound) {
      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        setElapsedSec(msToSec(status.positionMillis));
        setRemainingSec(duration - msToSec(status.positionMillis));
        progressScale.setValue(status.positionMillis / duration);
      }
    }
  }

  // called when sound is updated
  const handleSoundUpdate = async () => {
    if (sound) {
      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        // function to update the current time of the song
        sound.setOnPlaybackStatusUpdate((status: any) => {
          if (status.isLoaded) {
            setLocalTime(status.positionMillis);
            if (status.didJustFinish) {
              playNextSong();
            }
          }
        });
      }
    }
    else {
      console.log('sound is null');
    }
  }

  // Update elapsed/remaining time, as well as progress bar AS LONG AS USER ISN'T SCRUBBING
  const updateTime = (currentTimeMS: number, animate: boolean = true) => {
    const elapsed = msToSec(currentTimeMS);
    if (!scrubbing && !rewind && elapsed !== elapsedSec) {
      setElapsedSec(elapsed);
      setRemainingSec(duration - elapsed > 0 ? duration - elapsed : 0);
      if (animate) {
        Animated.timing(progressScale, {
          toValue:  duration === 0 ? 0 : elapsed / duration,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.linear,
        }).start();
      }
      else {
        progressScale.setValue(duration === 0 ? 0 : elapsed / duration);
      }
    }
  };

  // jump to a new position in song
  const jumpToPosition = (newPositionMS: number) => {
    const execJump = async () => {
      try {
        await jump(sound, newPositionMS);
        setScrubbing(false);
      }
      catch (error) {
        console.log('Error jumping to position:', error);
        setScrubbing(false);
      }
    }
    execJump();
  }

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // called when timeline is dragged and then dropped
  useEffect(() => {
    if (jumpPos > 0) {
      jumpToPosition(jumpPos);
    }
  }, [jumpPos])

  // called when left skip is pressed
  useEffect(() => {
    const rewindToBeginning= async () => {
    if (rewind) {
      setElapsedSec(0);
      setRemainingSec(duration);
      progressScale.setValue(0);
      setRewind(false);
    }
  }
    rewindToBeginning();
  }, [rewind])

  // called when going from queue and then navigating back to player
  useFocusEffect(
    useCallback(() => {
      checkTime();
      handleSoundUpdate();
    }, [])
  );

  // called before first render
  useLayoutEffect(() => {
    
    checkTime();
    handleSoundUpdate();

  }, []);

  useEffect(() => {
    progressScale.setValue(0);
  }, [songPlaying]);

  // called by handleSoundUpdate, makes actual call to updateTime. 
  // Fixed stale state issue awhile back 
  useEffect(() => {
    updateTime(localTime);
  }, [localTime]);

  // handle song change, updates times as song plays
  useEffect(() => {

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
        // Animate slider height to 1.5x
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
        const newElapsed = Math.max(0, Math.min(Math.floor(newCompletion * duration), duration));
        const newRemaining = duration - newElapsed;
        setElapsedSec(newElapsed);
        setRemainingSec(newRemaining);
        postScrubCompletion.current = Math.max(0, Math.min(newCompletion, 1));
      },
      onPanResponderRelease: (evt, gestureState) => {
        const newPosition = Math.max(100, postScrubCompletion.current * duration);
        setJumpPos(newPosition);
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
