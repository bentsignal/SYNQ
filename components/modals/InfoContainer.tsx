import { View, Text, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { Styles } from '@/constants/Styles';
import { Colors } from '@/constants/Colors';
import { useGlobalContext } from '@/context/GlobalProvider';
import Animated, { Easing, useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

type InfoContainerProps = {
  title: string;
  contentHeight: number;
  children?: React.ReactNode;
};

const InfoContainer = ({ title, contentHeight, children }: InfoContainerProps) => {

  const [open, setOpen] = useState(false);
  const height = useSharedValue(0);
  const rotate = useSharedValue(-45);
  const { theme } = useGlobalContext();

  useEffect(() => {
    // Set the initial height and rotation
    height.value = withTiming(open ? contentHeight : 0, {
      duration: 300,
      easing: Easing.ease,
    });
    rotate.value = withTiming(open ? -135 : -45, {
      duration: 300,
      easing: Easing.ease,
    });
  }, [open, contentHeight]);

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
    <View 
      style={{ 
        flex: 1,
        width: '100%',
      }}
    >
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
        <Text style={[Styles.h3, { color: theme } ]}>
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
              backgroundColor: theme,
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
              backgroundColor: theme,
            }}
          />
        </Animated.View>
      </TouchableOpacity>
      <Animated.View
        style={[animatedContentStyle, {
          width: '100%',
          position: 'relative',
        }]}
      >
        {children}
      </Animated.View>
    </View>
  );
};

export default InfoContainer;
