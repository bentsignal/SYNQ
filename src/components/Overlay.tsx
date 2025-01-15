import { Animated, Easing, StyleSheet } from 'react-native';
import { useEffect, useRef } from 'react';

const Overlay = ({show, activeOpacity}: {show: boolean, activeOpacity: number}) => {

  let overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let to;
    if (show) {
      to = activeOpacity;
    }
    else {
      to = 0;
    }
    Animated.timing(overlayOpacity, {
      toValue: to,
      duration: 200,
      easing: show ? Easing.out(Easing.ease) : Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [show])

  const Local = StyleSheet.create({
    overlay: {
      position: 'absolute',
      backgroundColor: 'black',
      width: '100%',
      height: '100%',
      zIndex: 20,
      opacity: overlayOpacity,
      pointerEvents: show ? 'auto' : 'none',
    }
  });

  return <Animated.View style={Local.overlay}/>

}

export default Overlay;