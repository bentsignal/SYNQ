import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, PanResponder, Animated, Text } from 'react-native';
import { useGlobalContext } from '@/context/GlobalProvider';

const Time = () => {
  const { theme, songPlaying, sound } = useGlobalContext();
  const [duration, setDuration] = useState(120);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [scrubbing, setScrubbing] = useState(false);

  const sliderWidth = useRef(300); // Default width, will be updated
  const panX = useRef(new Animated.Value(0)).current;
  const sliderHeight = useRef(new Animated.Value(7)).current; // New animated value for height

  useEffect(() => {
    if (sound) {
      sound.getStatusAsync().then((status: any) => {
        if (status.isLoaded) {
          setDuration(status.durationMillis || 0);
        }
      });
    }
  }, [sound]);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (sound && !scrubbing) {
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          setCurrentPosition(status.positionMillis);
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [sound, scrubbing]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setScrubbing(true);
        panX.extractOffset();
        // Animate slider height to 1.5x
        Animated.timing(sliderHeight, {
          toValue: 10.5, // 7 * 1.5
          duration: 200,
          useNativeDriver: false,
        }).start();
      },
      onPanResponderMove: Animated.event(
        [null, { dx: panX }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        panX.flattenOffset();
        setScrubbing(false);
        // Animate slider height back to original
        Animated.timing(sliderHeight, {
          toValue: 7,
          duration: 200,
          useNativeDriver: false,
        }).start();
        if (sound) {
          panX.stopAnimation((value) => {
            const newPosition = Math.max(0, Math.min(value, sliderWidth.current));
            const newTime = (newPosition / sliderWidth.current) * duration;
            sound.setPositionAsync(newTime);
            setCurrentPosition(newTime);
          });
        }
      },
    })
  ).current;

  useEffect(() => {
    const listener = panX.addListener(({ value }) => {
      const newPosition = Math.max(0, Math.min(value, sliderWidth.current));
      const newTime = (newPosition / sliderWidth.current) * duration;
      setCurrentPosition(newTime);
    });

    return () => {
      panX.removeListener(listener);
    };
  }, [panX, duration]);

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const progressWidth = (currentPosition / duration) * sliderWidth.current;

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.timeline,
          { height: sliderHeight } // Use animated height
        ]}
        onLayout={(event) => {
          sliderWidth.current = event.nativeEvent.layout.width;
        }}
      >
        <Animated.View style={[
          styles.progress, 
          { 
            width: progressWidth, 
            backgroundColor: theme,
            height: sliderHeight // Use animated height
          }
        ]} />
        <Animated.View
          style={[
            styles.thumbContainer,
            {
              transform: [{
                translateX: panX.interpolate({
                  inputRange: [0, sliderWidth.current],
                  outputRange: [0, sliderWidth.current],
                  extrapolate: 'clamp'
                })
              }]
            }
          ]}
          {...panResponder.panHandlers}
        >
          <View style={styles.thumb} />
        </Animated.View>
      </Animated.View>
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>{formatTime(currentPosition)}</Text>
        <Text style={styles.timeText}>{formatTime(duration)}</Text>
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
  timeline: {
    width: '85%',
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
  },
  progress: {
    borderRadius: 5,
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
  },
});

export default Time;
