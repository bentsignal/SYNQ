import { View, Animated, Easing } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useRef, useEffect } from 'react';
import Svg, { Circle } from 'react-native-svg';
import Loading from './Loading';
import { useGlobalContext } from '@/context/GlobalProvider';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const Progress = ({ completion, showCircle }: {completion: number; showCircle: boolean;}) => {

  let completionRef = useRef(new Animated.Value(283)).current;
  let circleOpacityRef = useRef(new Animated.Value(0)).current;
  let globalOpacityRef = useRef(new Animated.Value(0)).current;

  const { 
    
    loadAnimInProgress, loading,
    
    setLoadAnimInProgress 
  
  } = useGlobalContext();

  useEffect(() => {
    let to;
    if (loading) {
      to = 1;
    }
    else {
      to = 0;
    }
    Animated.timing(globalOpacityRef, {
      toValue: to,
      duration: 200,
      easing: loadAnimInProgress ? Easing.out(Easing.ease) : Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [loading]);

  useEffect(() => {
    let to;
    if (showCircle) {
      to = 1;
    }
    else {
      to = 0;
    }
    Animated.timing(circleOpacityRef, {
      toValue: to,
      duration: 200,
      easing: loadAnimInProgress ? Easing.out(Easing.ease) : Easing.in(Easing.ease),
      useNativeDriver: true, 
    }).start();
  }, [showCircle]);

  useEffect(() => {

    let progressValue = Math.abs(((completion / 100) * 283) - 283);
    if (progressValue < 0) {
      progressValue = 0;
    }
    else if (progressValue >= 283) {
      progressValue = 283;
    }

    Animated.timing(completionRef, {
      toValue: progressValue,
      duration: 500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      if (progressValue <= 0) {
        setLoadAnimInProgress(false);
      }
    });

  }, [completion]);

  return (
    <Animated.View
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        opacity: globalOpacityRef,
      }}
    >
      <Svg 
        height="100" 
        width="100" 
        viewBox="0 0 100 100" 
        style={{
          position: 'absolute',
          zIndex: 2,
          width: '100%',
          height: '100%',
        }}
      >
        <AnimatedCircle 
          cx="50"
          cy="50"
          r="45"
          stroke={Colors.main}
          strokeWidth="5"
          fill={'rgba(0, 0, 0, 0)'}
          strokeDasharray={`${45 * 3.14 * 2}`}
          strokeDashoffset={completionRef}   
          opacity={circleOpacityRef} 
        />
      </Svg>
      <Svg 
        height="100" 
        width="100" 
        viewBox="0 0 100 100" 
        style={{
          position: 'absolute',
          zIndex: 1,
          width: '100%',
          height: '100%',
        }}
      >
        <AnimatedCircle 
          cx="50"
          cy="50"
          r="45"
          stroke={Colors.song}
          strokeWidth="5"
          fill={'rgba(0, 0, 0, 0)'}
          strokeDasharray={`${45 * 3.14 * 2}`}
          strokeDashoffset={`${0}`}
          opacity={circleOpacityRef}
        />
      </Svg>
      <Loading height={100} width={200}/>
    </Animated.View>
  );
}

export default Progress;