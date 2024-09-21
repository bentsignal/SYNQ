import { Animated, Easing, StyleSheet } from 'react-native';
import { useEffect, useRef } from 'react';
import { useGlobalContext } from '@/context/GlobalProvider';

const Overlay = () => {

  const { showOverlay } = useGlobalContext();

  let overlayOpacity = useRef(new Animated.Value(0)).current;
  const active = 0.95;

  useEffect(() => {
    let to;
    if (showOverlay) {
      to = active;
    }
    else {
      to = 0;
    }
    Animated.timing(overlayOpacity, {
      toValue: to,
      duration: 200,
      easing: showOverlay ? Easing.out(Easing.ease) : Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [showOverlay])

  const Local = StyleSheet.create({
    overlay: {
      position: 'absolute',
      backgroundColor: 'black',
      width: '100%',
      height: '100%',
      zIndex: 20,
      opacity: overlayOpacity,
      pointerEvents: showOverlay ? 'auto' : 'none',
    }
  });

  return <Animated.View style={Local.overlay}/>

}

export default Overlay;