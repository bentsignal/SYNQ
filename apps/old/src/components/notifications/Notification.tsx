import React, { useEffect, useRef, useState } from "react";
import { Colors } from "@/src/constants/Colors";
import CFG from "@/src/constants/Config";
import { Styles } from "@/src/constants/Styles";
import { NotificationType } from "@/src/constants/Types";
import { useNotificationsContext } from "@/src/features/notifications/context/NotificationsProvider";
import { useThemeContext } from "@/src/features/theme/context/ThemeProvider";
import { useHaptics } from "@/src/hooks/use-haptics";
import {
  Animated,
  Easing,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";

type NotificationProps = {
  id: string;
  type: NotificationType;
  title: string;
  brief: string;
  message: string;
  trace: string;
  onClick: () => void;
};

const Notification = ({
  id,
  type,
  title,
  brief,
  message,
  trace,
  onClick,
}: NotificationProps) => {
  const translateX = useRef(new Animated.Value(600)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const [visible, setVisible] = useState(true);

  const {
    setNotificationType,
    setNotificationMessage,
    setNotificationTitle,
    setNotificationTrace,
    removeNotification,
  } = useNotificationsContext();

  const { theme } = useThemeContext();
  const { sendHaptic } = useHaptics();

  useEffect(() => {
    if (type === NotificationType.ERROR) {
      sendHaptic("error");
    } else {
      sendHaptic("light");
    }
    Animated.timing(translateX, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start(() => {
      setTimeout(() => {
        hideBanner();
      }, CFG.notificationDuration);
    });
  }, []);

  const hideBanner = () => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start(() => {
      removeNotification(id);
      setVisible(false);
    });
  };

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
      style={[
        BannerStyles.body,
        Styles.roundedContainer,
        Styles.backgroundBlendShadow,
        {
          opacity: opacity,
          backgroundColor:
            type === NotificationType.GENERAL ? theme : Colors.error,
          transform: [{ translateX }],
        },
      ]}
    >
      <TouchableOpacity
        style={{
          flexDirection: "row",
          width: "100%",
        }}
        activeOpacity={0.7}
        onPress={() => {
          setNotificationMessage(message);
          setNotificationTitle(title);
          setNotificationType(type);
          setNotificationTrace(trace);
          onClick();
          hideBanner();
        }}
      >
        <Text
          style={[
            BannerStyles.title,
            {
              display: title ? "flex" : "none",
            },
          ]}
        >
          {title} ▸
        </Text>
        <Text style={[BannerStyles.brief]} numberOfLines={1}>
          {brief}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const BannerStyles = StyleSheet.create({
  body: {
    padding: 15,
    marginHorizontal: 10,
    marginBottom: 10,
    zIndex: 11,
    width: "95%",
    overflow: "hidden",
  },
  brief: {
    color: "black",
    fontSize: 16,
    flex: 1,
  },
  title: {
    color: "black",
    fontSize: 16,
    fontWeight: "bold",
    paddingRight: 5,
  },
});

export default Notification;
