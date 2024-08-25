import { View, Text, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { Colors } from '@/constants/Colors';
import Animated, { Easing, useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

type InfoContainerProps = {
  title: string;
  children?: React.ReactNode;
};

const InfoContainer = ({ title, children }: InfoContainerProps) => {
  const [open, setOpen] = useState(false);
  const height = useSharedValue(0);
  const rotate = useSharedValue(-45);

  useEffect(() => {
    // Set the initial height and rotation
    height.value = withTiming(open ? 200 : 0, {
      duration: 300,
      easing: Easing.ease,
    });
    rotate.value = withTiming(open ? -135 : -45, {
      duration: 300,
      easing: Easing.ease,
    });
  }, [open]);

  const toggleOpen = () => {
    setOpen(!open);
  };

  const animatedContentStyle = useAnimatedStyle(() => {
    return {
      height: height.value,
      opacity: withTiming(open ? 1 : 0, {
        duration: 300,
        easing: Easing.ease,
      }),
    };
  });

  const rotateStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotate.value}deg` }],
    };
  });

  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          width: '100%',
          justifyContent: 'space-between',
          paddingRight: 5,
          paddingTop: 10,
          paddingBottom: 10,
        }}
        onPress={toggleOpen}
        activeOpacity={1}
      >
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: Colors.text }}>
          {title}
        </Text>
        <Animated.View
          style={[rotateStyle, {
            flexDirection: 'row',
            width: 15,
            height: 15,
          }]}
        >
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 3,
              height: 15,
              borderRadius: 100,
              backgroundColor: Colors.text,
            }}
          />
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 15,
              height: 3,
              borderRadius: 100,
              backgroundColor: Colors.text,
            }}
          />
        </Animated.View>
      </TouchableOpacity>
      <Animated.View
        style={[animatedContentStyle, {
          width: '100%',
          position: 'relative',
          overflow: 'hidden',
        }]}
      >
        {children}
      </Animated.View>
    </View>
  );
};

export default InfoContainer;
