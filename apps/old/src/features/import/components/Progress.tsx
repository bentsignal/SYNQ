import { Animated, Easing, StyleSheet } from 'react-native';
import { Colors } from '@/src/constants/Colors';
import { useRef, useEffect } from 'react';
import Svg, { Circle } from 'react-native-svg';
import Loading from '@/src/components/Loading';
import { useThemeContext } from '@/src/features/theme/context/ThemeProvider';
import { useImportFlowContext } from '@/src/features/import/context/ImportFlowProvider';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type ProgressProps = {
  completion: number;
  loading: boolean;
  showCircle: boolean;
  linear?: boolean;
}

const Progress = ({ completion, loading, showCircle, linear }: ProgressProps) => {

  let completionRef = useRef(new Animated.Value(283)).current;
  let circleOpacityRef = useRef(new Animated.Value(0)).current;
  let globalOpacityRef = useRef(new Animated.Value(0)).current;

  const { loadAnimInProgress, setLoadAnimInProgress } = useImportFlowContext();

  const { theme } = useThemeContext();

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
    
    if (linear) {
      Animated.timing(completionRef, {
        toValue: progressValue,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => {
        if (progressValue <= 0) {
          setLoadAnimInProgress(false);
        }
      });
    }
    else {
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
    }

  }, [completion]);

  const Local = StyleSheet.create({
    container: {
      justifyContent: 'center',
      alignItems: 'center',
      opacity: globalOpacityRef,
      zIndex: 50,
    },
    svg: {
      position: 'absolute',
      width: '100%',
      height: '100%',
    },
  });

  return (
    <Animated.View style={Local.container}>
      <Svg 
        height="100" 
        width="100" 
        viewBox="0 0 100 100" 
        style={{
          ...Local.svg,
          zIndex: 2,
        }}
      >
        <AnimatedCircle 
          cx="50"
          cy="50"
          r="45"
          stroke={theme}
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
          ...Local.svg,
          zIndex: 1,
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
