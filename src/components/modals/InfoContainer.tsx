import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';
import { Styles } from '@/constants/Styles';
import { Colors } from '@/constants/Colors';
import Animated, { Easing, useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useThemeContext } from '@/src/context/ThemeProvider';

type InfoContainerProps = {
  title: string;
  contentHeight: number;
  children?: React.ReactNode;
};

const InfoContainer = ({ title, contentHeight, children }: InfoContainerProps) => {

  const [open, setOpen] = useState(false);
  const height = useSharedValue(0);
  const rotate = useSharedValue(-45);
  const { theme } = useThemeContext();

  const Local = StyleSheet.create({
    container: {
      flex: 1,
      width: '100%',
    },
    pressable: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      justifyContent: 'space-between',
      paddingRight: 5,
      paddingTop: 10,
      paddingBottom: 10,
    },
    pressableText: {
      ...Styles.h3,
      color: theme,
    },
    arrowContainer: {
      flexDirection: 'row',
      width: 15,
      height: 15,
    },
    arrow: {
      position: 'absolute',
      top: 0,
      left: 0,
      borderRadius: 100,
      backgroundColor: theme,
    },
    topArrow: {
      width: 3,
      height: 15,
    },
    bottomArrow: {
      width: 15,
      height: 3,
    },
    childWrapper: {
      width: '100%',
      position: 'relative',
    }
  })

  useEffect(() => {
    // Set the initial height and rotation
    height.value = withTiming(open ? contentHeight : 0, {
      duration: 300,
      easing: Easing.ease,
    });
    rotate.value = withTiming(open ? -135 : -45, {
      duration: 300,
      easing: Easing.out(Easing.ease),
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
    <View style={Local.container}>
      <TouchableOpacity
        style={Local.pressable}
        onPress={toggleOpen}
        activeOpacity={1}
      >
        <Text style={Local.pressableText}>
          {title}
        </Text>
        <Animated.View style={[rotateStyle, Local.arrowContainer]}>
          <View style={[Local.arrow, Local.topArrow]}/>
          <View style={[Local.arrow, Local.bottomArrow]}/>
        </Animated.View>
      </TouchableOpacity>
      <Animated.View style={[animatedContentStyle, Local.childWrapper]}>
        {children}
      </Animated.View>
    </View>
  );
};

export default InfoContainer;
