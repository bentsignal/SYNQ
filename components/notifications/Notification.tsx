import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Animated, PanResponder, StyleSheet, Easing } from 'react-native';
import { Styles } from '@/constants/Styles';

type NotificationProps = {
  message: string;
  show: boolean;
  onDismiss: () => void;
}

const Notification = ({ message, show, onDismiss }: NotificationProps) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (show) {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.in(Easing.ease)
      }).start();
    }
  }, [show]);

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (e, gestureState) => {
      // Move the notification banner as the user swipes
      translateX.setValue(gestureState.dx);
    },
    onPanResponderRelease: (e, { dx, vx }) => {
      // Determine if the swipe is fast enough to dismiss the banner
      if (Math.abs(dx) > 100 || Math.abs(vx) > 0.5) {
        Animated.timing(translateX, {
          toValue: dx > 0 ? 500 : -500, // Swipe right or left
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          setVisible(false);
          onDismiss();
        });
      } else {
        // Snap back if the swipe isn't strong enough
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    },
  });

  if (!visible) return null;

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[BannerStyles.body, Styles.roundedContainer, { 
        opacity: opacity,
        transform: [{ translateX }] 
      }]}
    >
      <Text style={BannerStyles.text}>{message}</Text>
    </Animated.View>
  );

};

export default Notification;

const BannerStyles = StyleSheet.create({
  body: {
    left: 0,
    right: 0,
    backgroundColor: '#333',
    padding: 15,
    marginHorizontal: 10,
  },
  text: {
    color: '#fff',
    fontSize: 16,
  },
});