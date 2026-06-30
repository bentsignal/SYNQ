import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet } from "react-native";

type OverlayProps = {
  show: boolean;
  activeOpacity: number;
};

const Overlay = ({ show, activeOpacity }: OverlayProps) => {
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const to = show ? activeOpacity : 0;
    Animated.timing(overlayOpacity, {
      toValue: to,
      duration: 200,
      easing: show ? Easing.out(Easing.ease) : Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [activeOpacity, overlayOpacity, show]);

  const Local = StyleSheet.create({
    overlay: {
      position: "absolute",
      backgroundColor: "black",
      width: "100%",
      height: "100%",
      zIndex: 20,
      opacity: overlayOpacity,
      pointerEvents: show ? "auto" : "none",
    },
  });

  return <Animated.View style={Local.overlay} />;
};

export default Overlay;
