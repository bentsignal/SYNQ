import { View, StyleSheet, ScrollView, Animated, Easing, NativeSyntheticEvent, NativeScrollEvent} from "react-native";
import { useRef, useState, useEffect } from "react";
import { Colors } from "@/src/constants/Colors";
import { LinearGradient } from 'expo-linear-gradient';

const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

type HorizontalScrollViewProps = {
  children?: React.ReactNode;
  contentWidth: number;
  containerWidth: number;
  disable?: boolean;
}

const HorizontalScrollView = ({ children, contentWidth, containerWidth, disable }: HorizontalScrollViewProps) => {

  const leftGradientOpacityRef = useRef(new Animated.Value(0)).current;
  const rightGradientOpacityRef = useRef(new Animated.Value(1)).current;

  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [end, setEnd] = useState(contentWidth - containerWidth - 10);

  useEffect(() => {
    setEnd(contentWidth - containerWidth - 10);
  }, [contentWidth, containerWidth]);
  
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {

    const { contentOffset } = event.nativeEvent;
    const xOffset = contentOffset.x;

    // start
    if (xOffset <= 0 && !atStart) {
      setAtStart(true);
      Animated.timing(leftGradientOpacityRef, {
        toValue: 0,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
    else if (xOffset > 0 && atStart) {
      setAtStart(false);
      Animated.timing(leftGradientOpacityRef, {
        toValue: 1,
        duration: 200,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start();
    }

    // end
    if (xOffset >= end && !atEnd) {
      setAtEnd(true);
      Animated.timing(rightGradientOpacityRef, {
        toValue: 0,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
    else if (xOffset < end && atEnd) {
      setAtEnd(false);
      Animated.timing(rightGradientOpacityRef, {
        toValue: 1,
        duration: 200,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }

  const Local = StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      width: '100%',
    },
    gradient: {
      position: 'absolute', 
      top: 0,
      width: 30,
      height: 130, 
      zIndex: 2,
    },
    leftGradient: {
      left: 0,
      opacity: leftGradientOpacityRef,
    },
    rightGradient: {
      right: 0,
      opacity: rightGradientOpacityRef,
    },
    contentWrapper: {
      position: 'relative',
    },
    tintOverlay: {
      height: 100,
      width: '100%',
      backgroundColor: Colors.background,
      position: 'absolute',
      top: 0,
      zIndex: 5,
      opacity: 0.5,
      display: disable ? 'flex' : 'none',
    }
  });

  return (
    <View style={Local.container}>
      <AnimatedGradient
          style={[Local.gradient, Local.leftGradient]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          colors={[ 'rgba(16, 16, 16, 1)', 'rgba(16, 16, 16, 0)']}
          pointerEvents={'none'}
        />
      <ScrollView 
        horizontal
        onScroll={handleScroll}
        style={Local.contentWrapper}
        showsHorizontalScrollIndicator={false}
      >
        {children}
      </ScrollView>
      <AnimatedGradient
        style={[Local.gradient, Local.rightGradient]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 0 }}
        colors={['rgba(16, 16, 16, 1)', 'rgba(16, 16, 16, 0)']}
        pointerEvents={'none'}
      />
      <View style={Local.tintOverlay}/>
    </View>
  );

}

export default HorizontalScrollView;